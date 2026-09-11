import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Booking } from '@/types';
import { directApproveBooking, directRejectBooking } from '@/lib/api';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Calendar, Clock, MapPin, User, ShieldCheck } from 'lucide-react';
import { formatThaiDate } from '@/lib/utils';

export interface DirectApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: {
    action: 'approve_booking' | 'reject_booking';
    id: string;
    token: string;
    reason?: string;
  };
  onGoToAdmin: () => void;
  onApproved?: () => void;
}

export const DirectApprovalModal: React.FC<DirectApprovalModalProps> = ({
  isOpen,
  onClose,
  params,
  onGoToAdmin,
  onApproved,
}) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'already_processed' | 'rejected' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!isOpen || !params.id || !params.token) return;

    let isMounted = true;
    async function execute() {
      setStatus('loading');
      try {
        if (params.action === 'approve_booking') {
          const res = await directApproveBooking(params.id, params.token);
          if (!isMounted) return;
          if (res.booking) setBooking(res.booking);
          setMessage(res.message);
          if (res.alreadyProcessed) {
            setStatus('already_processed');
          } else {
            setStatus('success');
          }
          try {
            if (res.booking?.booking_date) {
              localStorage.removeItem(`wtk_cached_public_state_${res.booking.booking_date}`);
            }
            localStorage.removeItem('wtk_cached_public_state_latest');
          } catch {}
          if (onApproved) onApproved();
        } else {
          const res = await directRejectBooking(params.id, params.token, params.reason);
          if (!isMounted) return;
          if (res.booking) setBooking(res.booking);
          setMessage(res.message);
          if (res.alreadyProcessed) {
            setStatus('already_processed');
          } else {
            setStatus('rejected');
          }
          try {
            if (res.booking?.booking_date) {
              localStorage.removeItem(`wtk_cached_public_state_${res.booking.booking_date}`);
            }
            localStorage.removeItem('wtk_cached_public_state_latest');
          } catch {}
          if (onApproved) onApproved();
        }
      } catch (err: any) {
        if (!isMounted) return;
        setStatus('error');
        setMessage(err.message || 'เกิดข้อผิดพลาดในการประมวลผลคำขอ');
      }
    }

    execute();

    return () => {
      isMounted = false;
    };
  }, [isOpen, params]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        params.action === 'approve_booking'
          ? 'ผลการอนุมัติการจองห้องซ้อม'
          : 'ผลการปฏิเสธคำขอการจอง'
      }
      maxWidth="lg"
    >
      <div className="space-y-5 text-center">
        {/* State 1: Loading */}
        {status === 'loading' && (
          <div className="py-10 space-y-4">
            <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                {params.action === 'approve_booking'
                  ? 'กำลังดำเนินการอนุมัติการจอง...'
                  : 'กำลังดำเนินการปฏิเสธคำขอ...'}
              </h3>
              <p className="text-xs text-slate-500">
                ระบบกำลังตรวจสอบรหัสความปลอดภัยและอัปเดตสถานะในฐานข้อมูล
              </p>
            </div>
          </div>
        )}

        {/* State 2: Success (Approved) */}
        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-emerald-800">
                อนุมัติการจองห้องซ้อมสำเร็จแล้ว!
              </h3>
              <p className="text-xs text-slate-500">
                ระบบได้เปลี่ยนสถานะเป็น <strong className="text-emerald-700 font-semibold">"จองแล้ว" (Booked)</strong> เรียบร้อย
              </p>
            </div>

            {booking && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">รหัสการจอง:</span>
                  <span className="font-mono font-bold text-secondary text-sm">
                    {booking.booking_code}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    ผู้จอง:
                  </span>
                  <span className="font-semibold text-slate-700">
                    {booking.full_name} ({booking.student_year})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    ห้องซ้อม:
                  </span>
                  <span className="font-semibold text-slate-700">{booking.room_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    วันที่ใช้งาน:
                  </span>
                  <span className="font-semibold text-slate-700">
                    {formatThaiDate(booking.booking_date)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    ช่วงเวลา:
                  </span>
                  <span className="font-semibold text-secondary">
                    {booking.start_time} - {booking.end_time} น.
                  </span>
                </div>
              </div>
            )}

            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-800 text-left flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">ระบบจัดส่งอีเมลยืนยันตัวจริงแล้ว</p>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  รหัสผ่านเข้าห้องซ้อมและ QR Code เช็คอินได้ถูกส่งไปยังอีเมลของผู้จองเรียบร้อยแล้ว
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="primary"
                className="w-full font-bold"
                onClick={onGoToAdmin}
              >
                เปิดแผงควบคุมแอดมิน (Admin Console)
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onClose}
              >
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        )}

        {/* State 3: Already Processed */}
        {status === 'already_processed' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-amber-800">
                รายการนี้ได้รับการดำเนินการแล้ว
              </h3>
              <p className="text-xs text-slate-500">
                {message || 'รายการคำขอนี้ได้รับการอนุมัติหรือยกเลิกไปก่อนหน้านี้แล้ว'}
              </p>
            </div>

            {booking && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">รหัสการจอง:</span>
                  <span className="font-mono font-bold text-secondary">{booking.booking_code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ผู้จอง:</span>
                  <span className="font-semibold text-slate-700">{booking.full_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">สถานะปัจจุบัน:</span>
                  <span className="font-bold text-secondary uppercase">{booking.status}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="primary"
                className="w-full font-bold"
                onClick={onGoToAdmin}
              >
                เปิดแผงควบคุมแอดมิน (Admin Console)
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onClose}
              >
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        )}

        {/* State 4: Rejected */}
        {status === 'rejected' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-rose-800">
                ปฏิเสธคำขอการจองเรียบร้อย
              </h3>
              <p className="text-xs text-slate-500">
                ระบบได้ยกเลิกคำขอนี้และส่งอีเมลแจ้งเตือนไปยังผู้จองเรียบร้อยแล้ว
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="primary"
                className="w-full font-bold"
                onClick={onGoToAdmin}
              >
                เปิดแผงควบคุมแอดมิน (Admin Console)
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onClose}
              >
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        )}

        {/* State 5: Error */}
        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-rose-800">
                ไม่สามารถดำเนินการได้
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {message || 'ลิงก์การอนุมัติไม่ถูกต้อง หมดอายุ หรือคำขอนี้ถูกแก้ไขไปแล้ว'}
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                className="w-full"
                onClick={onClose}
              >
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
