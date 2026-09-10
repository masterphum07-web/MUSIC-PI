import React, { useState, useEffect, useCallback } from 'react';
import { Booking } from '@/types';
import { adminListBookings, adminForceCheckout, cancelBooking, checkIn, adminExportCSV } from '@/lib/api';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import { formatThaiDate, getStatusInfo } from '@/lib/utils';
import {
  Search,
  Download,
  CheckCircle,
  LogOut,
  XCircle,
  Eye,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface AdminReservationsProps {
  token: string;
}

export const AdminReservations: React.FC<AdminReservationsProps> = ({ token }) => {
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminListBookings(token, {
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        date: dateFilter || undefined,
        page,
        limit: 15,
      });
      setBookings(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err: any) {
      toast.error('โหลดข้อมูลคิวไม่สำเร็จ', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, search, statusFilter, dateFilter, page, toast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ค้นหาเมื่อกด Enter หรือ Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  // แอดมินกดเช็คอินแทนนักศึกษา
  const handleManualCheckIn = async (b: Booking) => {
    if (!window.confirm(`ยืนยันการเช็คอินให้ ${b.full_name} (${b.booking_code})?`)) return;
    setActionLoading(true);
    try {
      await checkIn(b.booking_code, b.full_name);
      toast.success('เช็คอินสำเร็จ', `ดำเนินการให้ ${b.full_name} เรียบร้อยแล้ว`);
      fetchBookings();
    } catch (err: any) {
      toast.error('เช็คอินไม่สำเร็จ', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // แอดมินกดบังคับเช็คเอาต์
  const handleForceCheckOut = async (b: Booking) => {
    const note = window.prompt('ระบุหมายเหตุการบังคับคืนห้อง (ไม่บังคับ):', 'แอดมินปิดห้องตามเวลา');
    if (note === null) return;

    setActionLoading(true);
    try {
      await adminForceCheckout(token, b.booking_id, note || 'แอดมินเช็คเอาต์');
      toast.success('เช็คเอาต์สำเร็จ', 'ปลดสถานะห้องเรียบร้อย');
      fetchBookings();
    } catch (err: any) {
      toast.error('เช็คเอาต์ไม่สำเร็จ', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // แอดมินกดยกเลิกคิว
  const handleCancel = async (b: Booking) => {
    const reason = window.prompt('ระบุเหตุผลในการยกเลิกคิวนี้:', 'ผู้ดูแลระบบยกเลิก');
    if (reason === null) return;

    setActionLoading(true);
    try {
      await cancelBooking(b.booking_code, b.full_name, reason || 'แอดมินยกเลิก');
      toast.success('ยกเลิกคิวสำเร็จ', `ยกเลิกรหัส ${b.booking_code} เรียบร้อย`);
      fetchBookings();
    } catch (err: any) {
      toast.error('ยกเลิกไม่สำเร็จ', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ส่งออกข้อมูล CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const res = await adminExportCSV(token);
      const blob = new Blob([res.csv_content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', res.filename || 'wtk_music_bookings.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('ส่งออกข้อมูลสำเร็จ', 'ดาวน์โหลดไฟล์ CSV เรียบร้อย');
    } catch (err: any) {
      toast.error('ส่งออกไม่สำเร็จ', err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
        >
          {/* Keyword Search */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ค้นหา</label>
            <Input
              placeholder="รหัสจอง / ชื่อผู้จอง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">สถานะคิว</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">ทุกสถานะ</option>
              <option value="booked">จองแล้ว (รอเช็คอิน)</option>
              <option value="checked_in">กำลังใช้งาน (เช็คอินแล้ว)</option>
              <option value="checked_out">เสร็จสิ้น (เช็คเอาต์แล้ว)</option>
              <option value="no_show">No-Show (ไม่มาตามนัด)</option>
              <option value="cancelled">ยกเลิกแล้ว</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">วันที่จอง</label>
            <div className="flex gap-1.5">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white py-2 px-2 text-xs focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {dateFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter('');
                    setPage(1);
                  }}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 rounded-lg"
                >
                  ล้าง
                </button>
              )}
            </div>
          </div>

          {/* Search and Export Buttons */}
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isLoading}
              className="flex-1"
            >
              <Search className="w-3.5 h-3.5 mr-1" />
              ค้นหา
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={isExporting}
              onClick={handleExportCSV}
              title="ดาวน์โหลดไฟล์ Excel / CSV"
              className="px-3"
            >
              <Download className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchBookings}
              title="รีเฟรช"
              className="px-3"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </form>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">รหัสการจอง</th>
                <th className="py-3.5 px-4">วัน & เวลา</th>
                <th className="py-3.5 px-4">ผู้จอง (สาขา/ปี)</th>
                <th className="py-3.5 px-4">สถานะ</th>
                <th className="py-3.5 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    กำลังโหลดข้อมูลคิว...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    ไม่พบคิวการจองตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const statusInfo = getStatusInfo(b.status);
                  return (
                    <tr key={b.booking_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-primary text-xs">
                          {b.booking_code}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-0.5">{b.purpose}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {formatThaiDate(b.booking_date, 'D MMM BB')}
                        </div>
                        <div className="text-[11px] font-mono font-bold text-primary">
                          {b.start_time} - {b.end_time} น.
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-850">{b.full_name}</div>
                        <div className="text-[11px] text-slate-400">
                          {b.major} ({b.student_year})
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Action 1: Manual Check-in */}
                          {b.status === 'booked' && (
                            <button
                              onClick={() => handleManualCheckIn(b)}
                              disabled={actionLoading}
                              title="เช็คอินให้ผู้จอง"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Action 2: Force Check-out */}
                          {b.status === 'checked_in' && (
                            <button
                              onClick={() => handleForceCheckOut(b)}
                              disabled={actionLoading}
                              title="บังคับเช็คเอาต์คืนห้อง"
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                          )}

                          {/* Action 3: Cancel */}
                          {(b.status === 'booked' || b.status === 'checked_in') && (
                            <button
                              onClick={() => handleCancel(b)}
                              disabled={actionLoading}
                              title="ยกเลิกการจองนี้"
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Action 4: View Details */}
                          <button
                            onClick={() => setSelectedBooking(b)}
                            title="ดูรายละเอียดทั้งหมด"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
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

        {/* Pagination Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            รวมทั้งหมด <strong className="text-slate-800">{total}</strong> รายการ (หน้า {page} จาก {totalPages})
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 text-xs"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="รายละเอียดการจองห้องซ้อม"
        description="ข้อมูลคำขอการจองแบบครบถ้วน"
      >
        {selectedBooking && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">รหัสจอง:</span>
                <span className="font-bold text-primary font-mono text-sm">{selectedBooking.booking_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">วันที่:</span>
                <span className="font-semibold text-slate-800">{selectedBooking.booking_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">เวลา:</span>
                <span className="font-bold text-primary">{selectedBooking.start_time} - {selectedBooking.end_time} น.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ผู้จอง:</span>
                <span className="font-semibold text-slate-800">{selectedBooking.full_name} ({selectedBooking.student_year})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">สาขาวิชา:</span>
                <span className="font-semibold text-slate-800">{selectedBooking.major}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">เบอร์โทรศัพท์:</span>
                <span className="text-slate-800">{selectedBooking.phone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">อีเมล:</span>
                <span className="text-slate-800">{selectedBooking.email || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">จำนวนสมาชิก:</span>
                <span className="text-slate-800">{selectedBooking.party_size} คน</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">วัตถุประสงค์:</span>
                <span className="text-slate-800">{selectedBooking.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">อุปกรณ์ที่ขอใช้:</span>
                <span className="text-slate-800">{selectedBooking.equipment || '-'}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">สถานะ:</span>
                <span className="font-semibold">{getStatusInfo(selectedBooking.status).label}</span>
              </div>
              {selectedBooking.checkin_at && (
                <div className="flex justify-between">
                  <span className="text-slate-500">เวลาเช็คอิน:</span>
                  <span className="text-slate-700">{selectedBooking.checkin_at}</span>
                </div>
              )}
              {selectedBooking.checkout_at && (
                <div className="flex justify-between">
                  <span className="text-slate-500">เวลาเช็คเอาต์:</span>
                  <span className="text-slate-700">{selectedBooking.checkout_at}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedBooking(null)}>
                ปิด
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
