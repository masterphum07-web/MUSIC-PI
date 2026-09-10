import React, { useState } from 'react';
import { adminUpdateSettings } from '@/lib/api';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useToast } from '@/components/common/Toast';
import {
  Save,
  Sliders,
  Clock,
  Megaphone,
  Phone,
} from 'lucide-react';

export interface AdminSettingsProps {
  token: string;
  initialSettings?: Record<string, any>;
  onSettingsSaved?: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  token,
  initialSettings,
  onSettingsSaved,
}) => {
  const toast = useToast();
  const [weekdayHours, setWeekdayHours] = useState(
    initialSettings?.operating_hours_weekday || '08:00-20:00'
  );
  const [weekendHours, setWeekendHours] = useState(
    initialSettings?.operating_hours_weekend || '09:00-18:00'
  );
  const [maxHours, setMaxHours] = useState<number>(
    initialSettings?.max_booking_hours || 3
  );
  const [advanceDays, setAdvanceDays] = useState<number>(
    initialSettings?.advance_booking_days || 14
  );
  const [gracePeriod, setGracePeriod] = useState<number>(
    initialSettings?.grace_period_minutes || 30
  );
  const [announcement, setAnnouncement] = useState(
    initialSettings?.announcement_text ||
      'ยินดีต้อนรับสู่ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก. กรุณาเช็คอินภายใน 30 นาทีหลังเริ่มเวลา'
  );
  const [systemStatus, setSystemStatus] = useState(
    initialSettings?.system_status || 'open'
  );
  const [contactInfo, setContactInfo] = useState(
    initialSettings?.contact_info ||
      'ชมรมดนตรี วทก. อาคารกิจกรรมนักศึกษา ชั้น 2 โทร: 02-xxx-xxxx'
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await adminUpdateSettings(token, {
        operating_hours_weekday: weekdayHours,
        operating_hours_weekend: weekendHours,
        max_booking_hours: Number(maxHours),
        advance_booking_days: Number(advanceDays),
        grace_period_minutes: Number(gracePeriod),
        announcement_text: announcement,
        system_status: systemStatus,
        contact_info: contactInfo,
      });

      toast.success('บันทึกการตั้งค่าสำเร็จ', 'ระบบได้อัปเดตการตั้งค่าส่วนกลางเรียบร้อย');
      if (onSettingsSaved) onSettingsSaved();
    } catch (err: any) {
      toast.error('บันทึกไม่สำเร็จ', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. Operating Hours & Rules */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Clock className="w-4 h-4 text-primary" />
          <span>เวลาเปิด-ปิด และกติกาการจอง</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <Input
            label="เวลาทำการ วันจันทร์ - ศุกร์"
            placeholder="08:00-20:00"
            value={weekdayHours}
            onChange={(e) => setWeekdayHours(e.target.value)}
            helperText="ฟอร์แมต HH:mm-HH:mm"
            required
          />

          <Input
            label="เวลาทำการ วันเสาร์ - อาทิตย์"
            placeholder="09:00-18:00"
            value={weekendHours}
            onChange={(e) => setWeekendHours(e.target.value)}
            helperText="ฟอร์แมต HH:mm-HH:mm"
            required
          />

          <Input
            label="ระยะเวลาจองสูงสุดต่อครั้ง (ชั่วโมง)"
            type="number"
            min={1}
            max={6}
            value={maxHours}
            onChange={(e) => setMaxHours(Number(e.target.value))}
            required
          />

          <Input
            label="เปิดให้จองล่วงหน้าได้สูงสุด (วัน)"
            type="number"
            min={1}
            max={30}
            value={advanceDays}
            onChange={(e) => setAdvanceDays(Number(e.target.value))}
            required
          />

          <Input
            label="ระยะเวลาผ่อนผันการเช็คอิน (นาที)"
            type="number"
            min={10}
            max={60}
            value={gracePeriod}
            onChange={(e) => setGracePeriod(Number(e.target.value))}
            helperText="หากเกินเวลานี้หลังเริ่ม ระบบจะตัดเป็น No-Show ทันที"
            required
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-primary" />
              <span>สถานะการเปิดให้บริการห้องซ้อม</span>
            </label>
            <select
              value={systemStatus}
              onChange={(e) => setSystemStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="open">🟢 เปิดให้บริการตามปกติ (Open)</option>
              <option value="closed">🔴 ปิดบริการชั่วคราว / ปรับปรุง (Closed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Announcements & Contact Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Megaphone className="w-4 h-4 text-gold" />
          <span>ข้อความประกาศและข้อมูลติดต่อ</span>
        </h3>

        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ข้อความประกาศแถบสีเหลืองด้านบนสุดของเว็บ (Announcement Bar)
            </label>
            <textarea
              rows={2}
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="ข้อความประกาศสำคัญ..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>ข้อมูลติดต่อชมรมดนตรี (แสดงที่ส่วนท้ายเว็บ)</span>
            </label>
            <Input
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="ที่ตั้งชมรม, เบอร์โทรศัพท์, เพจ Facebook"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="px-6 font-bold shadow-md"
        >
          <Save className="w-4 h-4 mr-1.5" />
          บันทึกการตั้งค่าระบบ
        </Button>
      </div>
    </form>
  );
};
