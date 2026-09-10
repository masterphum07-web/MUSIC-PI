import React from 'react';
import { Room, Booking } from '@/types';
import { Users, Music2, CalendarPlus, Sparkles } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { timeToMinutes } from '@/lib/utils';
import dayjs from 'dayjs';

export interface RoomStatusCardsProps {
  rooms: Room[];
  bookings: Booking[];
  selectedDate: string;
  onBookRoom: (roomId: string) => void;
}

export const RoomStatusCards: React.FC<RoomStatusCardsProps> = ({
  rooms,
  bookings,
  selectedDate,
  onBookRoom,
}) => {
  const isToday = selectedDate === dayjs().format('YYYY-MM-DD');
  const currentMins = isToday
    ? timeToMinutes(dayjs().format('HH:mm'))
    : -1;

  return (
    <div className={rooms.length === 1 ? 'grid grid-cols-1 max-w-2xl mx-auto' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'}>
      {rooms.map((room) => {
        // หาคิวการจองของห้องนี้ในวันที่เลือก
        const roomBookings = bookings.filter(
          (b) => b.room_id === room.room_id && b.status !== 'cancelled'
        );

        // คำนวณสถานะห้อง ณ ปัจจุบัน (ถ้าเป็นวันนี้)
        let statusType: 'available' | 'in_use' | 'upcoming' = 'available';
        let statusText = '🟢 ว่างตลอดวัน';
        let statusSubtext = 'พร้อมสำหรับการจอง';
        let activeBooking: Booking | null = null;

        if (isToday) {
          // ตรวจสอบว่ามีคิวที่กำลังใช้อยู่ในนาทีนี้หรือไม่
          activeBooking =
            roomBookings.find((b) => {
              const start = timeToMinutes(b.start_time);
              const end = timeToMinutes(b.end_time);
              return currentMins >= start && currentMins < end;
            }) || null;

          if (activeBooking) {
            statusType = 'in_use';
            statusText = '🔴 กำลังมีผู้ใช้งาน';
            statusSubtext = `ว่างอีกครั้งเวลา ${activeBooking.end_time} น.`;
          } else {
            // หาคิวถัดไปที่กำลังจะมาถึง
            const nextBooking = roomBookings
              .filter((b) => timeToMinutes(b.start_time) > currentMins)
              .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time))[0];

            if (nextBooking) {
              const startNext = timeToMinutes(nextBooking.start_time);
              const minsLeft = startNext - currentMins;

              if (minsLeft <= 45) {
                statusType = 'upcoming';
                statusText = `🟡 จะมีผู้ใช้ในอีก ${minsLeft} นาที`;
                statusSubtext = `ว่างถึง ${nextBooking.start_time} น.`;
              } else {
                statusType = 'available';
                statusText = '🟢 ว่างตอนนี้';
                statusSubtext = `ว่างจนถึง ${nextBooking.start_time} น.`;
              }
            } else {
              statusType = 'available';
              statusText = '🟢 ว่างจนถึงเวลาปิด';
              statusSubtext = 'ไม่มีคิวจองถัดไปในวันนี้';
            }
          }
        } else {
          statusText = `📅 มีการจอง ${roomBookings.length} คิว`;
          statusSubtext = roomBookings.length > 0 ? 'คลิกเพื่อดูสล็อตเวลา' : 'ยังไม่มีผู้จองในวันนี้';
        }

        // แยกรายการอุปกรณ์ออกมาเป็น chips
        const equipmentList = room.equipment_list
          ? room.equipment_list.split(',').map((e) => e.trim()).filter(Boolean)
          : [];

        return (
          <div
            key={room.room_id}
            className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Top Color Accent Line */}
            <div
              className="h-2 w-full"
              style={{ backgroundColor: room.color_hex || '#1B7A8C' }}
            />

            <div className="p-5 flex-1">
              {/* Header: Room Name & Real-time Status Indicator */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    {room.room_id}
                  </div>
                  <h3 className="text-base font-bold text-slate-850 group-hover:text-primary transition-colors">
                    {room.room_name}
                  </h3>
                </div>

                {/* Status Pill with Pulsing Dot */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    statusType === 'in_use'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : statusType === 'upcoming'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      statusType === 'in_use'
                        ? 'bg-rose-500 animate-pulse'
                        : statusType === 'upcoming'
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span className="text-[11px] leading-none">{statusText}</span>
                </div>
              </div>

              {/* Status Subtext */}
              <div className="text-xs text-slate-500 mb-4 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100 flex items-center justify-between">
                <span>{statusSubtext}</span>
                <span className="text-[11px] font-medium text-primary">
                  {roomBookings.length} คิววันนี้
                </span>
              </div>

              {/* Specs: Capacity */}
              <div className="flex items-center gap-4 text-xs text-slate-600 mb-3.5">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span>
                    ความจุ <strong>{room.capacity}</strong> คน
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Music2 className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span>ระบบเสียงมาตรฐาน</span>
                </div>
              </div>

              {/* Equipment Chips */}
              {equipmentList.length > 0 && (
                <div className="mt-3">
                  <div className="text-[11px] font-medium text-slate-400 mb-1.5">
                    อุปกรณ์ประจำห้อง:
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                    {equipmentList.slice(0, 5).map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-block text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/60"
                      >
                        {item}
                      </span>
                    ))}
                    {equipmentList.length > 5 && (
                      <span className="inline-block text-[10px] text-slate-400 self-center">
                        +{equipmentList.length - 5} รายการ
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Booking Action */}
            <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>จองได้สูงสุด 3 ชม.</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBookRoom(room.room_id)}
                className="bg-white hover:bg-primary hover:text-white hover:border-primary text-xs font-semibold py-1.5 px-3"
              >
                <CalendarPlus className="w-3.5 h-3.5 mr-1" />
                <span>จองห้องนี้</span>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
