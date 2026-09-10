import React from 'react';
import { Booking, Room } from '@/types';
import { CalendarCheck, Radio, Music, Clock } from 'lucide-react';
import { timeToMinutes } from '@/lib/utils';
import dayjs from 'dayjs';

export interface TodaySummaryProps {
  bookings: Booking[];
  rooms: Room[];
  selectedDate: string;
}

export const TodaySummary: React.FC<TodaySummaryProps> = ({
  bookings,
  rooms,
  selectedDate,
}) => {
  const isToday = selectedDate === dayjs().format('YYYY-MM-DD');
  const currentMins = isToday ? timeToMinutes(dayjs().format('HH:mm')) : -1;

  // 1. จองทั้งหมดวันนี้
  const validBookings = bookings.filter((b) => b.status !== 'cancelled');
  const totalBookings = validBookings.length;

  // 2. กำลังใช้งานตอนนี้
  let activeNow = 0;
  if (isToday) {
    activeNow = validBookings.filter((b) => {
      const start = timeToMinutes(b.start_time);
      const end = timeToMinutes(b.end_time);
      return currentMins >= start && currentMins < end;
    }).length;
  }

  // 3. ห้องว่างในขณะนี้
  const availableRoomsNow = Math.max(0, rooms.length - activeNow);

  // 4. ชั่วโมงใช้งานรวม
  let totalHours = 0;
  validBookings.forEach((b) => {
    const start = timeToMinutes(b.start_time);
    const end = timeToMinutes(b.end_time);
    if (start !== -1 && end !== -1 && end > start) {
      totalHours += (end - start) / 60;
    }
  });

  const cards = [
    {
      title: 'จองทั้งหมดวันนี้',
      value: totalBookings,
      unit: 'คิว',
      icon: <CalendarCheck className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50/70',
      border: 'border-blue-100',
    },
    {
      title: 'กำลังใช้งานตอนนี้',
      value: isToday ? activeNow : '-',
      unit: isToday ? 'ห้อง' : '',
      icon: <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />,
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-100',
    },
    {
      title: 'ห้องที่ว่างขณะนี้',
      value: isToday ? availableRoomsNow : rooms.length,
      unit: 'ห้อง',
      icon: <Music className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50/70',
      border: 'border-teal-100',
    },
    {
      title: 'ชั่วโมงใช้งานรวม',
      value: Math.round(totalHours * 10) / 10,
      unit: 'ชม.',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50/70',
      border: 'border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-2xl border ${c.border} ${c.bg} bg-white shadow-sm flex items-center justify-between`}
        >
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">{c.title}</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums text-slate-850">
                {c.value}
              </span>
              {c.unit && <span className="text-xs text-slate-400 font-medium">{c.unit}</span>}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0">
            {c.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
