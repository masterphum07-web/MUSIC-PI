/**
 * ==============================================================================
 * ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.
 * ไฟล์: src/lib/api.ts
 * คำอธิบาย: ไคลเอนต์ติดต่อ API Google Apps Script
 *           - ส่ง POST ด้วย Content-Type: 'text/plain;charset=utf-8' เพื่อหลีกเลี่ยง CORS Preflight
 *           - Retry 2 ครั้งแบบ Exponential Backoff (1s, 2s)
 *           - Timeout 20 วินาที
 *           - Type-safe ทุกฟังก์ชัน
 * ==============================================================================
 */

import { ApiResponse, PublicState, Booking, DashboardData, AdminUser, AuditLog } from '../types';

// URL ของ Apps Script Web App (สามารถตั้งค่าผ่าน .env หรือใช้ค่าเริ่มต้น)
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://script.google.com/macros/s/AKfycbxhyoxEr6_YKysnI272d_O047z2cFXMixyAXrvi_jWTVJkXyXjFSrrVkRZ_G6brt5vY/exec';

interface RequestOptions {
  action: string;
  payload?: any;
  token?: string;
}

/**
 * ฟังก์ชันหลักในการยิงคำขอไปยัง Apps Script พร้อมระบบ Timeout และ Retry
 */
async function callApi<T>(options: RequestOptions, maxRetries = 1): Promise<T> {
  const timeoutMs = 35000;
  let attempt = 0;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          // ใช้ text/plain;charset=utf-8 เพื่อเลี่ยง CORS preflight (OPTIONS)
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: options.action,
          payload: options.payload || {},
          token: options.token || '',
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
    } catch (netErr: any) {
      clearTimeout(timer);
      attempt++;
      const isTimeout = netErr.name === 'AbortError';

      if (attempt > maxRetries) {
        if (isTimeout) {
          throw new Error('การเชื่อมต่อไปยังเซิร์ฟเวอร์หมดเวลา (Timeout) กรุณาลองใหม่อีกครั้ง');
        }
        throw new Error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต');
      }

      await new Promise((resolve) => setTimeout(resolve, 800));
      continue;
    }

    if (!response.ok) {
      attempt++;
      if (attempt <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let json: ApiResponse<T>;
    try {
      json = await response.json();
    } catch {
      attempt++;
      if (attempt <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      throw new Error('รูปแบบข้อมูลตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง');
    }

    // หากเป็น Business Logic Error จากเซิร์ฟเวอร์ ให้แสดงผลทันที ไม่ต้อง Retry ให้หมุนค้าง
    if (!json.ok) {
      throw new Error(json.error?.message || 'เกิดข้อผิดพลาดในการประมวลผล');
    }

    return json.data as T;
  }

  throw new Error('การเชื่อมต่อล้มเหลว กรุณาลองใหม่อีกครั้ง');
}

// ==========================================
// 1. PUBLIC API CLIENTS
// ==========================================

export async function getPublicState(date?: string): Promise<PublicState> {
  return callApi<PublicState>({
    action: 'getPublicState',
    payload: { date },
  });
}

export async function checkAvailability(
  roomId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<{ available: boolean; reason?: string }> {
  return callApi<{ available: boolean; reason?: string }>({
    action: 'checkAvailability',
    payload: { room_id: roomId, date, start_time: startTime, end_time: endTime },
  });
}

export async function createBooking(payload: {
  room_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  full_name: string;
  student_year: string;
  major: string;
  party_size: number;
  purpose: string;
  phone?: string;
  email?: string;
  equipment?: string;
  _hp?: string;
}): Promise<Booking> {
  return callApi<Booking>({
    action: 'createBooking',
    payload,
  });
}

export async function lookupBooking(bookingCode: string, fullName: string): Promise<Booking> {
  return callApi<Booking>({
    action: 'lookupBooking',
    payload: { booking_code: bookingCode, full_name: fullName },
  });
}

export async function checkIn(
  bookingCode: string,
  fullName: string
): Promise<{ success: boolean; message: string; booking: Booking }> {
  return callApi<{ success: boolean; message: string; booking: Booking }>({
    action: 'checkIn',
    payload: { booking_code: bookingCode, full_name: fullName },
  });
}

export async function checkOut(
  bookingCode: string,
  fullName: string
): Promise<{ success: boolean; message: string; booking: Booking }> {
  return callApi<{ success: boolean; message: string; booking: Booking }>({
    action: 'checkOut',
    payload: { booking_code: bookingCode, full_name: fullName },
  });
}

export async function cancelBooking(
  bookingCode: string,
  fullName: string,
  reason: string
): Promise<{ success: boolean; message: string; booking: Booking }> {
  return callApi<{ success: boolean; message: string; booking: Booking }>({
    action: 'cancelBooking',
    payload: { booking_code: bookingCode, full_name: fullName, reason },
  });
}

// ==========================================
// 2. ADMIN AUTH API
// ==========================================

export async function adminLogin(
  username: string,
  password: string
): Promise<{ token: string; expires_in_seconds: number; user: AdminUser }> {
  return callApi<{ token: string; expires_in_seconds: number; user: AdminUser }>({
    action: 'adminLogin',
    payload: { username, password },
  });
}

export async function adminLogout(token: string): Promise<{ success: boolean; message: string }> {
  return callApi<{ success: boolean; message: string }>({
    action: 'adminLogout',
    token,
  });
}

// ==========================================
// 3. ADMIN OPERATIONS API
// ==========================================

export async function adminGetDashboard(token: string): Promise<DashboardData> {
  return callApi<DashboardData>({
    action: 'adminGetDashboard',
    token,
  });
}

export async function adminListBookings(
  token: string,
  query: {
    date?: string;
    room_id?: string;
    status?: string;
    student_year?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort_field?: string;
    sort_dir?: 'asc' | 'desc';
  }
): Promise<{ items: Booking[]; total: number; page: number; limit: number; total_pages: number }> {
  return callApi<{ items: Booking[]; total: number; page: number; limit: number; total_pages: number }>({
    action: 'adminListBookings',
    payload: query,
    token,
  });
}

export async function adminUpdateBooking(
  token: string,
  bookingId: string,
  updateData: Partial<Booking>
): Promise<Booking> {
  return callApi<Booking>({
    action: 'adminUpdateBooking',
    payload: { booking_id: bookingId, update_data: updateData },
    token,
  });
}

export async function adminForceCheckout(
  token: string,
  bookingId: string,
  note: string
): Promise<Booking> {
  return callApi<Booking>({
    action: 'adminForceCheckout',
    payload: { booking_id: bookingId, note },
    token,
  });
}

export async function adminGetLogs(
  token: string,
  query: { actor_type?: string; action?: string; search?: string; page?: number; limit?: number }
): Promise<{ items: AuditLog[]; total: number; page: number; limit: number; total_pages: number }> {
  return callApi<{ items: AuditLog[]; total: number; page: number; limit: number; total_pages: number }>({
    action: 'adminGetLogs',
    payload: query,
    token,
  });
}

export async function adminCrudRooms(
  token: string,
  operation: 'list' | 'create' | 'update' | 'delete',
  data?: any
): Promise<any> {
  return callApi<any>({
    action: 'adminCrudRooms',
    payload: { operation, data },
    token,
  });
}

export async function adminCrudRecipients(
  token: string,
  operation: 'list' | 'create' | 'update' | 'delete',
  data?: any
): Promise<any> {
  return callApi<any>({
    action: 'adminCrudRecipients',
    payload: { operation, data },
    token,
  });
}

export async function adminCrudAdmins(
  token: string,
  operation: 'list' | 'create' | 'changePassword' | 'delete',
  data?: any
): Promise<any> {
  return callApi<any>({
    action: 'adminCrudAdmins',
    payload: { operation, data },
    token,
  });
}

export async function adminUpdateSettings(
  token: string,
  settings: Record<string, any>
): Promise<Record<string, any>> {
  return callApi<Record<string, any>>({
    action: 'adminUpdateSettings',
    payload: { settings },
    token,
  });
}

export async function adminExportCSV(
  token: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{ csv_content: string; filename: string }> {
  return callApi<{ csv_content: string; filename: string }>({
    action: 'adminExportCSV',
    payload: { date_from: dateFrom, date_to: dateTo },
    token,
  });
}

export async function adminSendTestEmail(
  token: string,
  email?: string
): Promise<{ success: boolean; sent_to: string; remaining_quota: number }> {
  return callApi<{ success: boolean; sent_to: string; remaining_quota: number }>({
    action: 'adminSendTestEmail',
    payload: { email },
    token,
  });
}
