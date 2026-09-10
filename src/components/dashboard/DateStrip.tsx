import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

export interface DateStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  bookingCountsByDate?: Record<string, number>;
  advanceDays?: number;
}

export const DateStrip: React.FC<DateStripProps> = ({
  selectedDate,
  onSelectDate,
  bookingCountsByDate = {},
  advanceDays = 14,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // สร้างรายการวันที่ 14 วันข้างหน้านับจากวันนี้
  const days = React.useMemo(() => {
    const list = [];
    const today = dayjs();
    for (let i = 0; i < advanceDays; i++) {
      const d = today.add(i, 'day');
      const dateStr = d.format('YYYY-MM-DD');
      const dayName = d.format('ddd'); // จ., อ., พ., ...
      const dayNumber = d.format('D'); // 1, 2, ...
      const monthYear = d.format('MMM BB'); // ก.ย. 69
      const isToday = i === 0;

      list.push({
        dateStr,
        dayName,
        dayNumber,
        monthYear,
        isToday,
      });
    }
    return list;
  }, [advanceDays]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <CalendarIcon className="w-4 h-4 text-primary" />
          <span>เลือกวันที่ต้องการดูคิว / จองห้องซ้อม</span>
          <span className="text-[11px] font-normal text-slate-400">
            (เปิดให้จองล่วงหน้าได้ {advanceDays} วัน)
          </span>
        </div>

        {/* Scroll Arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors focus:outline-none"
            aria-label="เลื่อนซ้าย"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors focus:outline-none"
            aria-label="เลื่อนขวา"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Days */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {days.map((item) => {
          const isSelected = item.dateStr === selectedDate;
          const count = bookingCountsByDate[item.dateStr] || 0;

          return (
            <button
              key={item.dateStr}
              onClick={() => onSelectDate(item.dateStr)}
              className={cn(
                'flex-shrink-0 flex flex-col items-center justify-between py-2.5 px-3 min-w-[76px] rounded-xl border transition-all duration-200 focus:outline-none select-none',
                isSelected
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]'
                  : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              )}
            >
              {/* Day Name */}
              <span
                className={cn(
                  'text-[11px] font-medium tracking-wide',
                  isSelected ? 'text-blue-100' : 'text-slate-500'
                )}
              >
                {item.isToday ? 'วันนี้' : item.dayName}
              </span>

              {/* Day Number */}
              <span className="text-lg font-bold tabular-nums my-0.5 leading-none">
                {item.dayNumber}
              </span>

              {/* Month / Year */}
              <span
                className={cn(
                  'text-[10px]',
                  isSelected ? 'text-blue-200' : 'text-slate-400'
                )}
              >
                {item.monthYear}
              </span>

              {/* Queue Badge */}
              <div className="mt-1.5">
                {count > 0 ? (
                  <span
                    className={cn(
                      'inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none',
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-primary/10 text-primary'
                    )}
                  >
                    {count} คิว
                  </span>
                ) : (
                  <span
                    className={cn(
                      'inline-block text-[10px] font-normal leading-none',
                      isSelected ? 'text-blue-200' : 'text-slate-400'
                    )}
                  >
                    ว่าง
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
