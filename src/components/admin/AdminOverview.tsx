import React, { useState, useMemo } from 'react';
import { DashboardData, AdminUser } from '@/types';
import {
  CalendarCheck,
  Clock,
  AlertOctagon,
  TrendingUp,
  Award,
  GraduationCap,
  Sparkles,
  Crown,
  Activity,
  ShieldCheck,
  Music,
  CheckCircle2,
  RotateCw,
  Calendar,
  Flame,
  UserCheck,
  ArrowRight,
  Settings,
  Mail,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import dayjs from 'dayjs';

export interface AdminOverviewProps {
  data: DashboardData;
  adminUser?: AdminUser | null;
  onNavigateTab?: (tab: 'overview' | 'reservations' | 'recipients' | 'settings' | 'logs') => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  data,
  adminUser,
  onNavigateTab,
  onRefresh,
  isRefreshing = false,
}) => {
  const { kpi, trend30days, heatmap, byMajor, byYear, topUsers, recentActivity } = data;
  const [timeframe, setTimeframe] = useState<'7d' | '14d' | '30d'>('30d');

  const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

  // กรองข้อมูลตามช่วงเวลาที่เลือก
  const filteredTrend = useMemo(() => {
    if (!trend30days || trend30days.length === 0) return [];
    if (timeframe === '7d') return trend30days.slice(-7);
    if (timeframe === '14d') return trend30days.slice(-14);
    return trend30days;
  }, [trend30days, timeframe]);

  // คำนวณสถิติช่วงเวลา
  const trendAvg = useMemo(() => {
    if (filteredTrend.length === 0) return '0';
    const sum = filteredTrend.reduce((acc, cur) => acc + (cur.count || 0), 0);
    return (sum / filteredTrend.length).toFixed(1);
  }, [filteredTrend]);

  const maxTrendDay = useMemo(() => {
    if (filteredTrend.length === 0) return { date: '-', count: 0 };
    return [...filteredTrend].sort((a, b) => b.count - a.count)[0];
  }, [filteredTrend]);

  // หายอดสูงสุดใน heatmap เพื่อคำนวณความเข้มของสี
  const maxHeatVal = Math.max(1, ...(heatmap || []).flatMap((row) => row));

  const getHeatmapColor = (val: number) => {
    if (val === 0) return 'bg-slate-100/70 text-slate-400 hover:bg-slate-200';
    const ratio = val / maxHeatVal;
    if (ratio < 0.25) return 'bg-teal-100/90 text-teal-800 font-semibold hover:bg-teal-200';
    if (ratio < 0.5) return 'bg-teal-300 text-teal-900 font-bold hover:bg-teal-400';
    if (ratio < 0.75) return 'bg-teal-500 text-white font-bold hover:bg-teal-600 shadow-sm';
    return 'bg-gradient-to-br from-primary to-secondary text-white font-extrabold hover:opacity-95 shadow-sm ring-1 ring-gold/40';
  };

  const chartColors = ['#0F3D5C', '#1B7A8C', '#C9A227', '#E26D5C', '#38A169', '#805AD5', '#D97706'];

  return (
    <div className="space-y-7">
      {/* 1. Executive Welcome & System Status Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2E46] via-[#0F3D5C] to-[#1B7A8C] p-6 sm:p-8 text-white shadow-xl shadow-primary/10 border border-white/10">
        {/* Subtle Background Glow Circles */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-gold/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-gold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-gold animate-spin" />
              <span>ศูนย์ควบคุมและบริหารจัดการห้องซ้อมดนตรี วทก.</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                <span>ยินดีต้อนรับ,</span>
                <span className="text-gold">
                  {adminUser?.display_name || 'ผู้ดูแลระบบ'}
                </span>
                <span className="text-xl">👋</span>
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl font-light leading-relaxed">
                ชมรมดนตรี วิทยาลัยเทคโนโลยีทางการแพทย์และสาธารณสุข กาญจนาภิเษก • ตรวจสอบสถิติการใช้งาน, จัดการตารางคิว, และกำกับดูแลระบบแบบเรียลไทม์
              </p>
            </div>

            {/* Quick Status Chips */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ห้องซ้อมเดี่ยว วทก.: พร้อมให้บริการ</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-blue-100 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5 text-gold" />
                <span>{dayjs().format('DD/MM/BBBB')}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-blue-100 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                <span>สิทธิ์: {adminUser?.role === 'super_admin' ? 'Super Administrator' : 'Staff Admin'}</span>
              </span>
            </div>
          </div>

          {/* Action Button */}
          {onRefresh && (
            <div className="flex sm:flex-col items-end justify-center gap-2 flex-shrink-0">
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-primary hover:bg-gold hover:text-amber-950 font-bold text-xs shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-secondary' : ''}`} />
                <span>{isRefreshing ? 'กำลังซิงค์...' : 'รีเฟรชสถิติล่าสุด'}</span>
              </button>
              <span className="text-[10px] text-blue-200/70 hidden sm:block">
                อัปเดตอัตโนมัติจาก Google Sheets
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pending Approvals Alert Banner */}
      {!!(kpi.pending_approvals && kpi.pending_approvals > 0) && (
        <div className="bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-amber-950 text-sm sm:text-base flex items-center gap-2">
                <span>มีคำขอจองห้องใหม่รอการอนุมัติ</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-mono text-xs font-bold shadow-xs">
                  {kpi.pending_approvals} รายการ
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-0.5">
                นักศึกษาส่งคำขอจองเข้ามาและกำลังรอผู้ดูแลระบบตรวจสอบ เพื่อส่งรหัสห้องและ QR Code ให้ใช้งาน
              </p>
            </div>
          </div>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('reservations')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-900 text-white hover:bg-amber-850 font-bold text-xs shadow-md transition-all active:scale-95 flex-shrink-0"
            >
              <span>ไปหน้าอนุมัติคิว</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 2. Modern Bento KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: คิวจองวันนี้ */}
        <div className="group relative bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-primary font-bold text-[11px]">
              <CalendarCheck className="w-3.5 h-3.5 text-primary" />
              <span>วันนี้ (Today)</span>
            </span>
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Music className="w-5 h-5 text-secondary" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
              {kpi.today_bookings}
              <span className="text-sm font-bold text-slate-400 ml-1.5">คิว</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              จำนวนคิวจองที่ลงทะเบียนในวันปัจจุบัน
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>ตารางห้องซ้อมเดี่ยว วทก.</span>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('reservations')}
                className="text-primary hover:text-primary-dark font-bold inline-flex items-center gap-0.5"
              >
                <span>ดูคิว</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* KPI 2: กำลังใช้งานสด */}
        <div className="group relative bg-white p-5 rounded-3xl border border-emerald-200/80 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE ACTIVE</span>
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight flex items-center gap-2">
              <span>{kpi.active_now > 0 ? kpi.active_now : 0}</span>
              <span className="text-sm font-bold text-emerald-700">
                {kpi.active_now > 0 ? 'คิว (กำลังซ้อม)' : 'คิว (ว่างพร้อมใช้)'}
              </span>
            </div>
            <div className="text-xs text-emerald-700 font-medium">
              {kpi.active_now > 0 ? 'มีสมาชิกกำลังเข้าซ้อมในห้องขณะนี้' : 'ห้องซ้อมว่าง สามารถจองเข้าใช้งานได้'}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-[11px] text-emerald-600">
            <span>ระบบเช็คอินนับเวลาจริง</span>
            <span className="font-semibold text-emerald-700">Real-time</span>
          </div>
        </div>

        {/* KPI 3: ยอดจองสะสมทั้งหมด */}
        <div className="group relative bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-secondary/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-bold text-[11px]">
              <Award className="w-3.5 h-3.5 text-gold" />
              <span>ยอดจองสะสมทั้งหมด</span>
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-gold" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
              {kpi.total_bookings_all_time}
              <span className="text-sm font-bold text-slate-400 ml-1.5">ครั้ง</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              สถิติการใช้งานตั้งแต่เริ่มเปิดระบบชมรม วทก.
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>อัตราครองห้อง (Utilization)</span>
            <span className="font-bold text-secondary">{kpi.utilization_rate || 0}%</span>
          </div>
        </div>

        {/* KPI 4: อัตรา No-Show */}
        <div className="group relative bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-rose-300 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                kpi.no_show_rate > 10
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {kpi.no_show_rate > 10 ? (
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>{kpi.no_show_rate > 10 ? 'เฝ้าระวัง' : 'มีวินัยสูงมาก'}</span>
            </span>
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                kpi.no_show_rate > 10 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div
              className={`text-3xl sm:text-4xl font-black tracking-tight ${
                kpi.no_show_rate > 10 ? 'text-rose-600' : 'text-slate-800'
              }`}
            >
              {kpi.no_show_rate}%
            </div>
            <div className="text-xs text-slate-500 font-medium">
              สัดส่วนคิวที่ไม่มาเช็คอินภายใน 15 นาที
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>ตัดคิวอัตโนมัติ</span>
            <span className="font-semibold text-slate-600">15 นาที</span>
          </div>
        </div>
      </div>

      {/* 3. 30-Day Trend Chart with Interactive Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              <span>สถิติแนวโน้มการจองห้องซ้อมดนตรี (Booking Trends)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              กราฟแสดงปริมาณการเข้าใช้งานห้องซ้อมดนตรี วทก. ในแต่ละวัน
            </p>
          </div>

          {/* Timeframe selector pills & quick stats */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
              {(['7d', '14d', '30d'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    timeframe === t
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t === '7d' ? '7 วันล่าสุด' : t === '14d' ? '14 วัน' : '30 วัน'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trend Summary Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">ค่าเฉลี่ยต่อวัน</div>
            <div className="text-lg font-extrabold text-primary">{trendAvg} <span className="text-xs font-normal text-slate-400">คิว/วัน</span></div>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">ยอดจองสูงสุดในรอบ</div>
            <div className="text-lg font-extrabold text-emerald-600">{maxTrendDay.count} <span className="text-xs font-normal text-slate-400">คิว ({maxTrendDay.date})</span></div>
          </div>
          <div className="hidden sm:block bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">รวมยอดจองช่วงนี้</div>
            <div className="text-lg font-extrabold text-slate-800">{filteredTrend.reduce((a, b) => a + (b.count || 0), 0)} <span className="text-xs font-normal text-slate-400">คิว</span></div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-72 w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="adminTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B7A8C" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#1B7A8C" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickFormatter={(val) => {
                  const parts = val.split('-');
                  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : val;
                }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748B' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xl text-xs space-y-1">
                        <div className="font-semibold text-slate-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-secondary" />
                          <span>วันที่: {label}</span>
                        </div>
                        <div className="text-base font-extrabold text-primary flex items-center gap-2">
                          <span>จำนวนการจอง:</span>
                          <span className="text-secondary">{payload[0].value} คิว</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#1B7A8C"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#adminTrendGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Heatmap 7 วัน x ช่วงเวลา (08:00 - 20:00) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>ความหนาแน่นช่วงเวลาการเข้าใช้งาน (Weekly Heatmap)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              วิเคราะห์ช่วงเวลาที่นักศึกษาจองเข้าซ้อมบ่อยที่สุด (08:00 - 20:00 น.)
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
            <span>🔥 ช่วงเวลายอดฮิต: 16:00 - 19:00 น. (หลังเลิกเรียน)</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[680px] space-y-2">
            {/* Hour Header */}
            <div className="grid grid-cols-13 gap-1.5 text-[11px] font-mono text-slate-400 text-center font-semibold">
              <div className="text-left font-sans text-xs text-slate-600">วัน / เวลา</div>
              {Array.from({ length: 12 }, (_, i) => i + 8).map((hr) => (
                <div key={hr} className="py-1 bg-slate-50 rounded-lg">
                  {hr}:00
                </div>
              ))}
            </div>

            {/* Rows for each day */}
            {(heatmap || []).map((hours, dayIdx) => (
              <div key={dayIdx} className="grid grid-cols-13 gap-1.5 items-center">
                <div className="text-xs font-bold text-slate-700 truncate pr-1">
                  {dayNames[dayIdx]}
                </div>
                {Array.from({ length: 12 }, (_, i) => i + 8).map((hr) => {
                  const val = (hours && hours[hr]) || 0;
                  return (
                    <div
                      key={hr}
                      title={`${dayNames[dayIdx]} เวลา ${hr}:00 - ${hr + 1}:00 น. มีการจอง ${val} ครั้ง`}
                      className={`h-8 rounded-xl flex items-center justify-center text-[10px] font-mono transition-transform hover:scale-110 cursor-pointer ${getHeatmapColor(
                        val
                      )}`}
                    >
                      {val > 0 ? val : ''}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center justify-end gap-3 pt-2 text-xs text-slate-500">
          <span className="text-[11px] text-slate-400">ระดับความหนาแน่น:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200"></span>
            <span className="text-[11px]">ว่าง (0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-teal-200"></span>
            <span className="text-[11px]">ปกติ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-teal-500"></span>
            <span className="text-[11px]">หนาแน่น</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-primary"></span>
            <span className="text-[11px] font-bold text-primary">พีคสูงสุด 🔥</span>
          </div>
        </div>
      </div>

      {/* 5. 2-Column Bento: Major Analytics & Hall of Fame Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Major */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span>สัดส่วนการจองแยกตามสาขาวิชา</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">ทุกสาขาใน วทก.</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMajor || []} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                  width={130}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-md text-xs">
                          <div className="font-bold text-primary">{payload[0].payload.name}</div>
                          <div className="text-secondary font-semibold">จำนวน: {payload[0].value} คิว</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {(byMajor || []).map((_, idx) => (
                    <Cell key={idx} fill={chartColors[idx % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5 อันดับนักดนตรียอดเยี่ยม (Hall of Fame Leaderboard) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Crown className="w-5 h-5 text-gold" />
              <span>5 อันดับนักดนตรีใช้งานห้องซ้อมสูงสุด (Hall of Fame)</span>
            </h3>
            <span className="text-xs text-gold font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
              TOP 5
            </span>
          </div>

          {/* สัดส่วนตามชั้นปี */}
          {byYear && byYear.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
              {byYear.map((y, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-xl text-xs"
                >
                  <span className="text-slate-500 font-medium">{y.name}:</span>
                  <span className="font-bold text-primary">{y.value} คิว</span>
                </div>
              ))}
            </div>
          )}

          {/* Leaderboard Podium List */}
          <div className="space-y-2.5 pt-1">
            {!topUsers || topUsers.length === 0 ? (
              <div className="text-xs text-slate-400 py-12 text-center">
                ยังไม่มีข้อมูลการจองในระบบ
              </div>
            ) : (
              topUsers.slice(0, 5).map((u, idx) => {
                const isFirst = idx === 0;
                const isSecond = idx === 1;
                const isThird = idx === 2;

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                      isFirst
                        ? 'bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 border border-gold/40 shadow-sm'
                        : 'bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Badge */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-sm ${
                          isFirst
                            ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950 ring-2 ring-gold/40'
                            : isSecond
                            ? 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700'
                            : isThird
                            ? 'bg-gradient-to-br from-amber-700 to-amber-800 text-white'
                            : 'bg-white text-slate-500 border border-slate-200'
                        }`}
                      >
                        {isFirst ? '👑 1' : idx + 1}
                      </div>

                      <div>
                        <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <span>{u.full_name}</span>
                          {isFirst && (
                            <span className="text-[10px] text-amber-700 font-extrabold bg-amber-100/80 px-1.5 py-0.5 rounded">
                              อันดับ 1
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {u.major || 'สาขาวิชา'} • {u.student_year || 'ชั้นปี'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs font-extrabold text-primary text-xs">
                      <Music className="w-3.5 h-3.5 text-secondary" />
                      <span>{u.count} ครั้ง</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 6. Recent Activity Feed (ประวัติกิจกรรมสด) */}
      {recentActivity && recentActivity.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-secondary" />
              <span>บันทึกกิจกรรมล่าสุดของระบบ (Recent Live Feed)</span>
            </h3>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('logs')}
                className="text-xs text-primary hover:text-primary-dark font-bold inline-flex items-center gap-1"
              >
                <span>ดูประวัติทั้งหมด</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2">
            {recentActivity.slice(0, 5).map((log, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <div>
                    <span className="font-bold text-slate-800 mr-2">{log.actor_name || 'ผู้ใช้งาน'}</span>
                    <span className="text-slate-600">{log.action || log.detail}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {log.timestamp ? dayjs(log.timestamp).format('HH:mm:ss น.') : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Quick Administrative Shortcuts */}
      {onNavigateTab && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <button
            onClick={() => onNavigateTab('reservations')}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-primary/40 hover:shadow-md transition-all text-left group"
          >
            <CalendarCheck className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-slate-800 text-xs sm:text-sm">จัดการคิวการจอง</div>
            <div className="text-[10px] text-slate-400 mt-0.5">อนุมัติ / เช็คเอาต์ / ยกเลิก</div>
          </button>

          <button
            onClick={() => onNavigateTab('recipients')}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-secondary/40 hover:shadow-md transition-all text-left group"
          >
            <Mail className="w-5 h-5 text-secondary mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-slate-800 text-xs sm:text-sm">อีเมลแจ้งเตือน</div>
            <div className="text-[10px] text-slate-400 mt-0.5">อาจารย์ที่ปรึกษา / สรุปวัน</div>
          </button>

          <button
            onClick={() => onNavigateTab('settings')}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-gold/40 hover:shadow-md transition-all text-left group"
          >
            <Settings className="w-5 h-5 text-gold mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-slate-800 text-xs sm:text-sm">ตั้งค่าระบบ</div>
            <div className="text-[10px] text-slate-400 mt-0.5">เวลาเปิด-ปิด / กฎระเบียบ</div>
          </button>

          <button
            onClick={() => onNavigateTab('logs')}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all text-left group"
          >
            <FileText className="w-5 h-5 text-slate-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-slate-800 text-xs sm:text-sm">Audit Logs</div>
            <div className="text-[10px] text-slate-400 mt-0.5">ตรวจสอบบันทึกย้อนหลัง</div>
          </button>
        </div>
      )}
    </div>
  );
};
