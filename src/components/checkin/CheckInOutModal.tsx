import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { lookupBooking, checkIn, checkOut, cancelBooking } from '@/lib/api';
import { Booking } from '@/types';
import { useToast } from '@/components/common/Toast';
import { timeToMinutes, formatThaiDate, getStatusInfo } from '@/lib/utils';
import {
  Search,
  CheckCircle,
  LogOut,
  XCircle,
  Clock,
} from 'lucide-react';
import dayjs from 'dayjs';

export interface CheckInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingUpdated?: (updatedBooking: Booking) => void;
  bookings?: Booking[];
}

export const CheckInOutModal: React.FC<CheckInOutModalProps> = ({
  isOpen,
  onClose,
  onBookingUpdated,
  bookings = [],
}) => {
  const toast = useToast();
  const [bookingCode, setBookingCode] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [recentBooking, setRecentBooking] = useState<{
    booking_code: string;
    full_name: string;
    start_time?: string;
    end_time?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);

  // ดึงข้อมูลการจองล่าสุดจาก localStorage เพื่อ Auto-fill อัตโนมัติเมื่อเปิด Modal
  useEffect(() => {
    if (isOpen) {
      setIsLoading(false);
      setActionLoading(false);

      try {
        const saved = localStorage.getItem('wtk_last_booking');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.booking_code && parsed.full_name) {
            setRecentBooking(parsed);
            setBookingCode(parsed.booking_code);
            setFullName(parsed.full_name);

            // หากมีใน bookings ปัจจุบัน ให้แสดงข้อมูลการจองทันที (0ms Instant Load)
            const matched = bookings.find(
              (b) => b.booking_code?.toUpperCase() === parsed.booking_code.toUpperCase()
            );
            if (matched) {
              setBooking(matched);
            }
            return;
          }
        }
      } catch (e) {}

      setBookingCode('');
      setFullName('');
      setBooking(null);
      setRecentBooking(null);
    }
  }, [isOpen, bookings]);

  // ตัวช่วยจัดฟอร์แมตรหัสจองอัตโนมัติ (auto uppercase และ auto ใส่ขีด MB-XXXX-XXXX)
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.startsWith('MB')) {
      val = val.substring(2);
    }
    let formatted = 'MB';
    if (val.length > 0) {
      formatted += '-' + val.substring(0, 4);
    }
    if (val.length > 4) {
      formatted += '-' + val.substring(4, 8);
    }
    setBookingCode(formatted);
  };

  // นับเวลาสดสำหรับคิวที่กำลังเช็คอินใช้งานอยู่
  useEffect(() => {
    if (!booking || booking.status !== 'checked_in' || !booking.checkin_at) {
      return;
    }

    const calculateElapsed = () => {
      const checkinTime = dayjs(booking.checkin_at);
      const diffMins = Math.max(0, dayjs().diff(checkinTime, 'minute'));
      setElapsedMinutes(diffMins);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 30000); // ทุก 30 วินาที
    return () => clearInterval(interval);
  }, [booking]);

  // ค้นหาคิวการจอง (Instant SWR: แสดงผลจาก Local State ทันที 0ms + Sync เซิร์ฟเวอร์)
  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = bookingCode.trim().toUpperCase();
    const name = fullName.trim();

    if (!code || !name) {
      toast.error('กรุณากรอกข้อมูลให้ครบ', 'โปรดระบุทั้งรหัสการจองและชื่อ-นามสกุลจริง');
      return;
    }

    // 1. ตรวจสอบจาก bookings ในหน่วยความจำก่อนทันที (0ms Instant Load)
    const localMatch = bookings.find(
      (b) => b.booking_code?.toUpperCase() === code
    );
    if (localMatch) {
      setBooking(localMatch);
    }

    setIsLoading(true);
    try {
      const data = await lookupBooking(code, name);
      setBooking(data);
      toast.success('พบข้อมูลการจอง', `คิวห้อง ${data.room_id} สถานะ: ${data.status}`);
    } catch (err: any) {
      if (!localMatch) {
        setBooking(null);
        toast.error('ไม่พบข้อมูล', err.message || 'รหัสการจองหรือชื่อไม่ตรงกับในระบบ');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ดำเนินการเช็คอิน
  const handleCheckIn = async () => {
    if (!booking) return;
    setActionLoading(true);
    try {
      const res = await checkIn(booking.booking_code, booking.full_name);
      toast.success('เช็คอินสำเร็จ!', res.message);
      setBooking(res.booking);
      if (onBookingUpdated) onBookingUpdated(res.booking);
    } catch (err: any) {
      toast.error('เช็คอินไม่สำเร็จ', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ดำเนินการเช็คเอาต์
  const handleCheckOut = async () => {
    if (!booking) return;
    setActionLoading(true);
    try {
      const res = await checkOut(booking.booking_code, booking.full_name);
      toast.success('เช็คเอาต์เรียบร้อย', res.message);
      setBooking(res.booking);
      if (onBookingUpdated) onBookingUpdated(res.booking);
    } catch (err: any) {
      toast.error('เช็คเอาต์ไม่สำเร็จ', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ยกเลิกการจอง
  const handleCancelBooking = async () => {
    if (!booking) return;
    const reason = window.prompt('กรุณาระบุเหตุผลในการยกเลิกคิว (ไม่บังคับ):', 'ติดธุระด่วน');
    if (reason === null) return; // กดยกเลิกใน Prompt

    setActionLoading(true);
    try {
      const res = await cancelBooking(booking.booking_code, booking.full_name, reason || 'ผู้จองขอยกเลิก');
      toast.success('ยกเลิกคิวสำเร็จ', 'ระบบได้คืนสล็อตเวลาห้องว่างให้ผู้อื่นแล้ว');
      setBooking(res.booking);
      if (onBookingUpdated) onBookingUpdated(res.booking);
    } catch (err: any) {
      toast.error('ยกเลิกไม่สำเร็จ', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // คำนวณช่วงเวลาอนุญาตเช็คอิน
  const currentMins = timeToMinutes(dayjs().format('HH:mm'));
  const isToday = booking?.booking_date === dayjs().format('YYYY-MM-DD');
  const startMins = booking ? timeToMinutes(booking.start_time) : 0;
  const canCheckIn = isToday && currentMins >= startMins - 15 && currentMins <= startMins + 30;
  const isTooEarly = isToday && currentMins < startMins - 15;
  const minsUntilCheckIn = isTooEarly ? (startMins - 15) - currentMins : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" showCloseButton={!actionLoading}>
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-primary">เช็คอิน / เช็คเอาต์ห้องซ้อมดนตรี</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            กรอกรหัสการจองและชื่อจริงเพื่อเข้าใช้งานหรือคืนห้องซ้อม
          </p>
        </div>

        {/* Quick Recent Booking Suggestion */}
        {recentBooking && (
          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <div>
                <span className="text-[11px] text-slate-500 block">พบข้อมูลคิวล่าสุดของคุณ:</span>
                <span className="font-bold text-primary font-mono">{recentBooking.booking_code}</span>
                <span className="text-slate-600 ml-1.5 font-medium">({recentBooking.full_name})</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setBookingCode(recentBooking.booking_code);
                setFullName(recentBooking.full_name);
                handleLookup();
              }}
              className="px-3 py-1 bg-primary text-white text-[11px] font-semibold rounded-lg hover:bg-primary-dark transition-all shadow-sm flex-shrink-0"
            >
              โหลดคิวนี้ (0ms)
            </button>
          </div>
        )}

        {/* Search Form */}
        <form onSubmit={handleLookup} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <Input
            label="รหัสการจอง (Booking Code)"
            placeholder="เช่น MB-2609-A3F7"
            value={bookingCode}
            onChange={handleCodeChange}
            required
            className="font-mono text-base tracking-wider"
          />

          <Input
            label="ชื่อ-นามสกุลจริงของผู้จอง"
            placeholder="ต้องตรงกับที่กรอกตอนจอง"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isLoading}
            className="w-full font-semibold"
          >
            <Search className="w-4 h-4 mr-1.5" />
            ค้นหาคิวการจอง
          </Button>
        </form>

        {/* Booking Details Card & Action Buttons */}
        {booking && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[11px] text-slate-400">รหัสจอง:</span>
                <span className="text-base font-bold text-primary font-mono ml-1.5">
                  {booking.booking_code}
                </span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusInfo(booking.status).badgeClass}`}>
                {getStatusInfo(booking.status).label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">ห้องซ้อม:</span>
                <div className="font-semibold text-slate-800">{booking.room_id}</div>
              </div>
              <div>
                <span className="text-slate-400">วันที่:</span>
                <div className="font-semibold text-slate-800">{formatThaiDate(booking.booking_date)}</div>
              </div>
              <div>
                <span className="text-slate-400">ช่วงเวลาจอง:</span>
                <div className="font-bold text-primary">{booking.start_time} - {booking.end_time} น.</div>
              </div>
              <div>
                <span className="text-slate-400">ผู้จอง:</span>
                <div className="font-semibold text-slate-800">{booking.full_name} ({booking.student_year})</div>
              </div>
            </div>

            {/* Action 1: Status = BOOKED */}
            {booking.status === 'booked' && (
              <div className="pt-2 space-y-3">
                {canCheckIn ? (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCheckIn}
                    loading={actionLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600 text-white font-bold py-3 shadow-md"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    กดเช็คอินเข้าใช้งานทันที
                  </Button>
                ) : isTooEarly ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      ยังไม่ถึงเวลาเช็คอิน ระบบจะเปิดให้เช็คอินได้ล่วงหน้า 15 นาที (อีกประมาณ {minsUntilCheckIn} นาที)
                    </span>
                  </div>
                ) : !isToday ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                    คิวนี้ไม่ได้จองไว้สำหรับวันนี้ (วันที่จองคือ {formatThaiDate(booking.booking_date)})
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                    เลยกำหนดเวลาเช็คอินเกิน 30 นาทีแล้ว ระบบจะตัดสิทธิ์เป็น No-show
                  </div>
                )}

                {/* Cancel Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleCancelBooking}
                    disabled={actionLoading}
                    className="text-xs text-rose-600 hover:text-rose-800 hover:underline inline-flex items-center gap-1 focus:outline-none"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>ยกเลิกการจองนี้</span>
                  </button>
                </div>
              </div>
            )}

            {/* Action 2: Status = CHECKED_IN */}
            {booking.status === 'checked_in' && (
              <div className="pt-2 space-y-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>กำลังใช้งานห้องซ้อม</span>
                  </div>
                  <strong className="text-sm text-emerald-800 font-mono">
                    ใช้ไปแล้ว {elapsedMinutes} นาที
                  </strong>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCheckOut}
                  loading={actionLoading}
                  className="w-full bg-primary hover:bg-primary-dark font-bold py-3 shadow-md"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  กดเช็คเอาต์คืนห้องซ้อม
                </Button>
              </div>
            )}

            {/* Action 3: Status = CHECKED_OUT / CANCELLED */}
            {(booking.status === 'checked_out' || booking.status === 'cancelled') && (
              <div className="pt-2 text-center text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
                คิวนี้เสร็จสิ้นการทำงานแล้ว ({getStatusInfo(booking.status).label})
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
