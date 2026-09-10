import React, { useState, useEffect, useCallback } from 'react';
import { AuditLog } from '@/types';
import { adminGetLogs } from '@/lib/api';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import {
  Search,
  RotateCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Cpu,
} from 'lucide-react';

export interface AdminLogsProps {
  token: string;
}

export const AdminLogs: React.FC<AdminLogsProps> = ({ token }) => {
  const toast = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [actorType, setActorType] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminGetLogs(token, {
        search: search.trim() || undefined,
        actor_type: actorType || undefined,
        page,
        limit: 20,
      });
      setLogs(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err: any) {
      toast.error('โหลดบันทึกระบบไม่สำเร็จ', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, search, actorType, page, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActorBadge = (type: string) => {
    switch (type) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-primary border border-blue-200">
            <Shield className="w-3 h-3" />
            ADMIN
          </span>
        );
      case 'system':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Cpu className="w-3 h-3" />
            SYSTEM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <User className="w-3 h-3" />
            PUBLIC
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="ค้นหา Action, ชื่อ หรือ รหัสจอง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={actorType}
              onChange={(e) => {
                setActorType(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">ทุกประเภทผู้กระทำ (Actor)</option>
              <option value="public">Public (ผู้ใช้งานทั่วไป)</option>
              <option value="admin">Admin (ผู้ดูแลระบบ)</option>
              <option value="system">System (ระบบอัตโนมัติ)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="sm" loading={isLoading}>
              <Search className="w-3.5 h-3.5 mr-1" />
              ค้นหา
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              title="รีเฟรช"
              className="px-3"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">วัน-เวลา</th>
                <th className="py-3 px-4">ผู้กระทำ (Actor)</th>
                <th className="py-3 px-4">เหตุการณ์ (Action)</th>
                <th className="py-3 px-4">เป้าหมาย (Target)</th>
                <th className="py-3 px-4 text-center">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    กำลังโหลดประวัติระบบ...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    ไม่พบบันทึกประวัติระบบ
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {getActorBadge(log.actor_type)}
                        <span className="font-semibold text-slate-700">
                          {log.actor_name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-800 text-[11px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-xs text-primary">
                      {log.target_id || '-'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        title="ดู JSON รายละเอียด"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            ประวัติทั้งหมด <strong className="text-slate-800">{total}</strong> รายการ (หน้า {page} จาก {totalPages})
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

      {/* Log Detail Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="รายละเอียดบันทึกระบบ (Audit Log)"
        description={selectedLog?.log_id}
      >
        {selectedLog && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400">วัน-เวลา:</span>
                <div className="font-semibold text-slate-800">{selectedLog.timestamp}</div>
              </div>
              <div>
                <span className="text-slate-400">ผู้กระทำ:</span>
                <div className="font-semibold text-slate-800">{selectedLog.actor_name} ({selectedLog.actor_type})</div>
              </div>
              <div>
                <span className="text-slate-400">เหตุการณ์:</span>
                <div className="font-mono font-bold text-primary">{selectedLog.action}</div>
              </div>
              <div>
                <span className="text-slate-400">เป้าหมาย:</span>
                <div className="font-mono text-slate-800">{selectedLog.target_id || '-'}</div>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-bold block mb-1">ข้อมูลประกอบ (Payload / Detail):</span>
              <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-[11px] font-mono overflow-x-auto max-h-60">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(selectedLog.detail_json), null, 2);
                  } catch {
                    return selectedLog.detail_json || 'ไม่มีข้อมูลเพิ่มเติม';
                  }
                })()}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedLog(null)}>
                ปิด
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
