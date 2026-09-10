import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { checkAvailability, createBooking } from '@/lib/api';
import { Booking, Room, PublicSettings } from '@/types';
import { useToast } from '@/components/common/Toast';
import { formatThaiDate, timeToMinutes } from '@/lib/utils';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Music,
} from 'lucide-react';
import dayjs from 'dayjs';

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBooking: Booking) => void;
  rooms?: Room[];
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
  rooms = [],
  settings,
  prefill,
}) => {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [roomId, setRoomId] = useState<string>('ROOM-01');
  const activeRoom = rooms.find((r) => r.room_id === roomId) || rooms[0] || {
    room_id: 'ROOM-01',
    room_name: 'ห้องซ้อมดนตรี ชมรมดนตรี วทก.',
    capacity: 10,
  };
  const [bookingDate, setBookingDate] = useState<string>(() => dayjs().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState<string>('13:00');
  const [endTime, setEndTime] = useState<string>('15:00');

  const [fullName, setFullName] = useState<string>('');
  const [studentYear, setStudentYear] = useState<string>('ปี 1');
  const [major, setMajor] = useState<string>('เทคโนโลยีหัวใจและทรวงอก');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [partySize, setPartySize] = useState<number>(4);
  const [purpose, setPurpose] = useState<string>('ซ้อมวงดนตรี');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([
    'กลองชุด',
    'แอมป์กีตาร์',
    'แอมป์เบส',
  ]);
  const [honeypot, setHoneypot] = useState<string>('');

  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState<boolean>(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    checked: boolean;
    available: boolean;
    message?: string;
  }>({ checked: false, available: true });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // กำหนดค่าเริ่มต้นตาม prefill เมื่อเปิด Modal
  useEffect(() => {
    if (isOpen) {
      if (prefill?.roomId) setRoomId(prefill.roomId);
      if (prefill?.date) setBookingDate(prefill.date);
      if (prefill?.startTime) setStartTime(prefill.startTime);
      if (prefill?.endTime) setEndTime(prefill.endTime);
      setCurrentStep(1);
      setErrors({});
      setAcceptedTerms(false);
    }
  }, [isOpen, prefill]);

  // ตัวเลือกสาขาวิชาของ วทก.
  const majorOptions = [
    { value: 'เทคโนโลยีหัวใจและทรวงอก', label: 'เทคโนโลยีหัวใจและทรวงอก' },
    { value: 'รังสีเทคนิค', label: 'รังสีเทคนิค' },
    { value: 'กายภาพบำบัด', label: 'กายภาพบำบัด' },
    { value: 'สาธารณสุขศาสตร์', label: 'สาธารณสุขศาสตร์' },
    { value: 'การแพทย์แผนไทย', label: 'การแพทย์แผนไทย' },
    { value: 'วิทยาศาสตร์การแพทย์', label: 'วิทยาศาสตร์การแพทย์' },
    { value: 'เจ้าหน้าที่/บุคลากร', label: 'เจ้าหน้าที่ / บุคลากรวิทยาลัย' },
    { value: 'อื่นๆ', label: 'อื่นๆ' },
  ];

  // อุปกรณ์ดนตรีที่เปิดให้ขอใช้งาน
  const availableEquipment = [
    'กลองชุด Pearl',
    'แอมป์กีตาร์ Marshall',
    'แอมป์เบส Fender',
    'คีย์บอร์ด Roland',
    'ไมโครโฟน Shure x2',
    'PA System & มอนิเตอร์',
  ];

  // ตรวจสอบความว่างของเวลาแบบ Debounce
  useEffect(() => {
    if (!isOpen || currentStep !== 1) return;

    const timer = setTimeout(async () => {
      const sMins = timeToMinutes(startTime);
      const eMins = timeToMinutes(endTime);

      if (sMins >= eMins) {
        setAvailabilityStatus({
          checked: true,
          available: false,
          message: 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น',
        });
        return;
      }

      setIsCheckingAvailability(true);
      try {
        const res = await checkAvailability(roomId, bookingDate, startTime, endTime);
        setAvailabilityStatus({
          checked: true,
          available: res.available,
          message: res.reason,
        });
      } catch (err: any) {
        setAvailabilityStatus({
          checked: true,
          available: false,
          message: err.message || 'ไม่สามารถตรวจสอบสถานะเวลาได้',
        });
      } finally {
        setIsCheckingAvailability(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [roomId, bookingDate, startTime, endTime, isOpen, currentStep]);

  // คำนวณความยาวเวลาการจอง
  const durationHours = Math.round(((timeToMinutes(endTime) - timeToMinutes(startTime)) / 60) * 10) / 10;

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

      toast.success('จองห้องซ้อมสำเร็จ!', `รหัสการจองของคุณคือ ${newBooking.booking_code}`);
      onSuccess(newBooking);
    } catch (err: any) {
      toast.error('การจองไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg" showCloseButton={!isSubmitting}>
      <div className="space-y-6">
        {/* Stepper Progress Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-primary">จองห้องซ้อมดนตรี วทก.</h2>
            <span className="text-xs font-semibold text-secondary bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              ขั้นตอนที่ {currentStep} จาก 3
            </span>
          </div>

          {/* Stepper Indicators */}
          <div className="flex items-center gap-2">
            <div className={`h-1.5 flex-1 rounded-full ${currentStep >= 1 ? 'bg-primary' : 'bg-slate-200'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${currentStep >= 2 ? 'bg-primary' : 'bg-slate-200'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${currentStep >= 3 ? 'bg-primary' : 'bg-slate-200'}`} />
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* STEP 1: วันและเวลา (Date & Time Slots)               */}
        {/* ---------------------------------------------------- */}
        {currentStep === 1 && (
          <div className="space-y-4">
            {/* Auto-selected Single Room Banner */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center">
                  <Music className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">ห้องซ้อมหลัก</div>
                  <div className="text-sm font-bold text-slate-850">{activeRoom.room_name}</div>
                </div>
              </div>
              <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                ความจุ {activeRoom.capacity} คน
              </span>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>วันที่ต้องการใช้ห้องซ้อม *</span>
              </label>
              <input
                type="date"
                min={dayjs().format('YYYY-MM-DD')}
                max={dayjs().add(settings?.advance_booking_days || 14, 'day').format('YYYY-MM-DD')}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                {formatThaiDate(bookingDate, 'ddddที่ D MMMM พ.ศ. BBBB')}
              </span>
            </div>

            {/* Time Slots Selector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>เวลาเริ่ม *</span>
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                >
                  {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'].map((t) => (
                    <option key={t} value={t}>{t} น.</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>เวลาสิ้นสุด *</span>
                </label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                >
                  {['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'].map((t) => (
                    <option key={t} value={t}>{t} น.</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration & Availability Feedback */}
            <div className="p-3 rounded-xl border transition-all text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500">ระยะเวลาที่เลือก:</span>{' '}
                <strong className="text-primary text-sm">{durationHours} ชั่วโมง</strong>
                <span className="text-slate-400 text-[11px] ml-1.5">(สูงสุด 3 ชม./ครั้ง)</span>
              </div>

              {isCheckingAvailability ? (
                <span className="text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-ping" />
                  กำลังเช็คคิว...
                </span>
              ) : availabilityStatus.available ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ห้องว่าง พร้อมจอง
                </span>
              ) : (
                <span className="text-danger font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-danger" />
                  {availabilityStatus.message || 'ไม่สามารถจองเวลานี้ได้'}
                </span>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <Button
                variant="primary"
                size="md"
                disabled={!availabilityStatus.available || isCheckingAvailability}
                onClick={() => setCurrentStep(2)}
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
            {/* Honeypot field กันบอท (ซ่อนจากมนุษย์) */}
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
                label="ชื่อ-นามสกุลจริง"
                placeholder="เช่น นายกิตติศักดิ์ มีสุข"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
                required
              />

              <Select
                label="ชั้นปี"
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
                label="สาขาวิชา"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                options={majorOptions}
                required
              />

              <Input
                label="เบอร์โทรศัพท์ติดต่อ (ไม่บังคับ)"
                placeholder="เช่น 0812345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="อีเมล (ไม่บังคับ — รับใบยืนยัน & QR)"
                placeholder="เช่น student@gmail.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                helperText="หากกรอก ระบบจะส่งใบยืนยันและ QR Code ไปที่เมลนี้"
              />

              <Input
                label="จำนวนผู้ร่วมใช้งาน (คน)"
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

            {/* Equipment Checkboxes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                อุปกรณ์ที่ต้องการใช้งานเพิ่มเติม
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableEquipment.map((item) => {
                  const isChecked = selectedEquipment.includes(item);
                  return (
                    <label
                      key={item}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                        isChecked
                          ? 'bg-blue-50/70 border-primary text-primary font-semibold'
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
                        className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span className="truncate">{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <Button variant="outline" size="md" onClick={() => setCurrentStep(1)}>
                ย้อนกลับ
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (validateStep2()) setCurrentStep(3);
                }}
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
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 text-xs">
              <h3 className="font-bold text-primary text-sm border-b border-slate-200 pb-2">
                สรุปข้อมูลการจองห้องซ้อมดนตรี
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">ห้อง:</span>
                  <div className="font-semibold text-slate-800">ห้องซ้อมดนตรี วทก.</div>
                </div>
                <div>
                  <span className="text-slate-400">วันที่:</span>
                  <div className="font-semibold text-slate-800">{formatThaiDate(bookingDate)}</div>
                </div>
                <div>
                  <span className="text-slate-400">เวลา:</span>
                  <div className="font-bold text-primary">{startTime} - {endTime} น. ({durationHours} ชม.)</div>
                </div>
                <div>
                  <span className="text-slate-400">จำนวนสมาชิก:</span>
                  <div className="font-semibold text-slate-800">{partySize} คน</div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">ชื่อผู้จอง:</span>
                  <div className="font-semibold text-slate-800">{fullName} ({studentYear})</div>
                </div>
                <div>
                  <span className="text-slate-400">สาขาวิชา:</span>
                  <div className="font-semibold text-slate-800">{major}</div>
                </div>
                <div>
                  <span className="text-slate-400">เบอร์โทร:</span>
                  <div className="font-semibold text-slate-800">{phone || '-'}</div>
                </div>
                <div>
                  <span className="text-slate-400">อีเมล:</span>
                  <div className="font-semibold text-slate-800">{email || '-'}</div>
                </div>
              </div>

              {selectedEquipment.length > 0 && (
                <div className="border-t border-slate-200 pt-2">
                  <span className="text-slate-400">อุปกรณ์ที่ขอใช้:</span>
                  <div className="text-slate-700 mt-0.5">{selectedEquipment.join(', ')}</div>
                </div>
              )}
            </div>

            {/* Terms and PDPA Agreement Checkbox */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4 flex-shrink-0"
                />
                <span className="text-slate-700 leading-relaxed">
                  ฉันได้อ่านและยอมรับ <strong>ระเบียบการใช้ห้องซ้อมดนตรี ชมรมดนตรี วทก.</strong> และเข้าใจว่าต้องเช็คอินภายใน 30 นาทีหลังเวลาเริ่ม (มิฉะนั้นจะถูกตัดสิทธิ์ No-show) พร้อมยินยอมให้บันทึกข้อมูลเพื่อการบริหารจัดการห้องซ้อมตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
                </span>
              </label>
            </div>

            <div className="flex justify-between pt-3">
              <Button variant="outline" size="md" onClick={() => setCurrentStep(2)} disabled={isSubmitting}>
                ย้อนกลับ
              </Button>
              <Button
                variant="gold"
                size="md"
                onClick={handleConfirmBooking}
                loading={isSubmitting}
                disabled={!acceptedTerms || isSubmitting}
                className="font-bold px-6"
              >
                ยืนยันการจองห้องซ้อม
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
