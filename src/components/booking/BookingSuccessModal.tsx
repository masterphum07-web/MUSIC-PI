import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Booking } from '@/types';
import { Copy, Check, Calendar, AlertTriangle, Sparkles, LogIn } from 'lucide-react';
import { formatThaiDate } from '@/lib/utils';
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
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(booking.booking_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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

          <div className="flex items-center justify-center gap-2">
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
