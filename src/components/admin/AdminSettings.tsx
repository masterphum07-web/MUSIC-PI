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
  GraduationCap,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from 'lucide-react';
import { DEFAULT_WTK_MAJORS } from '@/types';

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

  // รายการหลักสูตร / สาขาวิชา
  const [majors, setMajors] = useState<string[]>(() => {
    if (initialSettings?.majors_list) {
      try {
        const parsed = JSON.parse(initialSettings.majors_list);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
      if (typeof initialSettings.majors_list === 'string') {
        const parts = initialSettings.majors_list.split(',').map((s: string) => s.trim()).filter(Boolean);
        if (parts.length > 0) return parts;
      }
    }
    if (Array.isArray(initialSettings?.majors) && initialSettings.majors.length > 0) {
      return initialSettings.majors;
    }
    return DEFAULT_WTK_MAJORS;
  });

  const [newMajorName, setNewMajorName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ฟังก์ชันเพิ่มหลักสูตรใหม่
  const handleAddMajor = () => {
    const trimmed = newMajorName.trim();
    if (!trimmed) {
      toast.error('กรุณาระบุชื่อหลักสูตร', 'ไม่สามารถเพิ่มค่าว่างได้');
      return;
    }
    if (majors.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('หลักสูตรซ้ำ', 'มีหลักสูตรหรือสาขาวิชานี้อยู่ในรายการแล้ว');
      return;
    }
    setMajors((prev) => [...prev, trimmed]);
    setNewMajorName('');
    toast.success('เพิ่มหลักสูตรเรียบร้อย', `เพิ่ม "${trimmed}" เข้าสู่ระบบแล้ว (อย่าลืมกดบันทึกการตั้งค่า)`);
  };

  // เริ่มแก้ไข
  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(majors[index] || '');
  };

  // บันทึกการแก้ไขเฉพาะแถว
  const handleSaveEdit = (index: number) => {
    const trimmed = editingValue.trim();
    if (!trimmed) {
      toast.error('ชื่อหลักสูตรไม่ถูกต้อง', 'ไม่สามารถเว้นว่างได้');
      return;
    }
    if (majors.some((m, idx) => idx !== index && m.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('ชื่อหลักสูตรซ้ำ', 'มีหลักสูตรชื่อนี้อยู่ในรายการแล้ว');
      return;
    }
    setMajors((prev) => {
      const updated = [...prev];
      updated[index] = trimmed;
      return updated;
    });
    setEditingIndex(null);
    setEditingValue('');
    toast.success('แก้ไขหลักสูตรแล้ว', `เปลี่ยนชื่อเป็น "${trimmed}" เรียบร้อย`);
  };

  // ลบหลักสูตร
  const handleDeleteMajor = (index: number) => {
    const target = majors[index];
    if (majors.length <= 1) {
      toast.error('ไม่สามารถลบได้', 'ต้องมีหลักสูตรในระบบอย่างน้อย 1 รายการ');
      return;
    }
    const confirmed = window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหลักสูตร "${target}" ออกจากระบบ?`);
    if (!confirmed) return;

    setMajors((prev) => prev.filter((_, idx) => idx !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingValue('');
    }
    toast.success('ลบหลักสูตรสำเร็จ', `นำ "${target}" ออกจากรายการแล้ว`);
  };

  // เลื่อนลำดับขึ้น
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setMajors((prev) => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  // เลื่อนลำดับลง
  const handleMoveDown = (index: number) => {
    if (index >= majors.length - 1) return;
    setMajors((prev) => {
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  // รีเซ็ตเป็นค่าเริ่มต้น วทก.
  const handleResetMajors = () => {
    const confirmed = window.confirm('ต้องการรีเซ็ตรายชื่อหลักสูตรกลับเป็นค่าเริ่มต้นมาตรฐานของ วทก. ใช่หรือไม่?');
    if (!confirmed) return;
    setMajors([...DEFAULT_WTK_MAJORS]);
    setEditingIndex(null);
    setEditingValue('');
    toast.success('รีเซ็ตสำเร็จ', 'คืนค่าหลักสูตรมาตรฐานของ วทก. เรียบร้อย (อย่าลืมกดบันทึก)');
  };

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
        majors_list: JSON.stringify(majors),
      });

      toast.success('บันทึกการตั้งค่าสำเร็จ', 'ระบบได้อัปเดตการตั้งค่าส่วนกลางและหลักสูตรเรียบร้อย');
      if (onSettingsSaved) onSettingsSaved();
    } catch (err: any) {
      toast.error('บันทึกไม่สำเร็จ', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. Majors & Academic Programs Management */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-secondary" />
              <span>1. จัดการหลักสูตรและสาขาวิชา (Programs & Majors Management)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              เพิ่ม ลบ แก้ไข รายชื่อหลักสูตร/สาขาวิชาที่แสดงให้ผู้ใช้เลือกในฟอร์มจองห้องซ้อมดนตรี
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={handleResetMajors}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-secondary py-1.5 px-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 transition-colors"
              title="รีเซ็ตเป็น 8 หลักสูตรมาตรฐานของ วทก."
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>รีเซ็ตค่ามาตรฐาน วทก.</span>
            </button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isLoading}
              className="text-xs font-bold px-3.5 py-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              บันทึกการตั้งค่า
            </Button>
          </div>
        </div>

        {/* Add new major form */}
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            placeholder="พิมพ์ชื่อหลักสูตร หรือ สาขาวิชาใหม่ เช่น หลักสูตรทันตสาธารณสุข..."
            value={newMajorName}
            onChange={(e) => setNewMajorName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddMajor();
              }
            }}
            className="text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white flex-1 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400"
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleAddMajor}
            disabled={!newMajorName.trim()}
            className="text-xs font-semibold px-4 py-2.5 flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            + เพิ่มหลักสูตร
          </Button>
        </div>

        {/* List of current majors */}
        <div className="space-y-2 pt-1">
          {majors.map((majorItem, index) => {
            const isEditing = editingIndex === index;

            return (
              <div
                key={index}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all text-xs"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-primary font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1 mr-2">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveEdit(index);
                          } else if (e.key === 'Escape') {
                            setEditingIndex(null);
                          }
                        }}
                        autoFocus
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-primary bg-white flex-1 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(index)}
                        className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        title="บันทึกชื่อนี้"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingIndex(null)}
                        className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                        title="ยกเลิก"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-medium text-slate-800 truncate" title={majorItem}>
                      {majorItem}
                    </span>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Move Up */}
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 disabled:opacity-25 transition-colors"
                      title="เลื่อนขึ้น"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === majors.length - 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 disabled:opacity-25 transition-colors"
                      title="เลื่อนลง"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(index)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-blue-50 transition-colors"
                      title="แก้ไขชื่อหลักสูตร"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteMajor(index)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title="ลบหลักสูตร"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
          <span>รวมทั้งหมด {majors.length} หลักสูตร / สาขาวิชา</span>
          <span className="text-amber-700 font-medium">* เมื่อแก้ไขเสร็จแล้วอย่าลืมกดปุ่ม "บันทึกการตั้งค่า"</span>
        </div>
      </div>

      {/* 2. Operating Hours & Rules */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Clock className="w-4 h-4 text-primary" />
          <span>2. เวลาเปิด-ปิด และกติกาการจอง</span>
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

      {/* 3. Announcements & Contact Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Megaphone className="w-4 h-4 text-gold" />
          <span>3. ข้อความประกาศและข้อมูลติดต่อ</span>
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
