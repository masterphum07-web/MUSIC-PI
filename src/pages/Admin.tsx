import React, { useState, useEffect, useCallback } from 'react';
import { DashboardData, AdminUser } from '@/types';
import { adminGetDashboard, adminLogout } from '@/lib/api';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminReservations } from '@/components/admin/AdminReservations';
import { AdminRecipients } from '@/components/admin/AdminRecipients';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { AdminLogs } from '@/components/admin/AdminLogs';
import { Skeleton, ErrorState } from '@/components/common/States';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import {
  LayoutDashboard,
  CalendarCheck,
  Mail,
  Settings,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  FileText,
  RotateCw,
} from 'lucide-react';

export interface AdminPageProps {
  token: string;
  adminUser: AdminUser | null;
  onBackToHome: () => void;
  onLogout: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  token,
  adminUser,
  onBackToHome,
  onLogout,
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'reservations' | 'recipients' | 'settings' | 'logs'
  >('overview');

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(() => {
    try {
      const cached = localStorage.getItem('wtk_admin_dashboard_cache');
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !localStorage.getItem('wtk_admin_dashboard_cache');
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(
    async (isManual = false) => {
      if (isManual) setIsRefreshing(true);
      else if (!localStorage.getItem('wtk_admin_dashboard_cache')) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      try {
        const data = await adminGetDashboard(token);
        setDashboardData(data);
        try {
          localStorage.setItem('wtk_admin_dashboard_cache', JSON.stringify(data));
        } catch {}
      } catch (err: any) {
        setError(err.message || 'ไม่สามารถโหลดข้อมูลสถิติหลังบ้านได้');
        toast.error('เกิดข้อผิดพลาด', err.message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, toast]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLogoutClick = async () => {
    if (!window.confirm('คุณต้องการออกจากระบบผู้ดูแลหรือไม่?')) return;
    try {
      await adminLogout(token);
    } catch {
      // Ignored
    }
    localStorage.removeItem('wtk_admin_token');
    localStorage.removeItem('wtk_admin_user');
    localStorage.removeItem('wtk_admin_dashboard_cache');
    toast.success('ออกจากระบบแล้ว', 'กลับสู่หน้าหลักสำหรับผู้ใช้งานทั่วไป');
    onLogout();
  };

  const tabs = [
    { id: 'overview', label: 'ภาพรวมและสถิติ', icon: LayoutDashboard },
    { id: 'reservations', label: 'จัดการคิวการจอง', icon: CalendarCheck },
    { id: 'recipients', label: 'อีเมลแจ้งเตือนอาจารย์/กรรมการ', icon: Mail },
    { id: 'settings', label: 'ตั้งค่าระบบ', icon: Settings },
    { id: 'logs', label: 'ประวัติระบบ (Audit Logs)', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between relative">
      {/* Top Sync Indicator Bar */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-secondary via-gold to-secondary animate-pulse" />
      )}

      <div>
        {/* Admin Header */}
        <header className="sticky top-0 z-30 bg-primary text-white border-b border-primary-dark shadow-md">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Back to Home & Logo */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                  onClick={onBackToHome}
                  className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
                  title="กลับหน้าจอหลักของนักศึกษา"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">หน้าหลัก</span>
                </button>

                <div className="h-6 w-px bg-white/20 hidden sm:block shrink-0" />

                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
                    <img
                      src={`${import.meta.env.BASE_URL}logo.png`}
                      alt="ตราสัญลักษณ์ วทก."
                      className="w-full h-full object-contain drop-shadow-sm"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] sm:text-[10px] uppercase font-bold text-gold tracking-wider truncate">
                      Admin Console
                    </div>
                    <h1 className="text-xs sm:text-base font-bold leading-tight truncate">
                      ระบบจัดการหลังบ้าน วทก.
                    </h1>
                  </div>
                </div>
              </div>

              {/* Admin User Info & Logout */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs border border-white/15">
                  <ShieldCheck className="w-4 h-4 text-gold" />
                  <div>
                    <span className="font-semibold block leading-tight">
                      {adminUser?.display_name || 'ผู้ดูแลระบบ'}
                    </span>
                    <span className="text-[10px] text-blue-200">
                      @{adminUser?.username || 'admin'}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogoutClick}
                  className="bg-white/10 hover:bg-rose-600 hover:border-rose-600 text-white border-white/20 text-xs transition-colors px-2.5 sm:px-3 py-1.5"
                >
                  <LogOut className="w-3.5 h-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                </Button>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div
              className="flex space-x-1 overflow-x-auto pb-2 pt-1 scrollbar-none"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-white text-primary shadow-sm font-bold'
                        : 'text-blue-100 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-secondary' : 'text-blue-200'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Main Admin Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Top Refresh Control */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">
              เข้าสู่ระบบในชื่อ: <strong>{adminUser?.display_name}</strong> ({adminUser?.role || 'admin'})
            </span>

            {activeTab === 'overview' && (
              <button
                onClick={() => loadDashboard(true)}
                disabled={isRefreshing || isLoading}
                className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark font-semibold focus:outline-none disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>รีเฟรชสถิติ</span>
              </button>
            )}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <>
              {error && !dashboardData && (
                <ErrorState message={error} onRetry={() => loadDashboard()} />
              )}

              {isLoading && !dashboardData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-28 w-full" />
                    ))}
                  </div>
                  <Skeleton className="h-72 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              )}

              {dashboardData && (
                <AdminOverview
                  data={dashboardData}
                  adminUser={adminUser}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onRefresh={() => loadDashboard(true)}
                  isRefreshing={isRefreshing}
                />
              )}
            </>
          )}

          {/* Tab 2: Reservations */}
          {activeTab === 'reservations' && <AdminReservations token={token} />}

          {/* Tab 3: Email Recipients */}
          {activeTab === 'recipients' && <AdminRecipients token={token} />}

          {/* Tab 4: Settings */}
          {activeTab === 'settings' && (
            <AdminSettings
              token={token}
              onSettingsSaved={() => {
                loadDashboard(true);
              }}
            />
          )}

          {/* Tab 5: Audit Logs */}
          {activeTab === 'logs' && <AdminLogs token={token} />}
        </main>
      </div>

      {/* Admin Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-slate-200 text-center text-xs text-slate-400">
        ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วิทยาลัยเทคโนโลยีทางการแพทย์และสาธารณสุข กาญจนาภิเษก (วทก.) • แผงควบคุมผู้ดูแลระบบ (Admin Console)
      </footer>
    </div>
  );
};
