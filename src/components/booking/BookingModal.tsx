import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { createBooking } from '@/lib/api';
import { Booking, Room, PublicSettings, DEFAULT_WTK_MAJORS } from '@/types';
import { useToast } from '@/components/common/Toast';
import { formatThaiDate, timeToMinutes, minutesToTime } from '@/lib/utils';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Music,
  Sparkles,
  Zap,
} from 'lucide-react';
import dayjs from 'dayjs';

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBooking: Booking) => void;
  rooms?: Room[];
  bookings?: Booking[];
  settings?: PublicSettings;
  prefill?: {
    roomId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  };
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bookings = [],
  settings,
  prefill,
}) => {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State - ล็อคห้องซ้อมเดี่ยว วทก.
  const roomId = 'ROOM-01';
  const [bookingDate, setBookingDate] = useState<string>(() => dayjs().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState<string>('13:00');
  const [endTime, setEndTime] = useState<string>('15:00');

  // รายชื่อหลักสูตร / สาขาวิชาที่ดึงจากระบบ หรือค่ามาตรฐาน วทก.
  const availableMajors = (settings?.majors && settings.majors.length > 0)
    ? settings.majors
    : DEFAULT_WTK_MAJORS;

  const [fullName, setFullName] = useState<string>('');
  const [studentYear, setStudentYear] = useState<string>('ปี 1');
  const [major, setMajor] = useState<string>(() => availableMajors[0] || 'หลักสูตรการแพทย์แผนไทยบัณฑิต');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [partySize, setPartySize] = useState<number>(4);
  const [purpose, setPurpose] = useState<string>('ซ้อมวงดนตรี');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([
    'กลองชุด Pearl',
    'แอมป์กีตาร์ Marshall',
    'แอมป์เบส Fender',
  ]);
  const [honeypot, setHoneypot] = useState<string>('');

  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    checked: boolean;
    available: boolean;
    message?: string;
  }>({ checked: true, available: true });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionPhase, setSubmissionPhase] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ซิงก์ค่า major ให้ตรงกับตัวเลือกที่มีอยู่เสมอ
  useEffect(() => {
    if (availableMajors.length > 0 && !availableMajors.includes(major)) {
      setMajor(availableMajors[0]);
    }
  }, [availableMajors, major]);

  // กำหนดค่าเริ่มต้นตาม prefill เมื่อเปิด Modal
  useEffect(() => {
    if (isOpen) {
      if (prefill?.date) setBookingDate(prefill.date);
      if (prefill?.startTime) setStartTime(prefill.startTime);
      if (prefill?.endTime) setEndTime(prefill.endTime);
      setCurrentStep(1);
      setErrors({});
      setAcceptedTerms(false);
      setSubmissionPhase('');
    }
  }, [isOpen, prefill]);

  // ตัวเลือกสาขาวิชาของ วทก. (แบบไดนามิก 100%)
  const majorOptions = availableMajors.map((item) => ({
    value: item,
    label: item,
  }));

  // อุปกรณ์ดนตรีที่มีในห้องซ้อม
  const availableEquipment = [
    'กลองชุด Pearl',
    'แอมป์กีตาร์ Marshall',
    'แอมป์เบส Fender',
    'คีย์บอร์ด Roland',
    'ไมโครโฟน Shure x2',
    'PA System & มอนิเตอร์',
  ];

  // คำนวณความยาวเวลาการจอง (ชั่วโมง)
  const sMins = timeToMinutes(startTime);
  const eMins = timeToMinutes(endTime);
  const durationHours = Math.round(((eMins - sMins) / 60) * 10) / 10;

  // ตรวจสอบความว่างแบบ Instant Client-side (0 ms ทันใจ ไม่ต้องรอโหลด)
  useEffect(() => {
    if (!isOpen) return;

    if (sMins >= eMins) {
      setAvailabilityStatus({
        checked: true,
        available: false,
        message: 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น',
      });
      return;
    }

    if (eMins - sMins > 180) {
      setAvailabilityStatus({
        checked: true,
        available: false,
        message: 'ระยะเวลาจองสูงสุดไม่เกิน 3 ชั่วโมงต่อครั้ง',
      });
      return;
    }

    // ตรวจสอบ Overlap กับรายการคิวการจองในระบบทันที
    const overlapBooking = (bookings || []).find((b) => {
      if (b.status === 'cancelled') return false;
      if (b.booking_date !== bookingDate) return false;
      const bStart = timeToMinutes(b.start_time);
      const bEnd = timeToMinutes(b.end_time);
      return sMins < bEnd && eMins > bStart;
    });

    if (overlapBooking) {
      setAvailabilityStatus({
        checked: true,
        available: false,
        message: `ช่วงเวลานี้มีคิวแล้ว (${overlapBooking.start_time} - ${overlapBooking.end_time} น.)`,
      });
      return;
    }

    setAvailabilityStatus({
      checked: true,
      available: true,
      message: 'ห้องว่าง พร้อมสำหรับการจอง',
    });
  }, [isOpen, bookingDate, startTime, endTime, sMins, eMins, bookings]);

  // ฟังก์ชันกดเลือกความยาวเวลาอย่างรวดเร็ว (Quick Duration Buttons)
  const handleQuickDuration = (hours: number) => {
    const startM = timeToMinutes(startTime);
    const targetEndM = startM + hours * 60;
    const maxDayM = 20 * 60; // 20:00 น.
    const cappedEndM = Math.min(targetEndM, maxDayM);
    setEndTime(minutesToTime(cappedEndM));
  };

  // ตรวจสอบความถูกต้องของ Step 2
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = 'กรุณาระบุชื่อ-นามสกุลจริงอย่างน้อย 3 ตัวอักษร';
    }
    if (partySize < 1 || partySize > 15) {
      errs.partySize = 'จำนวนผู้ร่วมใช้งานต้องอยู่ระหว่าง 1 ถึง 15 คน';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ดำเนินการจองใน Step 3
  const handleConfirmBooking = async () => {
    if (!acceptedTerms) {
      toast.error('กรุณายอมรับระเบียบ', 'ต้องกดยอมรับระเบียบการใช้ห้องซ้อมก่อนทำการจอง');
      return;
    }

    setIsSubmitting(true);
    setSubmissionPhase('กำลังส่งข้อมูลและตรวจสอบคิวว่าง...');

    // ทยอยอัปเดตสเตตัสให้ผู้ใช้เห็นความคืบหน้าชัดเจน ไม่รู้สึกว่าหมุนค้าง
    const timer1 = setTimeout(() => {
      setSubmissionPhase('บันทึกคิวเรียบร้อย กำลังออกรหัสการจอง...');
    }, 1500);

    const timer2 = setTimeout(() => {
      setSubmissionPhase('ออกรหัสสำเร็จ กำลังจัดส่งอีเมลและเตรียมบัตรคิว...');
    }, 3200);

    try {
      const newBooking = await createBooking({
        room_id: roomId,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        full_name: fullName.trim(),
        student_year: studentYear,
        major: major,
        party_size: partySize,
        purpose: purpose,
        phone: phone.trim(),
        email: email.trim(),
        equipment: selectedEquipment.join(', '),
        _hp: honeypot,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      setSubmissionPhase('จองสำเร็จเรียบร้อย!');

      // บันทึกการจองล่าสุดลง localStorage เพื่อนำไป Auto-fill ในหน้าเช็คอินได้ทันที (0ms)
      try {
        localStorage.setItem(
          'wtk_last_booking',
          JSON.stringify({
            booking_code: newBooking.booking_code,
            full_name: fullName.trim(),
            room_id: newBooking.room_id,
            booking_date: newBooking.booking_date,
            start_time: newBooking.start_time,
            end_time: newBooking.end_time,
            timestamp: Date.now(),
          })
        );
      } catch (e) {}

      toast.success('จองห้องซ้อมสำเร็จ!', `รหัสการจองของคุณคือ ${newBooking.booking_code}`);
      onSuccess(newBooking);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      toast.error('การจองไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
      setSubmissionPhase('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg" showCloseButton={!isSubmitting}>
      <div className="space-y-6 py-1">
        {/* Modern Stepper Header */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                ชมรมดนตรี วทก.
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-primary tracking-tight">
                จองห้องซ้อมดนตรี
              </h2>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              ขั้นตอน {currentStep} / 3
            </span>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
            <div
              className={`p-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                currentStep === 1
                  ? 'bg-primary text-white shadow-sm font-bold'
                  : currentStep > 1
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-50 text-slate-400'
              }`}
            >
              <span>1. วัน & เวลา</span>
            </div>

            <div
              className={`p-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                currentStep === 2
                  ? 'bg-primary text-white shadow-sm font-bold'
                  : currentStep > 2
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-50 text-slate-400'
              }`}
            >
              <span>2. ข้อมูลผู้จอง</span>
            </div>

            <div
              className={`p-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                currentStep === 3
                  ? 'bg-primary text-white shadow-sm font-bold'
                  : 'bg-slate-50 text-slate-400'
              }`}
            >
              <span>3. ยืนยันคิว</span>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* STEP 1: วันและเวลา (Date & Time Slots)               */}
        {/* ---------------------------------------------------- */}
        {currentStep === 1 && (
          <div className="space-y-4">
            {/* Single Room Premium Banner */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-primary to-primary-dark text-white rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-gold shadow-inner">
                  <Music className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] text-gold font-bold uppercase tracking-wider">
                    ห้องซ้อมหลัก (Single Room)
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white leading-tight">
                    ห้องซ้อมดนตรี ชมรมดนตรี วทก.
                  </div>
                  <div className="text-[11px] text-blue-200">
                    ชั้น 2 อาคารกิจกรรมนักศึกษา วทก.
                  </div>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="inline-block text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-full">
                  ความจุ 8–10 คน
                </span>
              </div>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                <span>เลือกวันที่ต้องการใช้ห้องซ้อม *</span>
              </label>
              <input
                type="date"
                min={dayjs().format('YYYY-MM-DD')}
                max={dayjs().add(settings?.advance_booking_days || 14, 'day').format('YYYY-MM-DD')}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                {formatThaiDate(bookingDate, 'ddddที่ D MMMM พ.ศ. BBBB')}
              </span>
            </div>

            {/* Time Slot Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>เวลาเริ่มซ้อม *</span>
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono font-semibold text-slate-800"
                >
                  {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'].map((t) => (
                    <option key={t} value={t}>{t} น.</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>เวลาสิ้นสุด *</span>
                </label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono font-semibold text-slate-800"
                >
                  {['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'].map((t) => (
                    <option key={t} value={t}>{t} น.</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Duration Buttons (ปรับเวลาได้ใน 1 คลิก) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Zap className="w-3 h-3 text-gold" />
                เลือกระยะเวลาด่วน:
              </span>
              <div className="flex flex-wrap gap-2">
                {[1, 1.5, 2, 2.5, 3].map((hr) => (
                  <button
                    key={hr}
                    type="button"
                    onClick={() => handleQuickDuration(hr)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      durationHours === hr
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {hr} ชั่วโมง
                  </button>
                ))}
              </div>
            </div>

            {/* Real-time Instant Availability Alert */}
            <div
              className={`p-3.5 rounded-2xl border transition-all text-xs flex items-center justify-between ${
                availabilityStatus.available
                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/90 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {availabilityStatus.available ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                )}
                <div className="leading-tight">
                  <div className="font-bold">
                    {availabilityStatus.available
                      ? 'ห้องว่าง พร้อมสำหรับการจอง!'
                      : availabilityStatus.message || 'ไม่สามารถจองเวลานี้ได้'}
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    ระยะเวลาที่เลือก: {durationHours} ชั่วโมง (สูงสุด 3 ชม./ครั้ง)
                  </div>
                </div>
              </div>

              {availabilityStatus.available && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                disabled={!availabilityStatus.available}
                onClick={() => setCurrentStep(2)}
                className="font-bold px-6 shadow-md w-full sm:w-auto"
              >
                ถัดไป: กรอกข้อมูลผู้จอง
              </Button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 2: ข้อมูลผู้จอง (User Details)                  */}
        {/* ---------------------------------------------------- */}
        {currentStep === 2 && (
          <div className="space-y-4">
            {/* Honeypot field กันบอท */}
            <input
              type="text"
              name="_hp"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="ชื่อ-นามสกุลจริง *"
                placeholder="เช่น นายกิตติศักดิ์ มีสุข"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
                required
              />

              <Select
                label="ชั้นปี *"
                value={studentYear}
                onChange={(e) => setStudentYear(e.target.value)}
                options={[
                  { value: 'ปี 1', label: 'ชั้นปีที่ 1' },
                  { value: 'ปี 2', label: 'ชั้นปีที่ 2' },
                  { value: 'ปี 3', label: 'ชั้นปีที่ 3' },
                  { value: 'ปี 4', label: 'ชั้นปีที่ 4' },
                  { value: 'บุคลากร', label: 'อาจารย์ / บุคลากรวิทยาลัย' },
                ]}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Select
                label="สาขาวิชา *"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                options={majorOptions}
                required
              />

              <Input
                label="เบอร์โทรศัพท์ติดต่อ"
                placeholder="เช่น 0812345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <Input
                  label="อีเมลผู้จอง (แนะนำอย่างยิ่ง — รับรหัสห้อง & รหัสจอง)"
                  placeholder="เช่น student@gmail.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
                <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/90 rounded-xl p-2 flex items-start gap-1.5 leading-snug">
                  <span className="text-amber-600 font-bold flex-shrink-0 mt-0.5">📧</span>
                  <span>
                    <strong>สำคัญ:</strong> รหัสการจอง, รหัสผ่านเข้าห้องซ้อม และปุ่มกดเช็คอิน/คืนห้อง จะถูกส่งไปยังอีเมลนี้ทันทีหลังจองสำเร็จครับ
                  </span>
                </div>
              </div>

              <Input
                label="จำนวนผู้ร่วมใช้งาน (คน) *"
                type="number"
                min={1}
                max={15}
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value, 10) || 1)}
                error={errors.partySize}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                วัตถุประสงค์การใช้งาน *
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="ซ้อมวงดนตรี">ซ้อมวงดนตรี</option>
                <option value="ซ้อมส่วนตัว / ซ้อมเดี่ยว">ซ้อมส่วนตัว / ซ้อมเดี่ยว</option>
                <option value="เตรียมการแสดงงานวิทยาลัย">เตรียมการแสดงงานวิทยาลัย</option>
                <option value="อัดเพลง / ทำสื่อกิจกรรม">อัดเพลง / ทำสื่อกิจกรรม</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            {/* Equipment Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                อุปกรณ์ดนตรีที่ต้องการขอใช้งานเพิ่มเติม
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableEquipment.map((item) => {
                  const isChecked = selectedEquipment.includes(item);
                  return (
                    <label
                      key={item}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-blue-50/80 border-primary text-primary font-bold shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEquipment([...selectedEquipment, item]);
                          } else {
                            setSelectedEquipment(selectedEquipment.filter((x) => x !== item));
                          }
                        }}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="truncate">{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-3">
              <Button variant="outline" size="md" onClick={() => setCurrentStep(1)} className="w-full sm:w-auto">
                ย้อนกลับ
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (validateStep2()) setCurrentStep(3);
                }}
                className="font-bold px-6 w-full sm:w-auto"
              >
                ถัดไป: ตรวจสอบและยืนยัน
              </Button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 3: ตรวจสอบและยืนยัน (Confirmation)              */}
        {/* ---------------------------------------------------- */}
        {currentStep === 3 && (
          <div className="space-y-4">
            {/* Ticket Styled Summary Card */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200 p-5 space-y-3.5 text-xs shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-secondary uppercase">
                    สรุปคิวการจอง
                  </span>
                  <h3 className="font-bold text-primary text-base">
                    ห้องซ้อมดนตรี ชมรมดนตรี วทก.
                  </h3>
                </div>
                <span className="text-xs font-bold text-primary bg-white px-3 py-1 rounded-full border border-slate-200">
                  {durationHours} ชั่วโมง
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">วันที่ใช้งาน:</span>
                  <div className="font-bold text-slate-850 text-sm">
                    {formatThaiDate(bookingDate, 'D MMMM BBBB')}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ช่วงเวลาซ้อม:</span>
                  <div className="font-extrabold text-primary text-sm font-mono">
                    {startTime} - {endTime} น.
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ผู้จอง:</span>
                  <div className="font-semibold text-slate-800">
                    {fullName} ({studentYear})
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">สาขาวิชา:</span>
                  <div className="font-semibold text-slate-800">{major}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">เบอร์โทรศัพท์:</span>
                  <div className="text-slate-700">{phone || '-'}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">จำนวนสมาชิก:</span>
                  <div className="text-slate-700">{partySize} คน</div>
                </div>
              </div>

              {selectedEquipment.length > 0 && (
                <div className="border-t border-slate-200/80 pt-2.5">
                  <span className="text-slate-400 block text-[11px] mb-1">
                    อุปกรณ์ดนตรีที่ขอใช้:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEquipment.map((eq) => (
                      <span
                        key={eq}
                        className="px-2 py-0.5 bg-white text-slate-700 rounded-md border border-slate-200 text-[11px]"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Terms and PDPA Agreement Checkbox */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4 flex-shrink-0"
                />
                <span className="text-slate-700 leading-relaxed text-[11px]">
                  ฉันได้อ่านและยอมรับ <strong>ระเบียบการใช้ห้องซ้อมดนตรี ชมรมดนตรี วทก.</strong> และเข้าใจว่าต้องเช็คอินภายใน 30 นาทีหลังเวลาเริ่ม (มิฉะนั้นจะถูกตัดสิทธิ์ No-show) พร้อมยินยอมให้บันทึกข้อมูลเพื่อการบริหารจัดการห้องซ้อมตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
                </span>
              </label>
            </div>

            {/* Live Submission Progress Feedback */}
            {isSubmitting && (
              <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-2xl flex items-center gap-3 animate-pulse shadow-sm">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-primary block">กำลังประมวลผลการจอง...</span>
                  <span className="text-slate-600 text-[11px]">{submissionPhase}</span>
                </div>
              </div>
            )}

            <div className={`flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-3 ${isSubmitting ? 'pointer-events-none opacity-80' : ''}`}>
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(2)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                ย้อนกลับ
              </Button>
              <Button
                variant="gold"
                size="md"
                onClick={handleConfirmBooking}
                loading={isSubmitting}
                disabled={!acceptedTerms || isSubmitting}
                className="font-bold px-5 sm:px-8 shadow-md w-full sm:w-auto"
              >
                {isSubmitting ? 'กำลังบันทึกคิว...' : 'ยืนยันการจองห้องซ้อมดนตรี 🎸'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
