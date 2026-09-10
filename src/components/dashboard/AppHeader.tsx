import React, { useState, useEffect } from 'react';
import { Clock, CalendarPlus, LogIn, LogOut, KeyRound } from 'lucide-react';
import { Button } from '@/components/common/Button';
import dayjs from 'dayjs';

export interface AppHeaderProps {
  onOpenBooking: () => void;
  onOpenCheckIn: (tab?: 'checkin' | 'checkout' | 'lookup') => void;
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
            <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0">
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="ตราสัญลักษณ์ วิทยาลัยเทคโนโลยีทางการแพทย์และสาธารณสุข กาญจนาภิเษก"
                className="w-full h-full object-contain drop-shadow-md hover:scale-105 transition-transform"
              />
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
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="gold"
                size="sm"
                onClick={onOpenBooking}
                className="shadow-sm font-semibold text-xs sm:text-sm px-2.5 sm:px-4"
              >
                <CalendarPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 text-amber-950" />
                <span>จองห้องซ้อม</span>
              </Button>

              <button
                onClick={() => onOpenCheckIn('checkin')}
                className="inline-flex items-center justify-center font-medium transition-all text-xs px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 shadow-sm"
                title="เช็คอินเข้าใช้งานห้องซ้อม"
              >
                <LogIn className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span>เช็คอิน</span>
              </button>

              <button
                onClick={() => onOpenCheckIn('checkout')}
                className="hidden sm:inline-flex items-center justify-center font-medium transition-all text-xs px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 shadow-sm"
                title="เช็คเอาต์ คืนห้องซ้อม"
              >
                <LogOut className="w-3.5 h-3.5 mr-1 text-amber-600" />
                <span>คืนห้อง</span>
              </button>

              {/* Admin Console Link */}
              <button
                onClick={onOpenAdmin}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-xl transition-colors focus:outline-none"
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
