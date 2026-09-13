import React, { useState, useEffect, useCallback } from 'react';
import { getPublicState } from '@/lib/api';
import {
  PublicState,
  Booking,
  DEFAULT_RULES_TITLE,
  DEFAULT_RULES_TEXT,
  DEFAULT_CONTACT_TITLE,
  DEFAULT_CONTACT_LOCATION,
  DEFAULT_FOOTER_COPYRIGHT,
  DEFAULT_FOOTER_TAGLINE,
} from '@/types';
import { AppHeader } from '@/components/dashboard/AppHeader';
import { AnnouncementBar } from '@/components/dashboard/AnnouncementBar';
import { DateStrip } from '@/components/dashboard/DateStrip';
import { CalendarView } from '@/components/dashboard/CalendarView';
import { RoomStatusCards } from '@/components/dashboard/RoomStatusCards';
import { TimelineGrid } from '@/components/dashboard/TimelineGrid';
import { TodaySummary } from '@/components/dashboard/TodaySummary';
import { RulesFooter } from '@/components/dashboard/RulesFooter';
import { RotateCw, Music, Calendar } from 'lucide-react';
import dayjs from 'dayjs';

export interface HomeProps {
  onOpenBookingModal: (prefill?: { roomId?: string; date?: string; startTime?: string; endTime?: string }) => void;
  onOpenCheckInOutModal: (tab?: 'checkin' | 'checkout' | 'lookup', code?: string) => void;
  onOpenAdminLogin: () => void;
  onSelectBookingDetail: (booking: Booking) => void;
  refreshTrigger?: number;
  onStateLoaded?: (state: PublicState) => void;
  isModalActive?: boolean;
}

// ข้อมูลเริ่มต้นสำหรับแสดงผลทันทีแบบ 0 ms ไม่ต้องรอโหลดหน้าจอเปล่า
const DEFAULT_INITIAL_STATE: PublicState = {
  selected_date: dayjs().format('YYYY-MM-DD'),
  rooms: [
    {
      room_id: 'ROOM-01',
      room_name: 'ห้องซ้อมดนตรี ชมรมดนตรี วทก.',
      capacity: 10,
      equipment_list: 'กลองชุด Pearl, แอมป์กีตาร์ Marshall, แอมป์เบส Fender, คีย์บอร์ด Roland, ไมโครโฟน Shure x2, PA System',
      color_hex: '#1B7A8C',
      sort_order: 1,
    },
  ],
  bookings: [],
  settings: {
    operating_hours_weekday: '16:30-20:00',
    operating_hours_weekend: '09:00-20:00',
    min_booking_minutes: 30,
    max_booking_hours: 3,
    advance_booking_days: 14,
    grace_period_minutes: 30,
    privacy_mode: false,
    system_status: 'open',
    announcement_text: 'ยินดีต้อนรับสู่ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก. เปิดให้บริการ จันทร์-ศุกร์ 16:30 - 20:00 น. และ เสาร์-อาทิตย์ 09:00 - 20:00 น.',
    contact_info: 'ชมรมดนตรี วิทยาลัยเทคโนโลยีทางการแพทย์และสาธารณสุข กาญจนาภิเษก (วทก.)',
    rules_title: DEFAULT_RULES_TITLE,
    rules_text: DEFAULT_RULES_TEXT,
    contact_title: DEFAULT_CONTACT_TITLE,
    contact_location: DEFAULT_CONTACT_LOCATION,
    footer_copyright: DEFAULT_FOOTER_COPYRIGHT,
    footer_tagline: DEFAULT_FOOTER_TAGLINE,
  },
  blackouts: [],
  server_time: dayjs().format('HH:mm:ss'),
};

const getInitialState = (date: string): PublicState => {
  try {
    const cached = localStorage.getItem(`wtk_cached_public_state_${date}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.rooms) && parsed.rooms.length > 0) {
        return parsed;
      }
    }
    const generalCached = localStorage.getItem('wtk_cached_public_state_latest');
    if (generalCached) {
      const parsed = JSON.parse(generalCached);
      if (parsed && Array.isArray(parsed.rooms) && parsed.rooms.length > 0) {
        return { ...parsed, bookings: [] };
      }
    }
  } catch (e) {
    console.warn('Cache read error:', e);
  }
  return DEFAULT_INITIAL_STATE;
};

export const Home: React.FC<HomeProps> = ({
  onOpenBookingModal,
  onOpenCheckInOutModal,
  onOpenAdminLogin,
  onSelectBookingDetail,
  refreshTrigger,
  onStateLoaded,
  isModalActive = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => dayjs().format('YYYY-MM-DD'));
  const [state, setState] = useState<PublicState>(() => getInitialState(dayjs().format('YYYY-MM-DD')));
  const [isRefreshing, setIsRefreshing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [scheduleView, setScheduleView] = useState<'calendar' | 'strip'>('calendar');

  const onStateLoadedRef = React.useRef(onStateLoaded);
  useEffect(() => {
    onStateLoadedRef.current = onStateLoaded;
  }, [onStateLoaded]);

  const selectedDateRef = React.useRef(selectedDate);
  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  const isFetchingRef = React.useRef(false);
  const lastFetchTimeRef = React.useRef(0);

  // ฟังก์ชันดึงข้อมูล Public State จาก Backend แบบ Stale-While-Revalidate (พร้อม Concurrency Lock & Throttling ป้องกัน Infinite Loop 100%)
  const loadData = useCallback(async (date: string, isManualRefresh = false) => {
    if (isFetchingRef.current) return;

    const now = Date.now();
    // หากไม่ใช่การกดปุ่มรีเฟรชเองโดยตรง และเพิ่งโหลดไปไม่ถึง 2.5 วินาที ให้ข้ามเพื่อป้องกันกระพริบซ้ำ
    if (!isManualRefresh && now - lastFetchTimeRef.current < 2500) {
      return;
    }

    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;
    setIsRefreshing(true);
    setError(null);

    try {
      const res = await getPublicState(date);
      setState(res);
      try {
        localStorage.setItem(`wtk_cached_public_state_${date}`, JSON.stringify(res));
        localStorage.setItem('wtk_cached_public_state_latest', JSON.stringify(res));
      } catch {}
      if (onStateLoadedRef.current) onStateLoadedRef.current(res);
      setLastUpdated(dayjs().format('HH:mm:ss'));
    } catch (err: any) {
      console.error('Error fetching public state:', err);
      // หากมีข้อมูลเดิมอยู่แล้ว ไม่ต้องแสดง Error เต็มจอ แค่แจ้งเตือน
      setError(err.message || 'ไม่สามารถดึงข้อมูลคิวล่าสุดได้');
    } finally {
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  // เมื่อเปลี่ยนวันที่ ให้โหลดจาก Cache ทันทีแล้ว Sync ข้อมูลจริงเบื้องหลัง
  useEffect(() => {
    try {
      const cached = localStorage.getItem(`wtk_cached_public_state_${selectedDate}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.rooms)) {
          setState(parsed);
        }
      }
    } catch {}
    loadData(selectedDate);
  }, [selectedDate, loadData]);

  // รีเฟรชเมื่อมีการแจ้งเตือนจากภายนอก เช่น จองสำเร็จ หรือ เช็คอิน/เช็คเอาต์ หรือ อนุมัติคิว
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      try {
        localStorage.removeItem(`wtk_cached_public_state_${selectedDateRef.current}`);
        localStorage.removeItem('wtk_cached_public_state_latest');
      } catch {}
      loadData(selectedDateRef.current, true);
    }
  }, [refreshTrigger, loadData]);

  // เมื่อผู้ใช้สลับหน้าจอหรือเปิดแท็บกลับมา ให้โหลดข้อมูลสดทันที (งดรันถ้ากำลังเปิด Modal ใดๆ อยู่ เพื่อไม่ให้กวนฟอร์ม)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isModalActive) return;
      if (document.visibilityState === 'visible') {
        try {
          localStorage.removeItem(`wtk_cached_public_state_${selectedDateRef.current}`);
        } catch {}
        loadData(selectedDateRef.current, true);
      }
    };
    const handleFocus = () => {
      if (isModalActive) return;
      loadData(selectedDateRef.current, true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadData, isModalActive]);

  // ระบบ Auto-refresh ทุก 15 วินาที เพื่อให้ตารางหน้าเว็บเป็นปัจจุบันตลอดเวลา (หยุดชั่วคราวขณะ Modal กำลังเปิดอยู่ 100%)
  useEffect(() => {
    if (isModalActive) return;
    const interval = setInterval(() => {
      loadData(selectedDateRef.current, false);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadData, isModalActive]);

  // คำนวณจำนวนคิวเพื่อแสดงใน DateStrip และ CalendarView
  const bookingCountsByDate = React.useMemo(() => {
    const counts: Record<string, number> = {};
    if (state?.calendar_summary) {
      for (const [d, sum] of Object.entries(state.calendar_summary)) {
        counts[d] = sum.count;
      }
    } else if (state?.bookings) {
      counts[selectedDate] = state.bookings.filter((b) => b.status !== 'cancelled').length;
    }
    return counts;
  }, [state, selectedDate]);

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between relative">
      {/* Top Sync Indicator Bar */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-secondary via-gold to-secondary animate-pulse" />
      )}

      {/* 1. Header */}
      <div>
        <AppHeader
          onOpenBooking={() => onOpenBookingModal({ date: selectedDate })}
          onOpenCheckIn={onOpenCheckInOutModal}
          onOpenAdmin={onOpenAdminLogin}
        />

        {/* 2. Announcement Bar */}
        <AnnouncementBar text={state?.settings?.announcement_text} />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
          {/* Top Bar: Calendar View / DateStrip & Manual Refresh Indicator */}
          <div className="space-y-3">
            {/* View Switcher Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>ตารางตรวจสอบสถานะความว่าง & คิวจอง</span>
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  (เลือกดูแบบปฏิทินรายเดือน หรือแถบเลื่อนรายวัน)
                </span>
              </div>

              {/* View Switcher Segmented Control */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setScheduleView('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    scheduleView === 'calendar'
                      ? 'bg-white text-primary shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-secondary" />
                  <span>🗓️ ปฏิทินแสดงความว่าง</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleView('strip')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    scheduleView === 'strip'
                      ? 'bg-white text-primary shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>↔️ แถบเลื่อน</span>
                </button>
              </div>
            </div>

            {/* View Component */}
            {scheduleView === 'calendar' ? (
              <CalendarView
                selectedDate={selectedDate}
                onSelectDate={(newDate) => setSelectedDate(newDate)}
                onBookRoom={(date) => onOpenBookingModal({ date })}
                advanceDays={state?.settings?.advance_booking_days || 14}
                calendarSummary={state?.calendar_summary}
                bookings={state?.bookings || []}
                blackouts={state?.blackouts || []}
                weekdayHours={state?.settings?.operating_hours_weekday || '16:30-20:00'}
                weekendHours={state?.settings?.operating_hours_weekend || '09:00-20:00'}
              />
            ) : (
              <DateStrip
                selectedDate={selectedDate}
                onSelectDate={(newDate) => setSelectedDate(newDate)}
                bookingCountsByDate={bookingCountsByDate}
                advanceDays={state?.settings?.advance_booking_days || 14}
              />
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-amber-400 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
                <span>{isRefreshing ? 'กำลังเชื่อมต่อและตรวจสอบคิวล่าสุด...' : 'ข้อมูลคิวเป็นปัจจุบัน'}</span>
                {lastUpdated && <span>(ล่าสุด {lastUpdated} น.)</span>}
              </div>

              <button
                onClick={() => loadData(selectedDate, true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark font-medium transition-colors focus:outline-none disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-secondary' : ''}`} />
                <span>รีเฟรชข้อมูล</span>
              </button>
            </div>
          </div>

          {/* Warning Banner if fetch failed but cached data is showing */}
          {error && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center justify-between shadow-sm">
              <span>⚠️ แสดงข้อมูลจากแคชล่าสุด ({error})</span>
              <button
                onClick={() => loadData(selectedDate, true)}
                className="font-bold underline ml-2 text-primary hover:text-primary-dark"
              >
                ลองเชื่อมต่อใหม่
              </button>
            </div>
          )}

          {/* Quick Check-in / Check-out Action Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-amber-50 border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-800">
                  มีคิวจองแล้วใช่ไหม? เช็คอินและคืนห้องง่ายๆ ใน 1 คลิก
                </div>
                <div className="text-[11px] text-slate-500">
                  กรอกเพียงรหัสจอง (เช่น MB-2609-XXXX) หรือสแกน QR Code ไม่ต้องพิมพ์ชื่อ-นามสกุลซ้ำ
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onOpenCheckInOutModal('checkin')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-sm transition-all"
              >
                <span>🟢 เช็คอินเข้าห้อง</span>
              </button>
              <button
                onClick={() => onOpenCheckInOutModal('checkout')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 active:scale-95 border border-amber-300 rounded-xl shadow-sm transition-all"
              >
                <span>🚪 คืนห้องซ้อม</span>
              </button>
            </div>
          </div>

          {/* Data Loaded Successfully */}
          {state && (() => {
            // ล็อคให้แสดงห้องซ้อมเดี่ยวของ วทก. ตามความต้องการของผู้ใช้
            const baseRoom = state.rooms.find((r) => r.room_id === 'ROOM-01') || state.rooms[0] || {
              room_id: 'ROOM-01',
              room_name: 'ห้องซ้อมดนตรี ชมรมดนตรี วทก.',
              capacity: 10,
              equipment_list: 'กลองชุด Pearl, แอมป์กีตาร์ Marshall, แอมป์เบส Fender, คีย์บอร์ด Roland, ไมโครโฟน Shure x2, PA System',
              color_hex: '#1B7A8C',
              sort_order: 1,
            };
            const singleRooms = [
              {
                ...baseRoom,
                room_id: 'ROOM-01',
                room_name: 'ห้องซ้อมดนตรี ชมรมดนตรี วทก.',
                capacity: baseRoom.capacity || 10,
                equipment_list: baseRoom.equipment_list || 'กลองชุด, แอมป์กีตาร์, แอมป์เบส, คีย์บอร์ด, ไมโครโฟน, PA System',
              },
            ];

            return (
              <>
                {/* 3. Today Metrics Summary */}
                <TodaySummary
                  bookings={state.bookings || []}
                  rooms={singleRooms}
                  selectedDate={selectedDate}
                />

                {/* 4. Room Status Cards */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
                      <Music className="w-5 h-5 text-secondary" />
                      <span>สถานะห้องซ้อมดนตรี</span>
                    </h2>
                  </div>

                  <RoomStatusCards
                    rooms={singleRooms}
                    bookings={state.bookings || []}
                    selectedDate={selectedDate}
                    onBookRoom={(roomId) =>
                      onOpenBookingModal({ roomId, date: selectedDate })
                    }
                  />
                </section>

                {/* 5. Timeline Grid (Main Interactive Component) */}
                <section className="space-y-3">
                  <TimelineGrid
                    rooms={singleRooms}
                    bookings={state.bookings || []}
                    selectedDate={selectedDate}
                    operatingHours={
                      dayjs(selectedDate).day() === 0 || dayjs(selectedDate).day() === 6
                        ? state.settings?.operating_hours_weekend || '09:00-20:00'
                        : state.settings?.operating_hours_weekday || '16:30-20:00'
                    }
                    onSelectSlot={(roomId, date, startTime, endTime) => {
                      onOpenBookingModal({
                        roomId,
                        date,
                        startTime,
                        endTime,
                      });
                    }}
                    onSelectBooking={onSelectBookingDetail}
                  />
                </section>
              </>
            );
          })()}

          {/* 6. Rules Footer */}
          <RulesFooter settings={state?.settings} contactInfo={state?.settings?.contact_info} />
        </main>
      </div>
    </div>
  );
};
