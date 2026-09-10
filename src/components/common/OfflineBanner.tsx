import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold transition-all animate-bounce ${
        !isOnline
          ? 'bg-rose-600 text-white border border-rose-500'
          : 'bg-emerald-600 text-white border border-emerald-500'
      }`}
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-4 h-4 text-white" />
          <span>การเชื่อมต่ออินเทอร์เน็ตขาดหาย กำลังรอการเชื่อมต่อใหม่...</span>
        </>
      ) : (
        <>
          <Wifi className="w-4 h-4 text-white" />
          <span>เชื่อมต่ออินเทอร์เน็ตสำเร็จ ข้อมูลพร้อมใช้งาน</span>
        </>
      )}
    </div>
  );
};
