import React, { useState, useEffect } from 'react';
import { Music, Clock, CalendarPlus, LogIn, KeyRound } from 'lucide-react';
import { Button } from '@/components/common/Button';
import dayjs from 'dayjs';

export interface AppHeaderProps {
  onOpenBooking: () => void;
  onOpenCheckIn: () => void;
  onOpenAdmin: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenBooking,
  onOpenCheckIn,
  onOpenAdmin,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = dayjs();
      setCurrentTime(now.format('HH:mm:ss'));
      setCurrentDate(now.format('D MMMM BBBB'));
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-md shadow-primary/20 flex-shrink-0">
              <Music className="w-6 h-6 text-gold" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-secondary tracking-wider uppercase flex items-center gap-1.5">
                <span>วทก.</span>
                <span className="inline-block w-1 h-1 rounded-full bg-secondary/50"></span>
                <span className="hidden sm:inline">วิทยาลัยเทคโนโลยีทางการแพทย์และสาธารณสุข กาญจนาภิเษก</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-primary tracking-tight leading-tight">
                ระบบจองห้องซ้อมดนตรี ชมรมดนตรี
              </h1>
            </div>
          </div>

          {/* Right Actions & Real-time Clock */}
          <div className="flex items-center gap-3">
            {/* Real-time Clock (Desktop) */}
            <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700">
              <Clock className="w-4 h-4 text-secondary flex-shrink-0 animate-pulse" />
              <div className="text-right">
                <div className="text-xs font-semibold tabular-nums text-slate-800 tracking-wider">
                  {currentTime || '00:00:00'} น.
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {currentDate}
                </div>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="gold"
                size="sm"
                onClick={onOpenBooking}
                className="shadow-sm font-semibold sm:px-4"
              >
                <CalendarPlus className="w-4 h-4 mr-1 text-amber-950" />
                <span>จองห้องซ้อม</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onOpenCheckIn}
                className="hidden sm:inline-flex border-slate-300"
              >
                <LogIn className="w-4 h-4 mr-1 text-secondary" />
                <span>เช็คอิน / เอาต์</span>
              </Button>

              {/* Admin Console Link */}
              <button
                onClick={onOpenAdmin}
                className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-xl transition-colors focus:outline-none"
                title="เข้าสู่ระบบผู้ดูแล (Admin Console)"
                aria-label="Admin Login"
              >
                <KeyRound className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
