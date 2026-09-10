import React, { useState, useEffect, useCallback } from 'react';
import { NotifyRecipient } from '@/types';
import { adminCrudRecipients, adminSendTestEmail } from '@/lib/api';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import {
  Mail,
  UserPlus,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  Bell,
  RotateCw,
} from 'lucide-react';

export interface AdminRecipientsProps {
  token: string;
}

export const AdminRecipients: React.FC<AdminRecipientsProps> = ({ token }) => {
  const toast = useToast();
  const [recipients, setRecipients] = useState<NotifyRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Add Recipient Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [notifyBooking, setNotifyBooking] = useState(true);
  const [notifyCancel, setNotifyCancel] = useState(true);
  const [notifySummary, setNotifySummary] = useState(true);

  // Test email state
  const [isSendingTest, setIsSendingTest] = useState(false);

  const fetchRecipients = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await adminCrudRecipients(token, 'list');
      setRecipients(list || []);
    } catch (err: any) {
      toast.error('โหลดรายชื่ออีเมลไม่สำเร็จ', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  // เพิ่มผู้รับอีเมลใหม่
  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newDisplayName.trim()) {
      toast.error('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกทั้งอีเมลและชื่อผู้รับ');
      return;
    }

    setActionLoading(true);
    try {
      await adminCrudRecipients(token, 'create', {
        email: newEmail.trim(),
        display_name: newDisplayName.trim(),
        notify_on_booking: notifyBooking,
        notify_on_cancel: notifyCancel,
        notify_on_checkin: false,
        notify_on_checkout: false,
        notify_daily_summary: notifySummary,
        is_active: true,
      });

      toast.success('เพิ่มผู้รับอีเมลสำเร็จ', `เพิ่ม ${newDisplayName} เรียบร้อยแล้ว`);
      setIsAddModalOpen(false);
      setNewEmail('');
      setNewDisplayName('');
      fetchRecipients();
    } catch (err: any) {
      toast.error('เพิ่มไม่สำเร็จ', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // สลับสถานะเปิด/ปิดการรับอีเมล
  const handleToggleActive = async (rec: NotifyRecipient) => {
    const isCurrentlyActive =
      rec.is_active === true || String(rec.is_active).toUpperCase() === 'TRUE';
    const newStatus = !isCurrentlyActive;

    setActionLoading(true);
    try {
      await adminCrudRecipients(token, 'update', {
        id: rec.id,
        is_active: newStatus,
      });
      toast.success('อัปเดตสถานะสำเร็จ', `${rec.display_name}: ${newStatus ? 'เปิดรับอีเมล' : 'ปิดรับชั่วคราว'}`);
      fetchRecipients();
    } catch (err: any) {
      toast.error('อัปเดตสถานะไม่สำเร็จ', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ลบผู้รับอีเมล
  const handleDelete = async (rec: NotifyRecipient) => {
    if (!window.confirm(`ต้องการลบอีเมล ${rec.email} (${rec.display_name}) ออกจากระบบแจ้งเตือนหรือไม่?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await adminCrudRecipients(token, 'delete', { id: rec.id });
      toast.success('ลบผู้รับอีเมลแล้ว', `ลบ ${rec.display_name} สำเร็จ`);
      fetchRecipients();
    } catch (err: any) {
      toast.error('ลบไม่สำเร็จ', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ทดสอบส่งอีเมล
  const handleTestEmail = async (targetEmail?: string) => {
    setIsSendingTest(true);
    try {
      const res = await adminSendTestEmail(token, targetEmail);
      toast.success(
        'ส่งอีเมลทดสอบสำเร็จ!',
        `ส่งไปยัง ${res.sent_to} เรียบร้อย (โควตา Google Mail วันนี้เหลือ ${res.remaining_quota} ฉบับ)`
      );
    } catch (err: any) {
      toast.error('ส่งอีเมลไม่สำเร็จ', err.message);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Information Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-primary to-primary-dark p-5 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-gold" />
            <h3 className="font-bold text-base">ระบบแจ้งเตือนทางอีเมล (Email Notifications)</h3>
          </div>
          <p className="text-xs text-blue-100 max-w-xl">
            คุณสามารถเพิ่มอีเมลของอาจารย์ที่ปรึกษา หรือคณะกรรมการชมรม เพื่อรับแจ้งเตือนเมื่อมีนักศึกษาจองคิว, ยกเลิกคิว หรือรับอีเมลสรุปยอดการใช้งานประจำวัน (เวลา 20:30 น.)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTestEmail()}
            loading={isSendingTest}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
          >
            <Send className="w-3.5 h-3.5 mr-1 text-gold" />
            ทดสอบส่งอีเมล
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs font-bold shadow-md"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1" />
            เพิ่มผู้รับอีเมล
          </Button>
        </div>
      </div>

      {/* Recipients List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold text-slate-800">
              รายชื่อผู้รับอีเมลแจ้งเตือน ({recipients.length} คน)
            </h4>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecipients}
            loading={isLoading}
            className="text-xs"
          >
            <RotateCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">ชื่อผู้รับ</th>
                <th className="py-3 px-4">อีเมล (Email)</th>
                <th className="py-3 px-4 text-center">แจ้งเตือนเมื่อจอง</th>
                <th className="py-3 px-4 text-center">แจ้งเตือนเมื่อยกเลิก</th>
                <th className="py-3 px-4 text-center">สรุปรายวัน 20:30 น.</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    กำลังโหลดรายชื่ออีเมล...
                  </td>
                </tr>
              ) : recipients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    ยังไม่มีรายชื่อผู้รับอีเมล กรุณากดปุ่ม "เพิ่มผู้รับอีเมล"
                  </td>
                </tr>
              ) : (
                recipients.map((rec) => {
                  const isActive =
                    rec.is_active === true || String(rec.is_active).toUpperCase() === 'TRUE';
                  const isNotifyBooking =
                    rec.notify_on_booking === true || String(rec.notify_on_booking).toUpperCase() === 'TRUE';
                  const isNotifyCancel =
                    rec.notify_on_cancel === true || String(rec.notify_on_cancel).toUpperCase() === 'TRUE';
                  const isNotifySummary =
                    rec.notify_daily_summary === true || String(rec.notify_daily_summary).toUpperCase() === 'TRUE';

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {rec.display_name}
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {rec.email}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isNotifyBooking ? (
                          <span className="inline-flex items-center text-emerald-600 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-300">
                            <XCircle className="w-4 h-4" />
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isNotifyCancel ? (
                          <span className="inline-flex items-center text-emerald-600 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-300">
                            <XCircle className="w-4 h-4" />
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isNotifySummary ? (
                          <span className="inline-flex items-center text-emerald-600 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-300">
                            <XCircle className="w-4 h-4" />
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(rec)}
                          disabled={actionLoading}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {isActive ? '🟢 เปิดใช้งาน' : '⚪ ปิดใช้งาน'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleTestEmail(rec.email)}
                            disabled={isSendingTest}
                            title="ส่งเมลทดสอบให้คนนี้"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(rec)}
                            disabled={actionLoading}
                            title="ลบออกจากระบบ"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Recipient Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="เพิ่มผู้รับการแจ้งเตือนทางอีเมล"
        description="ใส่อีเมลของอาจารย์ที่ปรึกษา หรือคณะกรรมการชมรม"
      >
        <form onSubmit={handleAddRecipient} className="space-y-4 text-xs">
          <Input
            label="ชื่อและตำแหน่ง"
            placeholder="เช่น อ. ดร. สมชาย (อาจารย์ที่ปรึกษา) หรือ นายกิตติ (ประธานชมรม)"
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
            required
          />

          <Input
            label="ที่อยู่อีเมล (Email Address)"
            type="email"
            placeholder="เช่น advisor@wtk.ac.th หรือ teacher@gmail.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />

          {/* Event Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-700 block">เลือกประเภทเหตุการณ์ที่ต้องการให้แจ้งเตือน:</span>

            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyBooking}
                onChange={(e) => setNotifyBooking(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>แจ้งเตือนทันทีเมื่อมี <strong>การจองคิวใหม่</strong></span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyCancel}
                onChange={(e) => setNotifyCancel(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>แจ้งเตือนทันทีเมื่อมี <strong>การยกเลิกคิว</strong></span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={notifySummary}
                onChange={(e) => setNotifySummary(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>รับอีเมล <strong>สรุปยอดประจำวันอัตโนมัติ (เวลา 20:30 น.)</strong></span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsAddModalOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={actionLoading}
              className="font-bold"
            >
              บันทึกผู้รับอีเมล
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
