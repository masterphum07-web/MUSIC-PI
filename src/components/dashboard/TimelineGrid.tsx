import React, { useState, useEffect } from 'react';
import { Room, Booking } from '@/types';
import { timeToMinutes, minutesToTime, getStatusInfo } from '@/lib/utils';
import { Clock, LayoutGrid, List, PlusCircle, Sparkles } from 'lucide-react';
import dayjs from 'dayjs';

export interface TimelineGridProps {
  rooms: Room[];
  bookings: Booking[];
  selectedDate: string;
  operatingHours?: string; // e.g. "08:00-20:00"
  onSelectSlot: (roomId: string, date: string, startTime: string, endTime: string) => void;
  onSelectBooking: (booking: Booking) => void;
}

export const TimelineGrid: React.FC<TimelineGridProps> = ({
  rooms,
  bookings,
  selectedDate,
  operatingHours = '08:00-20:00',
  onSelectSlot,
  onSelectBooking,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hoveredBooking, setHoveredBooking] = useState<Booking | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentTimeMins, setCurrentTimeMins] = useState<number>(() => {
    return timeToMinutes(dayjs().format('HH:mm'));
  });

  // อัปเดตเวลาปัจจุบันทุกนาทีสำหรับเส้นแดง
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeMins(timeToMinutes(dayjs().format('HH:mm')));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // คำนวณขอบเขตเวลาเปิด-ปิด
  const [openTimeStr, closeTimeStr] = operatingHours.split('-');
  const openMins = timeToMinutes(openTimeStr || '08:00');
  const closeMins = timeToMinutes(closeTimeStr || '20:00');
  const totalDurationMins = closeMins - openMins;

  // สร้างจุดเวลาแกน X ทุก 30 นาที (08:00, 08:30, 09:00...)
  const timeSlots = React.useMemo(() => {
    const slots = [];
    for (let m = openMins; m <= closeMins; m += 30) {
      slots.push({
        timeStr: minutesToTime(m),
        minutes: m,
        isHour: m % 60 === 0,
      });
    }
    return slots;
  }, [openMins, closeMins]);

  const isToday = selectedDate === dayjs().format('YYYY-MM-DD');
  const isTimeInOperatingRange =
    isToday && currentTimeMins >= openMins && currentTimeMins <= closeMins;

  const redLinePercent = isTimeInOperatingRange
    ? ((currentTimeMins - openMins) / totalDurationMins) * 100
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 overflow-hidden">
      {/* Header: Title & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-primary">ผังตารางเวลาการใช้ห้องซ้อม (Timeline Grid)</h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              <Sparkles className="w-3 h-3" />
              คลิกช่องว่างเพื่อจอง
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            เวลาทำการประจำวัน {operatingHours} น. • ช่องเวลาละ 30 นาที
          </p>
        </div>

        {/* View Mode Toggle (Grid vs Mobile List) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/60">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>ตารางกริด</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>รายการ</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODE 1: Interactive Timeline Grid                    */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'grid' && (
        <div className="relative overflow-x-auto select-none pb-4">
          <div className="min-w-[960px] relative">
            {/* Header: Time Axis */}
            <div className="flex border-b border-slate-200 pb-2 mb-2">
              <div className="w-48 flex-shrink-0 text-xs font-bold text-slate-400 pl-2">
                ห้องซ้อม / เวลา
              </div>
              <div className="flex-1 relative flex">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.timeStr}
                    className="flex-1 text-center relative border-l border-slate-100 first:border-l-0"
                  >
                    <span
                      className={`text-[11px] tabular-nums ${
                        slot.isHour ? 'font-bold text-slate-700' : 'text-slate-400 text-[10px]'
                      }`}
                    >
                      {slot.isHour ? slot.timeStr : slot.timeStr.split(':')[1]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Red Current Time Line */}
            {redLinePercent !== null && (
              <div
                className="absolute top-0 bottom-0 z-20 pointer-events-none transition-all duration-500"
                style={{
                  left: `calc(12rem + (100% - 12rem) * ${redLinePercent / 100})`,
                }}
              >
                <div className="w-0.5 h-full bg-danger shadow-sm relative">
                  <div className="absolute -top-1.5 -left-3.5 bg-danger text-white text-[9px] font-bold px-1 py-0.5 rounded-sm whitespace-nowrap shadow">
                    ตอนนี้
                  </div>
                </div>
              </div>
            )}

            {/* Rows: One per Room */}
            <div className="space-y-3">
              {rooms.map((room) => {
                const roomBookings = bookings.filter(
                  (b) => b.room_id === room.room_id && b.status !== 'cancelled'
                );

                return (
                  <div
                    key={room.room_id}
                    className="flex items-center group/row rounded-xl hover:bg-slate-50/70 transition-colors p-1 border border-slate-100"
                  >
                    {/* Room Info Left Column */}
                    <div className="w-48 flex-shrink-0 pr-3 pl-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: room.color_hex || '#1B7A8C' }}
                        />
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-slate-800 truncate">
                            {room.room_name}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            ความจุ {room.capacity} คน
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Track Right Area */}
                    <div className="flex-1 relative h-14 bg-slate-100/70 rounded-xl border border-slate-200/80 overflow-hidden flex">
                      {/* Empty Clickable Slots (Each 30 mins) */}
                      {timeSlots.slice(0, -1).map((slot, sIdx) => {
                        const nextSlot = timeSlots[sIdx + 1];
                        return (
                          <div
                            key={slot.timeStr}
                            onClick={() => {
                              onSelectSlot(
                                room.room_id,
                                selectedDate,
                                slot.timeStr,
                                nextSlot ? nextSlot.timeStr : '20:00'
                              );
                            }}
                            title={`คลิกเพื่อจองเวลา ${slot.timeStr} - ${nextSlot ? nextSlot.timeStr : ''} น.`}
                            className="flex-1 h-full border-r border-slate-200/50 hover:bg-emerald-50/80 transition-colors cursor-pointer group/slot relative flex items-center justify-center"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover/slot:opacity-100 transition-opacity" />
                          </div>
                        );
                      })}

                      {/* Positioned Booking Blocks */}
                      {roomBookings.map((b) => {
                        const bStart = timeToMinutes(b.start_time);
                        const bEnd = timeToMinutes(b.end_time);

                        // คำนวณตำแหน่ง %
                        const leftPercent = Math.max(
                          0,
                          ((bStart - openMins) / totalDurationMins) * 100
                        );
                        const widthPercent = Math.min(
                          100 - leftPercent,
                          ((bEnd - bStart) / totalDurationMins) * 100
                        );

                        return (
                          <div
                            key={b.booking_id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectBooking(b);
                            }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                              setHoveredBooking(b);
                            }}
                            onMouseLeave={() => setHoveredBooking(null)}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                            className={`absolute top-1.5 bottom-1.5 rounded-lg shadow-sm border p-1.5 cursor-pointer flex flex-col justify-between overflow-hidden transition-all duration-200 hover:z-30 hover:scale-[1.02] hover:shadow-md ${
                              b.status === 'checked_in'
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : b.status === 'overdue'
                                ? 'bg-amber-500 text-white border-amber-600'
                                : 'bg-primary text-white border-primary-dark'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 leading-none">
                              <span className="text-[11px] font-bold truncate">
                                {b.full_name}
                              </span>
                              <span
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  b.status === 'checked_in' ? 'bg-white animate-pulse' : 'bg-gold'
                                }`}
                              />
                            </div>
                            <div className="text-[9px] opacity-90 tabular-nums truncate">
                              {b.start_time} - {b.end_time} น.
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODE 2: Responsive List View (Friendly for Mobile)   */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {rooms.map((room) => {
            const roomBookings = bookings.filter(
              (b) => b.room_id === room.room_id && b.status !== 'cancelled'
            );

            return (
              <div key={room.room_id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: room.color_hex || '#1B7A8C' }}
                    />
                    <h3 className="font-bold text-sm text-slate-800">{room.room_name}</h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    ความจุ {room.capacity} คน
                  </span>
                </div>

                {roomBookings.length === 0 ? (
                  <div className="text-xs text-slate-400 py-3 text-center bg-white rounded-lg border border-dashed border-slate-200">
                    ยังไม่มีการจองในวันนี้ — ห้องว่างตลอดช่วงเวลาทำการ
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {roomBookings.map((b) => {
                      const status = getStatusInfo(b.status);
                      return (
                        <div
                          key={b.booking_id}
                          onClick={() => onSelectBooking(b)}
                          className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-primary transition-colors"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-800">
                              {b.full_name} ({b.student_year})
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {b.major}
                            </div>
                            <div className="text-xs text-primary font-semibold tabular-nums mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{b.start_time} - {b.end_time} น.</span>
                            </div>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${status.badgeClass}`}>
                            {status.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Hover Tooltip */}
      {hoveredBooking && (
        <div
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 8}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="fixed z-50 pointer-events-none bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs max-w-xs w-64 border border-slate-700 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-slate-800 pb-1.5">
            <span className="font-bold text-gold">{hoveredBooking.full_name}</span>
            <span className="text-[10px] text-slate-400">{hoveredBooking.booking_code}</span>
          </div>
          <div className="space-y-1 text-slate-300 text-[11px]">
            <div>
              <span className="text-slate-400">ชั้นปี/สาขา:</span> {hoveredBooking.student_year} {hoveredBooking.major}
            </div>
            <div>
              <span className="text-slate-400">เวลาที่จอง:</span>{' '}
              <strong className="text-white">
                {hoveredBooking.start_time} - {hoveredBooking.end_time} น.
              </strong>
            </div>
            <div>
              <span className="text-slate-400">วัตถุประสงค์:</span> {hoveredBooking.purpose}
            </div>
            <div>
              <span className="text-slate-400">สมาชิก:</span> {hoveredBooking.party_size} คน
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
