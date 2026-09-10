/**
 * ==============================================================================
 * ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.
 * ไฟล์: src/lib/utils.ts
 * คำอธิบาย: ฟังก์ชันช่วยเหลือ (Utility Functions), จัดการวันที่แบบไทย (dayjs พ.ศ.)
 *           และตัวช่วยสร้าง Classname (cn)
 * ==============================================================================
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { BookingStatus } from '../types';

// ติดตั้ง Locale ภาษาไทยและ พุทธศักราช (พ.ศ.)
dayjs.extend(buddhistEra);
dayjs.locale('th');

/**
 * รวม Tailwind CSS classes อย่างปลอดภัย
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * แปลงวันที่เป็นข้อความภาษาไทย
 * ตัวอย่าง: formatThaiDate('2026-09-10', 'DD MMMM BBBB') -> "10 กันยายน 2569"
 */
export function formatThaiDate(date: string | Date, format = 'D MMM BBBB'): string {
  if (!date) return '';
  return dayjs(date).format(format);
}

/**
 * แปลงวันที่เป็นชื่อวันย่อ + วันที่ เช่น "พฤ. 10 ก.ย."
 */
export function formatDayShort(date: string | Date): string {
  if (!date) return '';
  return dayjs(date).format('ddd D MMM');
}

/**
 * แปลงสตริงเวลา 'HH:mm' เป็นจำนวนนาทีนับจาก 00:00
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  if (parts.length !== 2) return 0;
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

/**
 * แปลงจำนวนนาทีเป็นสตริงเวลา 'HH:mm'
 */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hh = hours < 10 ? `0${hours}` : `${hours}`;
  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hh}:${mm}`;
}

/**
 * ดึงข้อมูลการแสดงผลของสถานะการจอง (ข้อความ, สี, คลาส)
 */
export function getStatusInfo(status: BookingStatus) {
  switch (status) {
    case 'booked':
      return {
        label: 'จองแล้ว',
        color: '#1B7A8C',
        badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        dotClass: 'bg-cyan-500',
      };
    case 'checked_in':
      return {
        label: 'กำลังใช้งาน',
        color: '#16A34A',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotClass: 'bg-emerald-500 animate-pulse',
      };
    case 'checked_out':
      return {
        label: 'ใช้งานเสร็จสิ้น',
        color: '#64748B',
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
        dotClass: 'bg-slate-400',
      };
    case 'cancelled':
      return {
        label: 'ยกเลิกแล้ว',
        color: '#DC2626',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
        dotClass: 'bg-rose-500',
      };
    case 'no_show':
      return {
        label: 'ไม่มาแสดงตัว (No-show)',
        color: '#DC2626',
        badgeClass: 'bg-red-50 text-red-800 border-red-200',
        dotClass: 'bg-red-500',
      };
    case 'overdue':
      return {
        label: 'ใช้งานเกินเวลา',
        color: '#F59E0B',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        dotClass: 'bg-amber-500 animate-pulse',
      };
    default:
      return {
        label: status,
        color: '#64748B',
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
        dotClass: 'bg-slate-400',
      };
  }
}
