import { useState, useEffect } from 'react';
import { Home } from '@/pages/Home';
import { AdminPage } from '@/pages/Admin';
import { ToastProvider } from '@/components/common/Toast';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { BookingModal } from '@/components/booking/BookingModal';
import { BookingSuccessModal } from '@/components/booking/BookingSuccessModal';
import { CheckInOutModal } from '@/components/checkin/CheckInOutModal';
import { AdminLoginModal } from '@/components/admin/AdminLoginModal';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { Booking, PublicState, AdminUser } from '@/types';

function AppContent() {
  const [currentView, setCurrentView] = useState<'home' | 'admin'>('home');
  const [adminToken, setAdminToken] = useState<string | null>(() =>
    localStorage.getItem('wtk_admin_token')
  );
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('wtk_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState<{
    roomId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  } | undefined>(undefined);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [newBooking, setNewBooking] = useState<Booking | null>(null);
  const [isCheckInOutOpen, setIsCheckInOutOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [publicState, setPublicState] = useState<PublicState | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ตรวจสอบ URL Hash เช่น #admin เพื่อเปิดหน้าแอดมินโดยตรง
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        const savedToken = localStorage.getItem('wtk_admin_token');
        if (savedToken) {
          setCurrentView('admin');
        } else {
          setIsAdminLoginOpen(true);
        }
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const handleOpenBooking = (prefill?: {
    roomId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  }) => {
    setBookingPrefill(prefill);
    setIsBookingOpen(true);
  };

  const handleBookingSuccess = (createdBooking: Booking) => {
    setIsBookingOpen(false);
    setNewBooking(createdBooking);
    setIsSuccessOpen(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleOpenCheckIn = () => {
    setIsCheckInOutOpen(true);
  };

  const handleBookingUpdated = (_updatedBooking: Booking) => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleOpenAdmin = () => {
    if (adminToken) {
      setCurrentView('admin');
      window.location.hash = 'admin';
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = (token: string, user: AdminUser) => {
    setAdminToken(token);
    setAdminUser(user);
    setIsAdminLoginOpen(false);
    setCurrentView('admin');
    window.location.hash = 'admin';
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    setCurrentView('home');
    window.location.hash = '';
  };

  // หากอยู่ในหน้าแอดมิน และมี Token ให้แสดง AdminPage
  if (currentView === 'admin' && adminToken) {
    return (
      <AdminPage
        token={adminToken}
        adminUser={adminUser}
        onBackToHome={() => {
          setCurrentView('home');
          window.location.hash = '';
        }}
        onLogout={handleAdminLogout}
      />
    );
  }

  // หน้าจอผู้ใช้งานทั่วไป (Home Public Dashboard)
  return (
    <>
      <Home
        onOpenBookingModal={handleOpenBooking}
        onOpenCheckInOutModal={handleOpenCheckIn}
        onOpenAdminLogin={handleOpenAdmin}
        onSelectBookingDetail={(booking) => setSelectedBooking(booking)}
        refreshTrigger={refreshTrigger}
        onStateLoaded={(state) => setPublicState(state)}
      />

      {/* 1. Modal ฟอร์มจองห้องซ้อมดนตรี (Phase 7) */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={handleBookingSuccess}
        rooms={publicState?.rooms || []}
        bookings={publicState?.bookings || []}
        settings={publicState?.settings}
        prefill={bookingPrefill}
      />

      {/* 2. Modal แสดงผลสำเร็จการจอง + QR Code (Phase 7) */}
      <BookingSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        booking={newBooking}
      />

      {/* 3. Modal เช็คอิน / เช็คเอาต์ / ยกเลิกคิว (Phase 7) */}
      <CheckInOutModal
        isOpen={isCheckInOutOpen}
        onClose={() => setIsCheckInOutOpen(false)}
        onBookingUpdated={handleBookingUpdated}
      />

      {/* 4. Modal เข้าสู่ระบบผู้ดูแล Admin Login (Phase 8) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* 5. Booking Detail Modal (เมื่อคลิกที่บล็อกการจองบน Timeline) */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="รายละเอียดการจองห้องซ้อม"
        description="ข้อมูลคิวการใช้งานห้องซ้อมดนตรี วทก."
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">รหัสจอง:</span>
                <span className="font-bold text-primary font-mono text-sm">
                  {selectedBooking.booking_code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ห้องซ้อม:</span>
                <span className="font-semibold text-slate-800">{selectedBooking.room_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">วันที่:</span>
                <span className="font-semibold text-slate-800">{selectedBooking.booking_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">เวลา:</span>
                <span className="font-bold text-primary">
                  {selectedBooking.start_time} - {selectedBooking.end_time} น.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ผู้จอง:</span>
                <span className="font-semibold text-slate-800">
                  {selectedBooking.full_name} ({selectedBooking.student_year})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">สาขาวิชา:</span>
                <span className="font-semibold text-slate-800">{selectedBooking.major}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">วัตถุประสงค์:</span>
                <span className="text-slate-700">{selectedBooking.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">จำนวนสมาชิก:</span>
                <span className="text-slate-700">{selectedBooking.party_size} คน</span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedBooking(null)}>
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <OfflineBanner />
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
