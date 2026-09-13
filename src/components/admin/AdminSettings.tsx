import React, { useState, useEffect } from 'react';
import { adminGetSettings, adminUpdateSettings } from '@/lib/api';
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
  Loader2,
  ShieldCheck,
  MapPin,
  AlignLeft,
  Info,
} from 'lucide-react';
import {
  DEFAULT_WTK_MAJORS,
  DEFAULT_RULES_TITLE,
  DEFAULT_RULES_TEXT,
  DEFAULT_CONTACT_TITLE,
  DEFAULT_CONTACT_LOCATION,
  DEFAULT_FOOTER_COPYRIGHT,
  DEFAULT_FOOTER_TAGLINE,
} from '@/types';

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
  const [isFetching, setIsFetching] = useState(true);

  const [weekdayHours, setWeekdayHours] = useState(
    initialSettings?.operating_hours_weekday || '16:30-20:00'
  );
  const [weekendHours, setWeekendHours] = useState(
    initialSettings?.operating_hours_weekend || '09:00-20:00'
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

  // การตั้งค่าส่วนท้ายเว็บ (Footer Settings)
  const [rulesTitle, setRulesTitle] = useState(
    initialSettings?.rules_title || DEFAULT_RULES_TITLE
  );
  const [rulesText, setRulesText] = useState(
    initialSettings?.rules_text || DEFAULT_RULES_TEXT
  );
  const [contactTitle, setContactTitle] = useState(
    initialSettings?.contact_title || DEFAULT_CONTACT_TITLE
  );
  const [contactLocation, setContactLocation] = useState(
    initialSettings?.contact_location || DEFAULT_CONTACT_LOCATION
  );
  const [footerCopyright, setFooterCopyright] = useState(
    initialSettings?.footer_copyright || DEFAULT_FOOTER_COPYRIGHT
  );
  const [footerTagline, setFooterTagline] = useState(
    initialSettings?.footer_tagline || DEFAULT_FOOTER_TAGLINE
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
  const [hasLocalBackup, setHasLocalBackup] = useState(false);

  // ตรวจสอบข้อมูลสำรองใน LocalStorage
  const checkLocalBackup = (currentMajors: string[]) => {
    try {
      const backup = localStorage.getItem('wtk_custom_majors_backup');
      if (backup) {
        const parsed = JSON.parse(backup);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const isDifferent = JSON.stringify(parsed) !== JSON.stringify(currentMajors);
          setHasLocalBackup(isDifferent);
          return;
        }
      }
    } catch {}
    setHasLocalBackup(false);
  };

  // โหลดการตั้งค่าล่าสุดจาก Google Sheets (Settings) ทันทีที่เปิดหน้า
  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      setIsFetching(true);
      try {
        const data = await adminGetSettings(token);
        if (!isMounted || !data) return;

        if (data.operating_hours_weekday) setWeekdayHours(data.operating_hours_weekday);
        if (data.operating_hours_weekend) setWeekendHours(data.operating_hours_weekend);
        if (data.max_booking_hours !== undefined) setMaxHours(Number(data.max_booking_hours));
        if (data.advance_booking_days !== undefined) setAdvanceDays(Number(data.advance_booking_days));
        if (data.grace_period_minutes !== undefined) setGracePeriod(Number(data.grace_period_minutes));
        if (data.announcement_text !== undefined) setAnnouncement(data.announcement_text);
        if (data.system_status) setSystemStatus(data.system_status);
        if (data.contact_info !== undefined) setContactInfo(data.contact_info);
        if (data.rules_title !== undefined) setRulesTitle(data.rules_title);
        if (data.rules_text !== undefined) setRulesText(data.rules_text);
        if (data.contact_title !== undefined) setContactTitle(data.contact_title);
        if (data.contact_location !== undefined) setContactLocation(data.contact_location);
        if (data.footer_copyright !== undefined) setFooterCopyright(data.footer_copyright);
        if (data.footer_tagline !== undefined) setFooterTagline(data.footer_tagline);

        let activeLoadedMajors: string[] | null = null;
        if (data.majors_list) {
          try {
            const parsed = typeof data.majors_list === 'string' ? JSON.parse(data.majors_list) : data.majors_list;
            if (Array.isArray(parsed) && parsed.length > 0) {
              activeLoadedMajors = parsed;
            }
          } catch {
            const parts = String(data.majors_list).split(',').map((s: string) => s.trim()).filter(Boolean);
            if (parts.length > 0) activeLoadedMajors = parts;
          }
        } else if (Array.isArray(data.majors) && data.majors.length > 0) {
          activeLoadedMajors = data.majors;
        }

        if (activeLoadedMajors) {
          setMajors(activeLoadedMajors);
          checkLocalBackup(activeLoadedMajors);
        } else {
          checkLocalBackup(majors);
        }
      } catch (err: any) {
        toast.error('โหลดการตั้งค่าไม่สำเร็จ', err.message || 'ไม่สามารถดึงข้อมูลจากระบบได้');
        checkLocalBackup(majors);
      } finally {
        if (isMounted) setIsFetching(false);
      }
    }

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, [token]);

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

  // กู้คืนหลักสูตรจากข้อมูลสำรองในเบราว์เซอร์
  const handleRestoreLocalBackup = () => {
    try {
      const backup = localStorage.getItem('wtk_custom_majors_backup');
      if (backup) {
        const parsed = JSON.parse(backup);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMajors(parsed);
          setEditingIndex(null);
          setEditingValue('');
          setHasLocalBackup(false);
          toast.success('กู้คืนสำเร็จ', `นำหลักสูตรสำรอง (${parsed.length} รายการ) กลับมาแล้ว (กรุณากดบันทึกการตั้งค่า)`);
          return;
        }
      }
    } catch {}
    toast.error('ไม่พบข้อมูลสำรอง', 'ไม่มีข้อมูลหลักสูตรที่เคยบันทึกไว้ในเครื่องนี้');
  };

  // รีเซ็ตเนื้อหาส่วนท้ายเว็บเป็นค่าเริ่มต้นมาตรฐาน
  const handleResetFooter = () => {
    const confirmed = window.confirm('ต้องการคืนค่าข้อความส่วนท้ายเว็บกลับเป็นค่าเริ่มต้นมาตรฐานใช่หรือไม่?');
    if (!confirmed) return;
    setRulesTitle(DEFAULT_RULES_TITLE);
    setRulesText(DEFAULT_RULES_TEXT);
    setContactTitle(DEFAULT_CONTACT_TITLE);
    setContactLocation(DEFAULT_CONTACT_LOCATION);
    setFooterCopyright(DEFAULT_FOOTER_COPYRIGHT);
    setFooterTagline(DEFAULT_FOOTER_TAGLINE);
    toast.success('รีเซ็ตสำเร็จ', 'คืนค่าข้อความส่วนท้ายเว็บมาตรฐานเรียบร้อย (อย่าลืมกดบันทึกการตั้งค่า)');
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
        rules_title: rulesTitle,
        rules_text: rulesText,
        contact_title: contactTitle,
        contact_location: contactLocation,
        footer_copyright: footerCopyright,
        footer_tagline: footerTagline,
      });

      // สำรองข้อมูลหลักสูตรไว้ในเครื่องเสมอ
      try {
        localStorage.setItem('wtk_custom_majors_backup', JSON.stringify(majors));
        setHasLocalBackup(false);
      } catch {}

      toast.success('บันทึกการตั้งค่าสำเร็จ', 'ระบบได้อัปเดตการตั้งค่าส่วนกลางและส่วนท้ายเว็บเรียบร้อย');
      if (onSettingsSaved) onSettingsSaved();
    } catch (err: any) {
      toast.error('บันทึกไม่สำเร็จ', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[350px]">
        <Loader2 className="w-9 h-9 text-secondary animate-spin" />
        <h3 className="text-sm font-semibold text-slate-700">กำลังโหลดการตั้งค่าระบบและรายการหลักสูตร...</h3>
        <p className="text-xs text-slate-400">ดึงข้อมูลล่าสุดจากฐานข้อมูล Google Sheets</p>
      </div>
    );
  }

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
            {hasLocalBackup && (
              <button
                type="button"
                onClick={handleRestoreLocalBackup}
                className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 py-1.5 px-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors font-medium shadow-sm"
                title="พบรายการหลักสูตรเดิมที่เคยบันทึกไว้ในเบราว์เซอร์นี้ สามารถกดเพื่อกู้คืนได้ทันที"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>📦 กู้คืนหลักสูตรเดิม</span>
              </button>
            )}
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
            placeholder="16:30-20:00"
            value={weekdayHours}
            onChange={(e) => setWeekdayHours(e.target.value)}
            helperText="ฟอร์แมต HH:mm-HH:mm (เช่น 16:30-20:00)"
            required
          />

          <Input
            label="เวลาทำการ วันเสาร์ - อาทิตย์"
            placeholder="09:00-20:00"
            value={weekendHours}
            onChange={(e) => setWeekendHours(e.target.value)}
            helperText="ฟอร์แมต HH:mm-HH:mm (เช่น 09:00-20:00)"
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

      {/* 4. Footer & Rules Customization */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold" />
            <span>4. ปรับแต่งเนื้อหาส่วนท้ายเว็บไซต์และระเบียบการใช้ห้อง (Footer Settings)</span>
          </h3>
          <button
            type="button"
            onClick={handleResetFooter}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่าเริ่มต้นส่วนท้ายเว็บ</span>
          </button>
        </div>

        <p className="text-xs text-slate-500">
          สามารถแก้ไขข้อความทุกจุดที่ปรากฏในส่วนล่างสุดของเว็บไซต์ (Footer) ได้อิสระตามต้องการ
        </p>

        {/* 4.1 ฝั่งซ้าย: ระเบียบและข้อปฏิบัติ */}
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-gold" />
            <span>ฝั่งซ้าย: ระเบียบและข้อปฏิบัติการใช้ห้อง</span>
          </h4>

          <Input
            label="หัวข้อระเบียบและข้อปฏิบัติ"
            value={rulesTitle}
            onChange={(e) => setRulesTitle(e.target.value)}
            placeholder="ระเบียบและข้อปฏิบัติการใช้ห้องซ้อมดนตรี ชมรมดนตรี วทก."
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              รายการระเบียบและข้อปฏิบัติ (พิมพ์ 1 ข้อต่อ 1 บรรทัด)
            </label>
            <textarea
              rows={6}
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
              placeholder="การเช็คอิน: กรุณากดเช็คอินหน้าเว็บตั้งแต่ก่อนเริ่มเวลา 15 นาที..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-relaxed focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              💡 เคล็ดลับ: หากใส่เครื่องหมายโคลอน (:) เช่น <strong>การเช็คอิน:</strong> หรือ <strong>ความปลอดภัย:</strong> ระบบจะทำตัวหนาหัวข้อด้านหน้าให้อัตโนมัติ
            </p>
          </div>
        </div>

        {/* 4.2 ฝั่งขวา: ข้อมูลติดต่อและสถานที่ */}
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-secondary" />
            <span>ฝั่งขวา: ข้อมูลติดต่อและสถานที่</span>
          </h4>

          <Input
            label="หัวข้อข้อมูลติดต่อ"
            value={contactTitle}
            onChange={(e) => setContactTitle(e.target.value)}
            placeholder="ติดต่อและสอบถามข้อมูล"
          />

          <Input
            label="สถานที่ตั้งชมรม / ห้องซ้อม"
            value={contactLocation}
            onChange={(e) => setContactLocation(e.target.value)}
            placeholder="ชมรมดนตรี อาคารกิจกรรมนักศึกษา ชั้น 2 วทก."
          />

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-800 flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0 text-blue-600" />
            <span>
              <strong>เวลาทำการ:</strong> ระบบจะแสดงเวลาเปิด-ปิดตามที่กำหนดไว้ในข้อ 2 อัตโนมัติ (ปัจจุบัน: จันทร์-ศุกร์ {weekdayHours} น. | เสาร์-อาทิตย์ {weekendHours} น.)
            </span>
          </div>
        </div>

        {/* 4.3 แถบล่างสุด: ลิขสิทธิ์และสโลแกน */}
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>แถบล่างสุด: ข้อความลิขสิทธิ์และสโลแกน (Copyright Bar)</span>
          </h4>

          <Input
            label="ข้อความลิขสิทธิ์ (จะแสดงต่อจาก © และปี ค.ศ. ปัจจุบัน)"
            value={footerCopyright}
            onChange={(e) => setFooterCopyright(e.target.value)}
            placeholder="ชมรมดนตรี วิทยาลัยเทคโนโลยีทางการแพทย์และสาธารณสุข กาญจนาภิเษก (วทก.)"
          />

          <Input
            label="สโลแกน / ข้อความสนับสนุน (มุมขวาล่าง)"
            value={footerTagline}
            onChange={(e) => setFooterTagline(e.target.value)}
            placeholder="พัฒนาเพื่อส่งเสริมกิจกรรมนักศึกษา"
          />
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
