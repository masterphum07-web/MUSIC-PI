import { useState } from 'react';
import { Home } from '@/pages/Home';
import { ToastProvider } from '@/components/common/Toast';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Booking } from '@/types';
import { Sparkles } from 'lucide-react';

function AppContent() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [demoModalOpen, setDemoModalOpen] = useState<{
    type: 'booking' | 'checkin' | 'admin';
    prefill?: any;
  } | null>(null);

  const handleOpenBooking = (prefill?: any) => {
    setDemoModalOpen({ type: 'booking', prefill });
  };

  const handleOpenCheckIn = () => {
    setDemoModalOpen({ type: 'checkin' });
  };

  const handleOpenAdmin = () => {
    setDemoModalOpen({ type: 'admin' });
  };

  return (
    <>
      {/* Main Home Page */}
      <Home
        onOpenBookingModal={handleOpenBooking}
        onOpenCheckInOutModal={handleOpenCheckIn}
        onOpenAdminLogin={handleOpenAdmin}
        onSelectBookingDetail={(booking) => setSelectedBooking(booking)}
      />

      {/* Booking Detail Modal (เมื่อคลิกที่บล็อกการจองบน Timeline) */}
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

      {/* Placeholder Modal for Modal Flow in Phase 7/8 */}
      <Modal
        isOpen={!!demoModalOpen}
        onClose={() => setDemoModalOpen(null)}
        title={
          demoModalOpen?.type === 'booking'
            ? 'ระบบจองห้องซ้อมดนตรี (Phase 7)'
            : demoModalOpen?.type === 'checkin'
            ? 'เช็คอิน / เช็คเอาต์ห้องซ้อม (Phase 7)'
            : 'เข้าสู่ระบบผู้ดูแล (Admin Console - Phase 8)'
        }
        description="เตรียมพร้อมสำหรับเฟสถัดไป"
      >
        <div className="space-y-4 py-2">
          {demoModalOpen?.type === 'booking' && (
            <div className="text-xs text-slate-600 space-y-2">
              <p>
                คุณได้เลือกช่วงเวลา: <strong>{demoModalOpen.prefill?.startTime || '08:00'} - {demoModalOpen.prefill?.endTime || '09:00'} น.</strong>
              </p>
              <p>
                ห้อง: <strong>{demoModalOpen.prefill?.roomId || 'ห้องซ้อมรวม A'}</strong> วันที่: <strong>{demoModalOpen.prefill?.date}</strong>
              </p>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-850 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>ฟอร์มจองแบบ Stepper 3 ขั้นตอนเต็มรูปแบบจะถูกเปิดใช้งานใน <strong>PHASE 7</strong></span>
              </div>
            </div>
          )}

          {demoModalOpen?.type === 'checkin' && (
            <div className="text-xs text-slate-600 space-y-2">
              <p>ระบบค้นหาด้วยรหัสจอง (เช่น MB-2609-XXXX) พร้อมปุ่มเช็คอินสด เช็คเอาต์ และนับเวลาจริง</p>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-850 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>โมดอลเช็คอิน/เช็คเอาต์/ยกเลิก จะถูกเปิดใช้งานใน <strong>PHASE 7</strong></span>
              </div>
            </div>
          )}

          {demoModalOpen?.type === 'admin' && (
            <div className="text-xs text-slate-600 space-y-2">
              <p>ระบบหลังบ้านพร้อมแดชบอร์ดกราฟ KPI, สถิติ Heatmap และจัดการผู้รับอีเมล</p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-850 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                <span>หน้า Admin Console เต็มรูปแบบจะถูกเชื่อมต่อใน <strong>PHASE 8</strong></span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button size="sm" variant="primary" onClick={() => setDemoModalOpen(null)}>
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
