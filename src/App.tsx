import { useState, useEffect, useCallback } from 'react';
import { Home } from '@/pages/Home';
import { AdminPage } from '@/pages/Admin';
import { ToastProvider } from '@/components/common/Toast';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { BookingModal } from '@/components/booking/BookingModal';
import { BookingSuccessModal } from '@/components/booking/BookingSuccessModal';
import { DirectApprovalModal } from '@/components/booking/DirectApprovalModal';
import { CheckInOutModal } from '@/components/checkin/CheckInOutModal';
import { AdminLoginModal } from '@/components/admin/AdminLoginModal';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { Booking, PublicState, AdminUser } from '@/types';

function AppContent() {
  const [currentView, setCurrentView] = useState<'home' | 'admin'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      const savedToken = localStorage.getItem('wtk_admin_token');
      if (savedToken) return 'admin';
    }
    return 'home';
  });
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
  const [checkInOutTab, setCheckInOutTab] = useState<'checkin' | 'checkout' | 'lookup'>('checkin');
  const [initialBookingCode, setInitialBookingCode] = useState<string>('');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [publicState, setPublicState] = useState<PublicState | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ตรวจจับ URL Parameters สำหรับการอนุมัติผ่านอีเมล (?action=approve_booking&id=...&token=...)
  const [directApprovalParams, setDirectApprovalParams] = useState<{
    action: 'approve_booking' | 'reject_booking';
    id: string;
    token: string;
    reason?: string;
  } | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const url = new URL(window.location.href);
      const action = url.searchParams.get('action');
      const id = url.searchParams.get('id');
      const token = url.searchParams.get('token');
      const reason = url.searchParams.get('reason') || undefined;
      if ((action === 'approve_booking' || action === 'reject_booking') && id && token) {
        return { action, id, token, reason };
      }
    } catch {}
    return null;
  });

  // ตรวจจับ URL Query Parameters เช่น ?action=checkin หรือ ?admin=true จากการสแกน QR Code หรือปุ่มในอีเมล
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const action = url.searchParams.get('action');
      const code = url.searchParams.get('code');
      const isAdmin = url.searchParams.get('admin');

      if (isAdmin === 'true') {
        const savedToken = localStorage.getItem('wtk_admin_token');
        if (savedToken) {
          setCurrentView('admin');
        } else {
          setIsAdminLoginOpen(true);
        }
      }

      if (action === 'checkin' || action === 'checkout' || action === 'cancel' || code) {
        if (code) setInitialBookingCode(code.toUpperCase());
        if (action === 'checkout') setCheckInOutTab('checkout');
        else if (action === 'cancel') setCheckInOutTab('lookup');
        else setCheckInOutTab('checkin');
        setIsCheckInOutOpen(true);
      }
    } catch (e) {}
  }, []);

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

  const handleOpenBooking = useCallback((prefill?: {
    roomId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  }) => {
    setBookingPrefill(prefill);
    setIsBookingOpen(true);
  }, []);

  const handleOpenCheckIn = useCallback((tab: 'checkin' | 'checkout' | 'lookup' = 'checkin', code?: string) => {
    setCheckInOutTab(tab);
    if (code) setInitialBookingCode(code);
    setIsCheckInOutOpen(true);
  }, []);

  const handleBookingSuccess = useCallback((createdBooking: Booking) => {
    setIsBookingOpen(false);
    setNewBooking(createdBooking);
    setIsSuccessOpen(true);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleBookingUpdated = useCallback((_updatedBooking: Booking) => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleOpenAdmin = useCallback(() => {
    const savedToken = localStorage.getItem('wtk_admin_token');
    const savedUser = localStorage.getItem('wtk_admin_user');
    if (savedToken) {
      setAdminToken(savedToken);
      if (savedUser) {
        try {
          setAdminUser(JSON.parse(savedUser));
        } catch {}
      }
      setCurrentView('admin');
      window.location.hash = 'admin';
    } else {
      setIsAdminLoginOpen(true);
    }
  }, []);

  const handleSelectBookingDetail = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
  }, []);

  const handleStateLoaded = useCallback((state: PublicState) => {
    setPublicState(state);
  }, []);

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

  const handleCloseDirectApproval = () => {
    setDirectApprovalParams(null);
    try {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    } catch {}
  };

  const handleDirectApprovalGoToAdmin = () => {
    setDirectApprovalParams(null);
    try {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    } catch {}
    handleOpenAdmin();
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
        onSelectBookingDetail={handleSelectBookingDetail}
        refreshTrigger={refreshTrigger}
        onStateLoaded={handleStateLoaded}
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
        onOpenCheckIn={(code) => handleOpenCheckIn('checkin', code)}
      />

      {/* 3. Modal เช็คอิน / เช็คเอาต์ / ยกเลิกคิว (Phase 7) */}
      <CheckInOutModal
        isOpen={isCheckInOutOpen}
        onClose={() => {
          setIsCheckInOutOpen(false);
          setInitialBookingCode('');
        }}
        onBookingUpdated={handleBookingUpdated}
        bookings={publicState?.bookings || []}
        initialTab={checkInOutTab}
        initialBookingCode={initialBookingCode}
      />

      {/* 4. Modal เข้าสู่ระบบผู้ดูแล Admin Login (Phase 8) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* 4.1 Modal อนุมัติการจองผ่านลิงก์อีเมล 1-Click โดยตรงในเว็บ */}
      {directApprovalParams && (
        <DirectApprovalModal
          isOpen={!!directApprovalParams}
          onClose={handleCloseDirectApproval}
          params={directApprovalParams}
          onGoToAdmin={handleDirectApprovalGoToAdmin}
        />
      )}

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
