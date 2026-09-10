import { useState } from 'react';
import { Home } from '@/pages/Home';
import { ToastProvider } from '@/components/common/Toast';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { BookingModal } from '@/components/booking/BookingModal';
import { BookingSuccessModal } from '@/components/booking/BookingSuccessModal';
import { CheckInOutModal } from '@/components/checkin/CheckInOutModal';
import { Booking, PublicState } from '@/types';
import { Sparkles } from 'lucide-react';

function AppContent() {
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
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [publicState, setPublicState] = useState<PublicState | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    setIsAdminModalOpen(true);
  };

  return (
    <>
      {/* Main Home Page */}
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

      {/* 4. Booking Detail Modal (เมื่อคลิกที่บล็อกการจองบน Timeline) */}
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

      {/* 5. Placeholder สำหรับ Admin Console (เตรียมพร้อมสำหรับ Phase 8) */}
      <Modal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        title="เข้าสู่ระบบผู้ดูแล (Admin Console)"
        description="ระบบหลังบ้านสำหรับผู้ดูแลชมรมและอาจารย์ที่ปรึกษา"
      >
        <div className="space-y-4 py-2">
          <div className="text-xs text-slate-600 space-y-2">
            <p>ระบบหลังบ้านพร้อมแดชบอร์ดกราฟ KPI, สถิติ Heatmap และจัดการผู้รับอีเมลแจ้งเตือน</p>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-850 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <span>หน้าต่างเข้าสู่ระบบและแดชบอร์ดแอดมินเต็มรูปแบบเตรียมเปิดใช้งานใน <strong>PHASE 8</strong></span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" variant="primary" onClick={() => setIsAdminModalOpen(false)}>
              รับทราบ
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
