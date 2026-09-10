import React, { useState, useEffect, useCallback } from 'react';
import { getPublicState } from '@/lib/api';
import { PublicState, Booking } from '@/types';
import { AppHeader } from '@/components/dashboard/AppHeader';
import { AnnouncementBar } from '@/components/dashboard/AnnouncementBar';
import { DateStrip } from '@/components/dashboard/DateStrip';
import { RoomStatusCards } from '@/components/dashboard/RoomStatusCards';
import { TimelineGrid } from '@/components/dashboard/TimelineGrid';
import { TodaySummary } from '@/components/dashboard/TodaySummary';
import { RulesFooter } from '@/components/dashboard/RulesFooter';
import { Skeleton, ErrorState, EmptyState } from '@/components/common/States';
import { RotateCw, Music } from 'lucide-react';
import dayjs from 'dayjs';

export interface HomeProps {
  onOpenBookingModal: (prefill?: { roomId?: string; date?: string; startTime?: string; endTime?: string }) => void;
  onOpenCheckInOutModal: () => void;
  onOpenAdminLogin: () => void;
  onSelectBookingDetail: (booking: Booking) => void;
}

export const Home: React.FC<HomeProps> = ({
  onOpenBookingModal,
  onOpenCheckInOutModal,
  onOpenAdminLogin,
  onSelectBookingDetail,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => dayjs().format('YYYY-MM-DD'));
  const [state, setState] = useState<PublicState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // ฟังก์ชันดึงข้อมูล Public State จาก Backend
  const loadData = useCallback(async (date: string, isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const res = await getPublicState(date);
      setState(res);
      setLastUpdated(dayjs().format('HH:mm:ss'));
    } catch (err: any) {
      console.error('Error fetching public state:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลคิวห้องซ้อมได้ กรุณาตรวจสอบการเชื่อมต่อ');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // ดึงข้อมูลครั้งแรก และเมื่อเลือกวันที่เปลี่ยนไป
  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate, loadData]);

  // ระบบ Auto-refresh ทุก 60 วินาที
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(selectedDate, true);
    }, 60000);
    return () => clearInterval(interval);
  }, [selectedDate, loadData]);

  // คำนวณจำนวนคิวเพื่อแสดงใน DateStrip badge
  const bookingCountsByDate = React.useMemo(() => {
    const counts: Record<string, number> = {};
    if (state?.bookings) {
      counts[selectedDate] = state.bookings.filter((b) => b.status !== 'cancelled').length;
    }
    return counts;
  }, [state, selectedDate]);

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between">
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
          {/* Top Bar: DateStrip & Manual Refresh Indicator */}
          <div className="space-y-3">
            <DateStrip
              selectedDate={selectedDate}
              onSelectDate={(newDate) => setSelectedDate(newDate)}
              bookingCountsByDate={bookingCountsByDate}
              advanceDays={state?.settings?.advance_booking_days || 14}
            />

            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>อัปเดตอัตโนมัติทุก 60 วินาที</span>
                {lastUpdated && <span>(ล่าสุด {lastUpdated} น.)</span>}
              </div>

              <button
                onClick={() => loadData(selectedDate, true)}
                disabled={isRefreshing || isLoading}
                className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark font-medium transition-colors focus:outline-none disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>รีเฟรชข้อมูล</span>
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && !state && (
            <ErrorState
              message={error}
              onRetry={() => loadData(selectedDate)}
            />
          )}

          {/* Loading Skeleton */}
          {isLoading && !state && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
              <Skeleton className="h-80 w-full" />
            </div>
          )}

          {/* Data Loaded Successfully */}
          {state && (
            <>
              {/* 3. Today Metrics Summary */}
              <TodaySummary
                bookings={state.bookings || []}
                rooms={state.rooms || []}
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

                {state.rooms.length === 0 ? (
                  <EmptyState title="ไม่พบห้องซ้อมที่เปิดให้บริการ" />
                ) : (
                  <RoomStatusCards
                    rooms={state.rooms}
                    bookings={state.bookings || []}
                    selectedDate={selectedDate}
                    onBookRoom={(roomId) =>
                      onOpenBookingModal({ roomId, date: selectedDate })
                    }
                  />
                )}
              </section>

              {/* 5. Timeline Grid (Main Interactive Component) */}
              <section className="space-y-3">
                <TimelineGrid
                  rooms={state.rooms}
                  bookings={state.bookings || []}
                  selectedDate={selectedDate}
                  operatingHours={
                    dayjs(selectedDate).day() === 0 || dayjs(selectedDate).day() === 6
                      ? state.settings?.operating_hours_weekend || '09:00-18:00'
                      : state.settings?.operating_hours_weekday || '08:00-20:00'
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
          )}

          {/* 6. Rules Footer */}
          <RulesFooter contactInfo={state?.settings?.contact_info} />
        </main>
      </div>
    </div>
  );
};
