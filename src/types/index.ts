/**
 * ==============================================================================
 * ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.
 * ไฟล์: src/types/index.ts
 * คำอธิบาย: นิยาม Type และ Interface ทั้งหมดในระบบ (Type-safe ครบวงจร)
 * ==============================================================================
 */

// สถานะของการจอง
export type BookingStatus =
  | 'booked'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show'
  | 'overdue';

// ข้อมูลห้องซ้อมดนตรี
export interface Room {
  room_id: string;
  room_name: string;
  capacity: number;
  equipment_list: string;
  color_hex: string;
  sort_order: number;
  image_url?: string;
}

// ข้อมูลการจองห้องซ้อม
export interface Booking {
  booking_id: string;
  booking_code: string;
  room_id: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string;   // HH:mm
  end_time: string;     // HH:mm
  full_name: string;
  student_year: string;
  major: string;
  phone?: string;
  email?: string;
  party_size: number;
  purpose: string;
  equipment?: string;
  status: BookingStatus;
  created_at: string;
  checkin_at?: string;
  checkout_at?: string;
  cancelled_at?: string;
  cancel_reason?: string;
  admin_note?: string;
  updated_at?: string;
  updated_by?: string;
}

// ข้อมูลการตั้งค่าระบบฝั่ง Public
export interface PublicSettings {
  operating_hours_weekday: string;
  operating_hours_weekend: string;
  min_booking_minutes: number;
  max_booking_hours: number;
  advance_booking_days: number;
  grace_period_minutes: number;
  privacy_mode: boolean;
  system_status: 'open' | 'maintenance';
  announcement_text?: string;
  contact_info?: string;
}

// ข้อมูลวันหยุดหรือปิดปรับปรุงห้อง
export interface Blackout {
  id: string;
  date_from: string;
  date_to: string;
  room_id?: string;
  reason: string;
}

// ข้อมูลสถานะสาธารณะสำหรับหน้า Dashboard
export interface PublicState {
  selected_date: string;
  rooms: Room[];
  bookings: Booking[];
  settings: PublicSettings;
  blackouts: Blackout[];
  server_time: string;
}

// ข้อมูลผู้ดูแลระบบ (Admin User)
export interface AdminUser {
  admin_id: string;
  username: string;
  display_name: string;
  email: string;
  role: 'super_admin' | 'staff';
  is_active?: string | boolean;
  last_login_at?: string;
}

// ผู้รับอีเมลแจ้งเตือน
export interface NotifyRecipient {
  id: string;
  email: string;
  display_name: string;
  notify_on_booking: boolean | string;
  notify_on_cancel: boolean | string;
  notify_on_checkin: boolean | string;
  notify_on_checkout: boolean | string;
  notify_daily_summary: boolean | string;
  is_active: boolean | string;
}

// ข้อมูล Audit Log
export interface AuditLog {
  log_id: string;
  timestamp: string;
  actor_type: 'public' | 'admin' | 'system';
  actor_name: string;
  action: string;
  target_type: string;
  target_id: string;
  detail_json: string;
  user_agent?: string;
  ip_hash?: string;
}

// ข้อมูลแดชบอร์ดสถิติสำหรับแอดมิน
export interface DashboardKPI {
  today_bookings: number;
  active_now: number;
  utilization_rate: number;
  no_show_rate: number;
  total_bookings_all_time: number;
}

export interface DashboardData {
  kpi: DashboardKPI;
  trend30days: Array<{ date: string; count: number }>;
  byRoom: Array<{
    room_id: string;
    room_name: string;
    color_hex: string;
    total_bookings: number;
    total_hours: number;
  }>;
  heatmap: number[][]; // 7 วัน x 24 ชม.
  byYear: Array<{ name: string; value: number }>;
  byMajor: Array<{ name: string; value: number }>;
  topUsers: Array<{
    full_name: string;
    major: string;
    student_year: string;
    count: number;
  }>;
  recentActivity: Array<{
    log_id: string;
    timestamp: string;
    actor_type: string;
    actor_name: string;
    action: string;
    target_type: string;
    target_id: string;
    detail: string;
  }>;
}

// โครงสร้าง Response มาตรฐานจาก Google Apps Script API
export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
