import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Sparkles } from 'lucide-react';
import { Booking, Blackout, DayCalendarSummary } from '@/types';
import { formatThaiDate, timeToMinutes, cn } from '@/lib/utils';
import dayjs from 'dayjs';

export interface CalendarViewProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  onBookRoom?: (date: string) => void;
  advanceDays?: number;
  calendarSummary?: Record<string, DayCalendarSummary>;
  bookings?: Booking[];
  blackouts?: Blackout[];
  weekdayHours?: string;
  weekendHours?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  onSelectDate,
  onBookRoom,
  advanceDays = 14,
  calendarSummary = {},
  bookings = [],
  blackouts = [],
  weekdayHours = '16:30-20:00',
  weekendHours = '09:00-20:00',
}) => {
  // เดือนที่กำลังแสดงในปฏิทิน
  const [currentMonth, setCurrentMonth] = useState(() => dayjs(selectedDate).startOf('month'));

  const today = dayjs().startOf('day');
  const maxAdvanceDate = today.add(advanceDays, 'day');

  // คำนวณวันในเดือนและวัน padding เพื่อให้เริ่มวันอาทิตย์ (7 คอลัมน์)
  const calendarDays = React.useMemo(() => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');

    const startDayOfWeek = startOfMonth.day(); // 0 = Sun, 6 = Sat
    const daysInMonth = currentMonth.daysInMonth();

    const days = [];

    // 1. Padding วันของเดือนก่อนหน้า
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = startOfMonth.subtract(i + 1, 'day');
      days.push({
        date: prevDate,
        dateStr: prevDate.format('YYYY-MM-DD'),
        isCurrentMonth: false,
      });
    }

    // 2. วันในเดือนปัจจุบัน
    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = currentMonth.date(d);
      days.push({
        date: thisDate,
        dateStr: thisDate.format('YYYY-MM-DD'),
        isCurrentMonth: true,
      });
    }

    // 3. Padding วันของเดือนถัดไป ให้ครบสัปดาห์
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let j = 1; j <= remainingDays; j++) {
        const nextDate = endOfMonth.add(j, 'day');
        days.push({
          date: nextDate,
          dateStr: nextDate.format('YYYY-MM-DD'),
          isCurrentMonth: false,
        });
      }
    }

    return days;
  }, [currentMonth]);

  // คำนวณสถานะความว่างของแต่ละวัน (ใช้ summary จาก Backend หรือคำนวณ Client-side)
  const getDayStatus = (dStr: string, dateObj: dayjs.Dayjs) => {
    // 1. ตรวจสอบว่าอยู่ในช่วงที่อนุญาตให้จองหรือไม่
    const isPast = dateObj.isBefore(today, 'day');
    const isBeyondAdvance = dateObj.isAfter(maxAdvanceDate, 'day');

    if (isPast) {
      return { status: 'past' as const, label: 'เลยกำหนด', badgeClass: 'bg-slate-100 text-slate-400 border-slate-200' };
    }
    if (isBeyondAdvance) {
      return { status: 'future' as const, label: 'ยังไม่เปิดจอง', badgeClass: 'bg-slate-100 text-slate-400 border-slate-200' };
    }

    // 2. ตรวจสอบ Blackouts
    const isBlackout = blackouts.some((bo) => {
      const from = bo.date_from;
      const to = bo.date_to;
      return dStr >= from && dStr <= to;
    });
    if (isBlackout) {
      return { status: 'closed' as const, label: 'ปิดบริการ', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' };
    }

    // 3. ตรวจสอบจาก calendarSummary (ถ้ามีส่งมาจาก Backend)
    const summary = calendarSummary[dStr];
    if (summary) {
      if (summary.status === 'closed') {
        return { status: 'closed' as const, label: 'ปิดบริการ', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' };
      }
      if (summary.status === 'full') {
        return { status: 'full' as const, label: 'เต็มทุกช่วง', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300' };
      }
      if (summary.status === 'partial' || summary.count > 0) {
        return {
          status: 'partial' as const,
          label: `${summary.count} คิว (ว่างบางช่วง)`,
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      }
      return { status: 'available' as const, label: 'ว่าง (พร้อมจอง)', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }

    // 4. Fallback คำนวณจาก bookings Client-side
    const dayBookings = bookings.filter((b) => b.booking_date === dStr && b.status !== 'cancelled');
    const count = dayBookings.length;

    const isWeekend = dateObj.day() === 0 || dateObj.day() === 6;
    const opStr = isWeekend ? weekendHours : weekdayHours;
    const [opOpenStr, opCloseStr] = opStr.split('-');
    const opOpenM = timeToMinutes(opOpenStr || (isWeekend ? '09:00' : '16:30'));
    const opCloseM = timeToMinutes(opCloseStr || '20:00');
    const totalOpMins = opCloseM > opOpenM ? opCloseM - opOpenM : 210;

    const totalBookedMins = dayBookings.reduce((sum, b) => {
      const s = timeToMinutes(b.start_time);
      const e = timeToMinutes(b.end_time);
      return sum + (e > s ? e - s : 0);
    }, 0);

    if (count === 0) {
      return { status: 'available' as const, label: 'ว่าง (พร้อมจอง)', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
    if (totalBookedMins >= totalOpMins) {
      return { status: 'full' as const, label: 'เต็มทุกช่วง', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
    return {
      status: 'partial' as const,
      label: `${count} คิว (ว่างบางช่วง)`,
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    };
  };

  // เลื่อนเดือน
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => prev.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => prev.add(1, 'month'));
  };

  const handleGoToday = () => {
    const t = dayjs();
    setCurrentMonth(t.startOf('month'));
    onSelectDate(t.format('YYYY-MM-DD'));
  };

  // ข้อมูลของวันที่เลือกปัจจุบัน
  const selectedDateObj = dayjs(selectedDate);
  const selectedIsWeekend = selectedDateObj.day() === 0 || selectedDateObj.day() === 6;
  const selectedOperatingHours = selectedIsWeekend ? weekendHours : weekdayHours;
  const selectedStatusInfo = getDayStatus(selectedDate, selectedDateObj);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* 1. Header: Month Navigation & Legend */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/70 via-white to-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Month Title & Controls */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                  {formatThaiDate(currentMonth.format('YYYY-MM-DD'), 'MMMM พ.ศ. BBBB')}
                </h3>
                <button
                  onClick={handleGoToday}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  วันนี้
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                คลิกเลือกวันที่เพื่อดูผังเวลาละเอียด หรือกดจองห้องได้ทันที
              </p>
            </div>
          </div>

          {/* Prev / Next Month Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary transition-all shadow-sm active:scale-95 cursor-pointer"
              aria-label="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary transition-all shadow-sm active:scale-95 cursor-pointer"
              aria-label="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Legend Bar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-semibold text-[11px] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            สถานะความว่าง:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-700 font-medium">ว่างตลอดวัน (พร้อมจอง)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-700 font-medium">มีจองบางช่วง (ว่างบางเวลา)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-700 font-medium">เต็มแล้วทุกช่วง</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span className="text-slate-500 font-medium">ปิดบริการ / นอกช่วงเปิดจอง</span>
          </div>
        </div>
      </div>

      {/* 2. Calendar Grid */}
      <div className="p-3 sm:p-5">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-xs font-bold">
          {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((dayName, idx) => (
            <div
              key={dayName}
              className={cn(
                'py-2 rounded-lg',
                idx === 0 || idx === 6
                  ? 'bg-amber-50/70 text-amber-800'
                  : 'bg-slate-50 text-slate-700'
              )}
            >
              <span>{dayName}</span>
              <span className="block text-[10px] font-normal text-slate-400">
                {idx === 0 || idx === 6 ? '09:00-20:00' : '16:30-20:00'}
              </span>
            </div>
          ))}
        </div>

        {/* Day cells grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarDays.map((item) => {
            const { date, dateStr, isCurrentMonth } = item;
            const isSelected = dateStr === selectedDate;
            const isToday = date.isSame(today, 'day');
            const dayInfo = getDayStatus(dateStr, date);
            const isClickable = dayInfo.status !== 'past' && dayInfo.status !== 'future' && dayInfo.status !== 'closed';
            const isWeekend = date.day() === 0 || date.day() === 6;
            const opHours = isWeekend ? weekendHours : weekdayHours;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => {
                  if (isSelected && onBookRoom) {
                    onBookRoom(dateStr);
                  } else if (isClickable) {
                    onSelectDate(dateStr);
                  }
                }}
                disabled={!isClickable}
                className={cn(
                  'group relative min-h-[78px] sm:min-h-[92px] p-1.5 sm:p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 select-none',
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 ring-2 ring-primary ring-offset-2 scale-[1.02] z-10'
                    : isClickable
                    ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer'
                    : 'bg-slate-50/60 text-slate-400 border-slate-100 cursor-not-allowed opacity-60',
                  !isCurrentMonth && 'opacity-30'
                )}
              >
                {/* Top Row: Date number & Today badge */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      'text-sm sm:text-base font-bold tabular-nums',
                      isSelected
                        ? 'text-white'
                        : isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    )}
                  >
                    {date.date()}
                  </span>

                  {isToday && (
                    <span
                      className={cn(
                        'text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none',
                        isSelected
                          ? 'bg-white text-primary'
                          : 'bg-emerald-500 text-white shadow-xs'
                      )}
                    >
                      วันนี้
                    </span>
                  )}
                </div>

                {/* Operating Hours Snippet */}
                {isClickable && (
                  <div
                    className={cn(
                      'text-[9px] sm:text-[10px] tabular-nums font-medium',
                      isSelected ? 'text-blue-100' : 'text-slate-400'
                    )}
                  >
                    {opHours} น.
                  </div>
                )}

                {/* Status Indicator Badge */}
                <div className="w-full mt-1">
                  {isSelected ? (
                    <div className="text-[10px] sm:text-[11px] font-bold py-1 px-1.5 rounded-md text-center bg-white/20 text-white backdrop-blur-xs">
                      {dayInfo.status === 'available'
                        ? '🟢 ว่างทั้งวัน'
                        : dayInfo.status === 'partial'
                        ? '🟡 ว่างบางช่วง'
                        : dayInfo.label}
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'text-[10px] sm:text-[11px] font-semibold py-0.5 px-1 sm:px-1.5 rounded-md text-center truncate border',
                        dayInfo.badgeClass
                      )}
                    >
                      {dayInfo.status === 'available' ? '🟢 ว่าง' : dayInfo.label}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Day Summary & Quick Booking Action Bar */}
      <div className="p-4 sm:p-5 border-t border-slate-200/90 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center text-primary shadow-xs flex-shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {selectedDateObj.format('ddd')}
            </span>
            <span className="text-lg font-extrabold leading-none text-slate-800">
              {selectedDateObj.date()}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-slate-800">
                {formatThaiDate(selectedDate, 'ddddที่ D MMMM พ.ศ. BBBB')}
              </h4>
              <span
                className={cn(
                  'text-[11px] font-bold px-2 py-0.5 rounded-full border',
                  selectedStatusInfo.badgeClass
                )}
              >
                {selectedStatusInfo.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <Clock className="w-3.5 h-3.5 text-secondary" />
              <span>
                เวลาเปิดบริการประจำวัน:{' '}
                <strong className="font-semibold text-slate-700">
                  {selectedOperatingHours} น.
                </strong>{' '}
                ({selectedIsWeekend ? 'วันหยุด เสาร์-อาทิตย์' : 'วันธรรมดา จันทร์-ศุกร์'})
              </span>
            </div>
          </div>
        </div>

        {/* Quick Booking Button */}
        {onBookRoom && selectedStatusInfo.status !== 'closed' && selectedStatusInfo.status !== 'full' && (
          <button
            type="button"
            onClick={() => onBookRoom(selectedDate)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl shadow-md shadow-primary/20 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-gold" />
            <span>⚡ จองห้องซ้อมวันนี้</span>
          </button>
        )}
      </div>
    </div>
  );
};
