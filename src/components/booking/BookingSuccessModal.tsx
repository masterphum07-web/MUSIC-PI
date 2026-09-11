import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Booking } from '@/types';
import { Copy, Check, Calendar, AlertTriangle, Sparkles, LogIn, Mail, Send, Clock, ShieldCheck } from 'lucide-react';
import { formatThaiDate } from '@/lib/utils';
import { resendBookingConfirmation } from '@/lib/api';
import { useToast } from '@/components/common/Toast';
import dayjs from 'dayjs';

export interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onOpenCheckIn?: (code: string) => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  isOpen,
  onClose,
  booking,
  onOpenCheckIn,
}) => {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  if (!booking) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(booking.booking_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResendEmail = async () => {
    const target = customEmail.trim() || booking.email;
    if (!target) {
      setShowEmailInput(true);
      return;
    }

    setIsResending(true);
    try {
      await resendBookingConfirmation(booking.booking_code, target);
      setResendSuccess(true);
      toast.success('ส่งอีเมลยืนยันสำเร็จ!', `ส่งรายละเอียดคิวไปที่ ${target} แล้ว`);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch (err: any) {
      toast.error('ไม่สามารถส่งอีเมลได้', err.message || 'กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsResending(false);
    }
  };

  // ลิงก์ตรงสำหรับเช็คอินทันที (1-Tap Deep Link)
  const checkInUrl = `https://masterphum07-web.github.io/MUSIC-PI/?action=checkin&code=${encodeURIComponent(
    booking.booking_code
  )}`;

  // ลิงก์เพิ่มลง Google Calendar
  const getGoogleCalendarUrl = () => {
    const startDate = dayjs(`${booking.booking_date}T${booking.start_time}:00`).format('YYYYMMDDTHHmmss');
    const endDate = dayjs(`${booking.booking_date}T${booking.end_time}:00`).format('YYYYMMDDTHHmmss');
    const title = encodeURIComponent('ซ้อมดนตรี ชมรมดนตรี วทก.');
    const details = encodeURIComponent(
      `รหัสการจอง: ${booking.booking_code}\nผู้จอง: ${booking.full_name}\nห้อง: ${booking.room_id}\nลิงก์เช็คอิน: ${checkInUrl}\nกรุณาเช็คอินหน้าห้องซ้อมก่อนเวลา 15 นาที`
    );
    const location = encodeURIComponent('ห้องซ้อมดนตรี ชั้น 2 อาคารกิจกรรมนักศึกษา วทก.');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
  };

  // สร้าง QR Code ที่สแกนแล้วเปิดหน้าเว็บพร้อมกรอกรหัสและเปิดหน้าเช็คอินทันที
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(
    checkInUrl
  )}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" showCloseButton={true}>
      <div className="text-center py-2 space-y-5">
        {/* Header */}
        {booking.status === 'pending_approval' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600 mx-auto shadow-sm">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">ส่งคำขอจองห้องซ้อมดนตรีสำเร็จ!</h2>
              <p className="text-xs text-slate-500 mt-1">
                คำขอของคุณส่งไปยังผู้ดูแลระบบเรียบร้อยแล้ว อยู่ระหว่างรอการตรวจสอบและอนุมัติ
              </p>
            </div>

            {/* Pending Approval Notice Card */}
            <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-5 space-y-3 text-left">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <Clock className="w-3.5 h-3.5" /> รอการอนุมัติ (Pending Approval)
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                ระบบได้ส่งการแจ้งเตือนไปยังผู้ดูแลระบบและอาจารย์ที่ปรึกษาชมรมเรียบร้อยแล้วครับ
              </p>
              <div className="bg-white rounded-xl p-3.5 border border-amber-200/80 text-xs space-y-2 text-slate-700 shadow-sm">
                <div className="font-semibold text-amber-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>ขั้นตอนถัดไปหลังการจอง</span>
                </div>
                <ul className="space-y-1.5 text-slate-600 text-[11.5px] leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>ผู้ดูแลระบบจะตรวจสอบความเหมาะสมและกดอนุมัติการใช้งานห้อง</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>เมื่ออนุมัติแล้ว <strong>รหัสผ่านเข้าห้องและ QR Code เช็คอิน</strong> จะถูกจัดส่งไปยังอีเมลของคุณทันที</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>หากผู้ดูแลไม่อนุมัติหรือคิวซ้อน ระบบจะส่งอีเมลแจ้งเหตุผลให้ทราบ</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Email notification card */}
            <div className="bg-sky-50/70 rounded-2xl border border-sky-200 p-4 text-left space-y-2 shadow-sm">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-secondary flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-bold text-primary flex items-center gap-1.5">
                    <span>ส่งอีเมลแจ้งคำขอจองเรียบร้อย</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="text-slate-600 mt-1">
                    {booking.email ? (
                      <>
                        ส่งไปยัง: <span className="font-bold text-primary font-mono">{booking.email}</span>
                      </>
                    ) : (
                      <span className="text-amber-700">คิวนี้ยังไม่ได้ระบุอีเมล คุณสามารถกรอกอีเมลเพื่อรอรับผลการอนุมัติได้ครับ</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    💡 <em>หากไม่พบในกล่องข้อความหลัก กรุณาตรวจสอบในโฟลเดอร์ <strong>จดหมายขยะ (Spam / Junk)</strong> หรือ <strong>โปรโมชัน (Promotions)</strong></em>
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Celebration Header */}
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-primary">การจองห้องซ้อมดนตรีสำเร็จ!</h2>
              <p className="text-xs text-slate-500 mt-1">
                ระบบได้บันทึกคิวของคุณเรียบร้อยแล้ว กรุณาบันทึกหรือคัดลอกรหัสเพื่อใช้เช็คอิน
              </p>
            </div>

            {/* Highlighted Booking Code Card */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                รหัสการจองของคุณ (Booking Code)
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-widest text-primary font-mono select-all">
                  {booking.booking_code}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCode}
                  className="text-xs bg-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                      <span className="text-emerald-700 font-bold">คัดลอกรหัสแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500 mr-1" />
                      <span>คัดลอกรหัสจอง</span>
                    </>
                  )}
                </Button>

                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center font-medium transition-all text-xs px-3 py-1.5 gap-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>ลง Google Calendar</span>
                </a>

                {onOpenCheckIn && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onClose();
                      onOpenCheckIn(booking.booking_code);
                    }}
                    className="text-xs bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                  >
                    <LogIn className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    <span>ไปหน้าเช็คอิน</span>
                  </Button>
                )}
              </div>

              {/* QR Code */}
              <div className="pt-3 border-t border-slate-200/80 flex flex-col items-center">
                <div className="p-2.5 bg-white rounded-2xl border-2 border-emerald-200 shadow-md inline-block">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code สำหรับสแกนเช็คอินทันที"
                    width={160}
                    height={160}
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                </div>
                <div className="mt-2 text-center">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    📷 สแกน QR ด้วยกล้องมือถือ เพื่อเช็คอินทันที
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    หรือสามารถแคปภาพหน้าจอนี้เก็บไว้ใช้ยืนยันกับผู้ดูแลได้เลยครับ
                  </p>
                </div>
              </div>
            </div>

            {/* Email Notification & Resend Card */}
            <div className="bg-sky-50/70 rounded-2xl border border-sky-200 p-4 text-left space-y-3 shadow-sm">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-secondary flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-bold text-primary flex items-center gap-1.5">
                    <span>จัดส่งอีเมลยืนยัน & รหัสห้องเรียบร้อย</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="text-slate-600 mt-1">
                    {booking.email ? (
                      <>
                        ส่งไปยัง: <span className="font-bold text-primary font-mono">{booking.email}</span>
                      </>
                    ) : (
                      <span className="text-amber-700">คิวนี้ยังไม่ได้ระบุอีเมล คุณสามารถกรอกอีเมลด้านล่างเพื่อรับรหัสและลิงก์ได้ครับ</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    💡 <em>หากไม่พบในกล่องข้อความหลัก กรุณาตรวจสอบในโฟลเดอร์ <strong>จดหมายขยะ (Spam / Junk)</strong> หรือ <strong>โปรโมชัน (Promotions)</strong></em>
                  </p>
                </div>
              </div>

              {/* Resend actions */}
              <div className="pt-2 border-t border-sky-100 flex flex-wrap items-center gap-2">
                {!showEmailInput ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (booking.email) {
                        handleResendEmail();
                      } else {
                        setShowEmailInput(true);
                      }
                    }}
                    disabled={isResending}
                    className="text-xs bg-white text-secondary border-sky-300 hover:bg-sky-50 font-semibold"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    {isResending ? 'กำลังส่งเมล...' : (booking.email ? 'กดส่งอีเมลยืนยันซ้ำ' : 'ใส่อีเมลเพื่อรับรหัส')}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="email"
                      placeholder="ระบุอีเมล เช่น student@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-xl border border-sky-300 bg-white flex-1 focus:outline-none focus:ring-1 focus:ring-secondary font-mono"
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleResendEmail}
                      disabled={isResending || !customEmail.trim()}
                      className="text-xs font-bold"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      {isResending ? 'ส่ง...' : 'ส่ง'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShowEmailInput(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 px-1"
                    >
                      ยกเลิก
                    </button>
                  </div>
                )}

                {booking.email && !showEmailInput && (
                  <button
                    type="button"
                    onClick={() => setShowEmailInput(true)}
                    className="text-[11px] text-slate-500 hover:text-primary underline"
                  >
                    เปลี่ยนอีเมลรับรหัส
                  </button>
                )}

                {resendSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fadeIn">
                    <Check className="w-3.5 h-3.5" /> ส่งอีเมลสำเร็จแล้ว!
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        {/* Booking Summary Details */}
        <div className="text-left text-xs bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">ผู้จอง:</span>
            <span className="font-semibold text-slate-800">
              {booking.full_name} ({booking.student_year})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">สาขาวิชา:</span>
            <span className="font-semibold text-slate-800">{booking.major}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">วันที่จอง:</span>
            <span className="font-semibold text-slate-800">
              {formatThaiDate(booking.booking_date, 'D MMMM BBBB')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">ช่วงเวลาซ้อม:</span>
            <span className="font-bold text-primary">
              {booking.start_time} - {booking.end_time} น.
            </span>
          </div>
        </div>

        {/* Check-in Rule Alert */}
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-left flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>สำคัญมาก:</strong> กรุณากดเช็คอินหน้าเว็บตั้งแต่ก่อนเริ่มเวลา 15 นาที จนถึงไม่เกิน 30 นาทีหลังเริ่มเวลา หากเลยเวลาเช็คอิน ระบบจะตัดสิทธิ์เป็น No-show และปล่อยห้องให้ผู้อื่นทันทีครับ
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2">
          <Button variant="primary" size="md" onClick={onClose} className="w-full">
            เสร็จสิ้นและกลับสู่หน้าหลัก
          </Button>
        </div>
      </div>
    </Modal>
  );
};
