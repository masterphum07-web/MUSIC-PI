import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { lookupBooking, checkIn, checkOut, cancelBooking } from '@/lib/api';
import { Booking } from '@/types';
import { useToast } from '@/components/common/Toast';
import { formatThaiDate, getStatusInfo } from '@/lib/utils';
import {
  Search,
  CheckCircle2,
  Sparkles,
  Clock,
  DoorClosed,
} from 'lucide-react';
import dayjs from 'dayjs';

export interface CheckInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingUpdated?: (updatedBooking: Booking) => void;
  bookings?: Booking[];
  initialTab?: 'checkin' | 'checkout' | 'lookup';
  initialBookingCode?: string;
}

export const CheckInOutModal: React.FC<CheckInOutModalProps> = ({
  isOpen,
  onClose,
  onBookingUpdated,
  bookings = [],
  initialTab = 'checkin',
  initialBookingCode = '',
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'checkin' | 'checkout' | 'lookup'>(initialTab);
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

  // ตั้งค่าเริ่มต้นเมื่อเปิด Modal
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setIsLoading(false);
      setActionLoading(false);

      // ตรวจสอบค่าจาก initialBookingCode ก่อน
      if (initialBookingCode) {
        const codeUpper = initialBookingCode.toUpperCase();
        setBookingCode(codeUpper);
        const localMatch = bookings.find(
          (b) => b.booking_code?.toUpperCase() === codeUpper
        );
        if (localMatch) {
          setBooking(localMatch);
        } else {
          // โหลดข้อมูลอัตโนมัติจาก Backend เมื่อผู้ใช้เปิดผ่าน Deep Link
          setIsLoading(true);
          lookupBooking(codeUpper)
            .then((data) => setBooking(data))
            .catch(() => {})
            .finally(() => setIsLoading(false));
        }
        return;
      }

      // ตรวจสอบข้อมูลจาก localStorage ('wtk_last_booking')
      try {
        const saved = localStorage.getItem('wtk_last_booking');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.booking_code) {
            setRecentBooking(parsed);
            setBookingCode(parsed.booking_code);
            if (parsed.full_name) setFullName(parsed.full_name);

            const matched = bookings.find(
              (b) => b.booking_code?.toUpperCase() === parsed.booking_code.toUpperCase()
            );
            if (matched) setBooking(matched);
            return;
          }
        }
      } catch (e) {}

      setBookingCode('');
      setFullName('');
      setBooking(null);
      setRecentBooking(null);
    }
  }, [isOpen, initialTab, initialBookingCode, bookings]);

  // ตัวช่วยจัดฟอร์แมตรหัสจองอัตโนมัติ (auto uppercase และ auto ใส่ขีด MB-XXXX-XXXX)
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase();
    if (!raw.trim()) {
      setBookingCode('');
      return;
    }
    let val = raw.replace(/[^A-Z0-9]/g, '');
    if (val.startsWith('MB')) {
      val = val.substring(2);
    }
    if (!val) {
      setBookingCode('');
      return;
    }
    let formatted = 'MB-' + val.substring(0, 4);
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
    const interval = setInterval(calculateElapsed, 30000);
    return () => clearInterval(interval);
  }, [booking]);

  // 1. กดเช็คอินทันทีด้วยรหัสจองเพียงอย่างเดียว (Direct 1-Tap Check-in)
  const handleDirectCheckIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = bookingCode.trim().toUpperCase();
    if (!code) {
      toast.error('กรุณากรอกรหัสการจอง', 'โปรดระบุรหัสจอง เช่น MB-2609-MZMN');
      return;
    }

    setActionLoading(true);
    try {
      const res = await checkIn(code, fullName.trim() || undefined);
      toast.success('เช็คอินสำเร็จ!', res.message || 'ยินดีต้อนรับเข้าใช้งานห้องซ้อมดนตรี');
      setBooking(res.booking);
      if (onBookingUpdated) onBookingUpdated(res.booking);
    } catch (err: any) {
      toast.error('เช็คอินไม่สำเร็จ', err.message || 'โปรดตรวจสอบรหัสการจองและเวลาที่ได้รับอนุญาต');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. กดเช็คเอาต์ทันทีด้วยรหัสจองเพียงอย่างเดียว (Direct 1-Tap Check-out)
  const handleDirectCheckOut = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = bookingCode.trim().toUpperCase();
    if (!code) {
      toast.error('กรุณากรอกรหัสการจอง', 'โปรดระบุรหัสจอง เช่น MB-2609-MZMN');
      return;
    }

    setActionLoading(true);
    try {
      const res = await checkOut(code, fullName.trim() || undefined);
      toast.success('เช็คเอาต์เรียบร้อย', res.message || 'บันทึกการส่งมอบห้องซ้อมเรียบร้อยแล้ว ขอบคุณครับ');
      setBooking(res.booking);
      if (onBookingUpdated) onBookingUpdated(res.booking);
    } catch (err: any) {
      toast.error('เช็คเอาต์ไม่สำเร็จ', err.message || 'คิวนี้อาจไม่ได้อยู่ในสถานะกำลังใช้งาน');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. ค้นหาข้อมูลคิวอย่างละเอียด (Detailed Lookup)
  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = bookingCode.trim().toUpperCase();
    if (!code) {
      toast.error('กรุณากรอกรหัสการจอง', 'โปรดระบุรหัสการจองที่ต้องการตรวจสอบ');
      return;
    }

    // เช็คจากแคชหน้าเว็บก่อนทันที (0ms)
    const localMatch = bookings.find((b) => b.booking_code?.toUpperCase() === code);
    if (localMatch) {
      setBooking(localMatch);
    }

    setIsLoading(true);
    try {
      const data = await lookupBooking(code, fullName.trim() || undefined);
      setBooking(data);
      toast.success('พบข้อมูลการจอง', `คิวห้อง ${data.room_id} สถานะ: ${data.status}`);
    } catch (err: any) {
      if (!localMatch) {
        setBooking(null);
        toast.error('ไม่พบข้อมูล', err.message || 'รหัสการจองไม่ตรงกับในระบบ');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ยกเลิกคิว (Cancel / Early Release)
  const handleCancelBooking = async () => {
    if (!booking) return;
    const isConfirmed = window.confirm(
      `คุณต้องการยกเลิกคิวรหัส ${booking.booking_code} (ห้อง ${booking.room_id} วันที่ ${booking.booking_date}) เพื่อคืนห้องว่างให้นักศึกษาท่านอื่นใช่หรือไม่?`
    );
    if (!isConfirmed) return;

    setActionLoading(true);
    try {
      const res = await cancelBooking(booking.booking_code, booking.full_name || undefined, 'ผู้จองขอยกเลิกด้วยตนเอง');
      toast.success('ยกเลิกคิวสำเร็จ!', 'ระบบได้คืนสล็อตเวลาห้องว่างให้ผู้อื่นเรียบร้อยแล้วครับ');
      setBooking(res.booking);
      if (onBookingUpdated) onBookingUpdated(res.booking);
    } catch (err: any) {
      toast.error('ยกเลิกไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการยกเลิกคิว');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" showCloseButton={!actionLoading}>
      <div className="space-y-5 py-1">
        {/* Header with WTK Club Label */}
        <div>
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            ระบบบริการห้องซ้อมดนตรี วทก.
          </span>
          <h2 className="text-xl font-bold text-primary tracking-tight">
            เช็คอิน & เช็คเอาต์ห้องซ้อม
          </h2>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('checkin')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'checkin'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-primary hover:bg-white/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>เช็คอิน</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checkout')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'checkout'
                ? 'bg-primary text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-primary hover:bg-white/60'
            }`}
          >
            <DoorClosed className="w-3.5 h-3.5" />
            <span>เช็คเอาต์ คืนห้อง</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lookup')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'lookup'
                ? 'bg-slate-800 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-primary hover:bg-white/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>❌ ยกเลิก / ตรวจสอบ</span>
          </button>
        </div>

        {/* Quick Recent Booking Chip */}
        {recentBooking && (
          <div className="p-3 bg-blue-50/90 border border-blue-200 rounded-2xl flex items-center justify-between text-xs shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse flex-shrink-0" />
              <div>
                <span className="text-[11px] text-slate-500 block">คิวล่าสุดที่คุณเพิ่งจอง:</span>
                <span className="font-extrabold text-primary font-mono">{recentBooking.booking_code}</span>
                <span className="text-slate-600 ml-1.5">({recentBooking.full_name})</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setBookingCode(recentBooking.booking_code);
                if (recentBooking.full_name) setFullName(recentBooking.full_name);
              }}
              className="px-2.5 py-1 bg-white hover:bg-blue-100 text-primary border border-blue-300 text-[11px] font-bold rounded-lg transition-all shadow-xs flex-shrink-0"
            >
              ใช้รหัสนี้
            </button>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 1: เช็คอินเข้าใช้งาน (Check-in)                   */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'checkin' && (
          <form onSubmit={handleDirectCheckIn} className="space-y-4">
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
              <div className="text-xs text-emerald-900 leading-relaxed">
                🎸 <strong>เช็คอินเข้าใช้งาน:</strong> กรอกเพียง <strong>รหัสการจอง</strong> แล้วกดยืนยันได้ทันที (สามารถเช็คอินได้ตั้งแต่ 15 นาทีก่อนเวลาซ้อม จนถึงไม่เกิน 30 นาทีหลังเวลาเริ่ม)
              </div>

              <Input
                label="รหัสการจอง (Booking Code)"
                placeholder="เช่น MB-2609-MZMN"
                value={bookingCode}
                onChange={handleCodeChange}
                required
                className="font-mono text-base tracking-wider bg-white font-bold text-emerald-900"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={actionLoading}
              disabled={actionLoading || !bookingCode.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600 text-white font-bold py-3.5 shadow-md text-sm rounded-xl"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              ยืนยันเช็คอินเข้าใช้งานห้องซ้อม
            </Button>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: เช็คเอาต์คืนห้อง (Check-out)                  */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'checkout' && (
          <form onSubmit={handleDirectCheckOut} className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="text-xs text-slate-700 leading-relaxed">
                🚪 <strong>เช็คเอาต์ / คืนห้องก่อนเวลา:</strong> เมื่อซ้อมเสร็จเรียบร้อย หรือประสงค์สละสิทธิ์คืนห้อง กรอกรหัสการจองเพื่อส่งมอบคืนห้องซ้อมได้ทันที
              </div>

              <Input
                label="รหัสการจอง (Booking Code)"
                placeholder="เช่น MB-2609-MZMN"
                value={bookingCode}
                onChange={handleCodeChange}
                required
                className="font-mono text-base tracking-wider bg-white font-bold text-slate-900"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={actionLoading}
              disabled={actionLoading || !bookingCode.trim()}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 shadow-md text-sm rounded-xl"
            >
              <DoorClosed className="w-5 h-5 mr-2" />
              ยืนยันเช็คเอาต์และคืนห้องซ้อม
            </Button>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: ดูรายละเอียด / จัดการคิว (Lookup)             */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'lookup' && (
          <form onSubmit={handleLookup} className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <Input
              label="รหัสการจอง (Booking Code)"
              placeholder="เช่น MB-2609-MZMN"
              value={bookingCode}
              onChange={handleCodeChange}
              required
              className="font-mono text-base tracking-wider bg-white"
            />

            <Input
              label="ชื่อ-นามสกุลผู้จอง (ไม่บังคับ)"
              placeholder="ระบุเพื่อเพิ่มความถูกต้อง"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-white text-xs"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isLoading}
              className="w-full font-semibold"
            >
              <Search className="w-4 h-4 mr-1.5" />
              ค้นหาข้อมูลการจอง
            </Button>
          </form>
        )}

        {/* Booking Card Details (แสดงผลเมื่อพบข้อมูลคิว) */}
        {booking && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[11px] text-slate-400">รหัสจอง:</span>
                <span className="text-base font-extrabold text-primary font-mono ml-1.5">
                  {booking.booking_code}
                </span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusInfo(booking.status).badgeClass}`}>
                {getStatusInfo(booking.status).label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">ห้องซ้อม:</span>
                <div className="font-semibold text-slate-800">{booking.room_id}</div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">วันที่ใช้งาน:</span>
                <div className="font-semibold text-slate-800">{formatThaiDate(booking.booking_date)}</div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">เวลาที่จอง:</span>
                <div className="font-bold text-primary font-mono">{booking.start_time} - {booking.end_time} น.</div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">ผู้จอง:</span>
                <div className="font-semibold text-slate-800">{booking.full_name}</div>
              </div>
            </div>

            {/* Live Timer if currently Checked-in */}
            {booking.status === 'checked_in' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span>กำลังใช้งานอยู่ในขณะนี้</span>
                </div>
                <span className="font-extrabold font-mono text-emerald-900 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                  {elapsedMinutes} นาที
                </span>
              </div>
            )}

            {/* Action buttons inside card */}
            <div className="pt-2">
              {booking.status === 'booked' && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-2">
                  <div className="text-[11px] text-rose-800">
                    💡 หากติดธุระหรือไม่สะดวกเข้าใช้งาน สามารถกดยกเลิกการจองเพื่อปล่อยห้องว่างให้นักศึกษาท่านอื่นจองต่อได้ทันทีครับ
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={handleCancelBooking}
                    loading={actionLoading}
                    disabled={actionLoading}
                    className="w-full font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                  >
                    ❌ ยืนยันยกเลิกการจอง / คืนห้องก่อนเวลา
                  </Button>
                </div>
              )}

              {booking.status === 'checked_in' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
                  <div className="text-[11px] text-amber-800">
                    🚪 ซ้อมดนตรีเสร็จเรียบร้อยแล้วใช่ไหม? สามารถกดคืนห้องได้ทันทีแม้ยังไม่หมดเวลาก็ได้ครับ
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleDirectCheckOut}
                    loading={actionLoading}
                    disabled={actionLoading}
                    className="w-full font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                  >
                    🚪 ยืนยันเช็คเอาต์และคืนห้องซ้อม (เสร็จก่อนเวลา)
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
