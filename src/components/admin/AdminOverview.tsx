import React from 'react';
import { DashboardData } from '@/types';
import {
  CalendarCheck,
  Clock,
  AlertOctagon,
  TrendingUp,
  Award,
  GraduationCap,
  Sparkles,
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

export interface AdminOverviewProps {
  data: DashboardData;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ data }) => {
  const { kpi, trend30days, heatmap, byMajor, byYear, topUsers } = data;

  const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

  // หายอดสูงสุดใน heatmap เพื่อคำนวณความเข้มของสี
  const maxHeatVal = Math.max(1, ...heatmap.flatMap((row) => row));

  const getHeatmapColor = (val: number) => {
    if (val === 0) return 'bg-slate-100/60 text-slate-400';
    const ratio = val / maxHeatVal;
    if (ratio < 0.25) return 'bg-teal-100 text-teal-800 font-semibold';
    if (ratio < 0.5) return 'bg-teal-300 text-teal-900 font-bold';
    if (ratio < 0.75) return 'bg-teal-500 text-white font-bold';
    return 'bg-primary text-white font-extrabold';
  };

  const chartColors = ['#0F3D5C', '#1B7A8C', '#C9A227', '#E26D5C', '#38A169', '#805AD5'];

  return (
    <div className="space-y-6">
      {/* 1. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">คิวจองวันนี้</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-primary">
              {kpi.today_bookings}
            </div>
            <span className="text-[11px] text-slate-400">คิวในวันปัจจุบัน</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">กำลังใช้งานสด</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 flex items-center gap-1.5">
              <span>{kpi.active_now}</span>
              {kpi.active_now > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              )}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">ห้องกำลังมีการซ้อม</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">จองสะสมทั้งหมด</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {kpi.total_bookings_all_time}
            </div>
            <span className="text-[11px] text-slate-400">ตั้งแต่เริ่มเปิดระบบ</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">อัตรา No-Show</span>
            <div className={`text-2xl sm:text-3xl font-extrabold ${kpi.no_show_rate > 10 ? 'text-rose-600' : 'text-slate-800'}`}>
              {kpi.no_show_rate}%
            </div>
            <span className="text-[11px] text-slate-400">คิวที่ไม่มาเช็คอิน</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. 30-Day Trend Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>แนวโน้มการจองห้องซ้อม 30 วันย้อนหลัง</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              จำนวนครั้งการเข้าใช้งานห้องซ้อมดนตรีในแต่ละวัน
            </p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend30days}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F3D5C" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0F3D5C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#64748B' }}
                tickFormatter={(val) => {
                  const parts = val.split('-');
                  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : val;
                }}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748B' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-md text-xs space-y-1">
                        <div className="font-semibold text-slate-700">{label}</div>
                        <div className="text-primary font-bold">
                          จำนวนจอง: {payload[0].value} คิว
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
                stroke="#0F3D5C"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#trendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Heatmap 7 วัน x ช่วงเวลา (08:00 - 20:00) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span>Heatmap ความหนาแน่นช่วงเวลาการจอง (7 วัน x 24 ชม.)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ช่องสีเข้มแสดงถึงช่วงเวลาที่มีการจองซ้อมบ่อยที่สุด
          </p>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[650px] space-y-1.5">
            {/* Hour Header */}
            <div className="grid grid-cols-13 gap-1 text-[11px] font-mono text-slate-400 text-center">
              <div className="text-left font-sans text-xs">วัน / เวลา</div>
              {Array.from({ length: 12 }, (_, i) => i + 8).map((hr) => (
                <div key={hr}>{hr}:00</div>
              ))}
            </div>

            {/* Rows for each day */}
            {heatmap.map((hours, dayIdx) => (
              <div key={dayIdx} className="grid grid-cols-13 gap-1 items-center">
                <div className="text-xs font-semibold text-slate-700 truncate pr-1">
                  {dayNames[dayIdx]}
                </div>
                {Array.from({ length: 12 }, (_, i) => i + 8).map((hr) => {
                  const val = hours[hr] || 0;
                  return (
                    <div
                      key={hr}
                      title={`${dayNames[dayIdx]} เวลา ${hr}:00 - ${hr + 1}:00 น. มีการจอง ${val} ครั้ง`}
                      className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-mono transition-transform hover:scale-105 ${getHeatmapColor(
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
      </div>

      {/* 4. Distribution by Major & Year */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* By Major */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span>สัดส่วนการจองแยกตามสาขาวิชา</span>
          </h3>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMajor} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  width={110}
                />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {byMajor.map((_, idx) => (
                    <Cell key={idx} fill={chartColors[idx % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Student Year & Top Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-gold" />
              <span>5 อันดับผู้ใช้งานห้องซ้อมสูงสุด</span>
            </h3>
          </div>

          {/* สัดส่วนตามชั้นปี */}
          {byYear.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-100">
              {byYear.map((y, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <span className="text-slate-500 font-medium">{y.name}:</span>
                  <span className="font-bold text-primary">{y.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2.5">
            {topUsers.length === 0 ? (
              <div className="text-xs text-slate-400 py-8 text-center">
                ยังไม่มีข้อมูลการจอง
              </div>
            ) : (
              topUsers.slice(0, 5).map((u, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                        idx === 0
                          ? 'bg-amber-400 text-amber-950 shadow-sm'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-850">{u.full_name}</div>
                      <div className="text-[11px] text-slate-400">
                        {u.major} ({u.student_year})
                      </div>
                    </div>
                  </div>

                  <span className="font-bold text-primary bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {u.count} ครั้ง
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
