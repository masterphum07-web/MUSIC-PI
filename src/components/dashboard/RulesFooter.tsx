import React from 'react';
import { ShieldCheck, Music, Phone, Clock } from 'lucide-react';

export const RulesFooter: React.FC<{ contactInfo?: string }> = ({ contactInfo }) => {
  return (
    <footer className="mt-16 bg-slate-900 text-slate-300 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
        {/* Rules Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-gold font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-gold" />
            <span>ระเบียบและข้อปฏิบัติการใช้ห้องซ้อมดนตรี ชมรมดนตรี วทก.</span>
          </div>
          <ul className="text-xs space-y-2 text-slate-400 leading-relaxed list-disc list-inside">
            <li>
              <strong>การเช็คอิน:</strong> กรุณากดเช็คอินหน้าเว็บตั้งแต่ก่อนเริ่มเวลา 15 นาที จนถึงไม่เกิน 30 นาทีหลังเวลาเริ่ม (หากไม่เช็คอิน ระบบจะตัดสิทธิ์ No-show และปล่อยห้องให้ผู้อื่นทันที)
            </li>
            <li>
              <strong>การดูแลอุปกรณ์:</strong> ห้ามนำอาหารและเครื่องดื่ม (ยกเว้นน้ำเปล่ามีฝาปิด) เข้าในห้องซ้อม ปรับแอมป์และเสียงดนตรีในระดับที่เหมาะสม
            </li>
            <li>
              <strong>การตรงต่อเวลา:</strong> ซ้อมเสร็จกรุณากดเช็คเอาต์หน้าเว็บทันที และออกจากห้องตรงเวลา เพื่อความสะดวกของคิวถัดไป
            </li>
            <li>
              <strong>ความปลอดภัย:</strong> ปิดสวิตช์เครื่องใช้ไฟฟ้า แอมป์ และเครื่องปรับอากาศทุกครั้งก่อนออกจากห้อง
            </li>
          </ul>
        </div>

        {/* Contact & Hours Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gold font-bold text-sm">
            <Phone className="w-4 h-4 text-gold" />
            <span>ติดต่อและสอบถามข้อมูล</span>
          </div>
          <div className="text-xs space-y-2 text-slate-400">
            <div className="flex items-start gap-2">
              <Music className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <span>ชมรมดนตรี อาคารกิจกรรมนักศึกษา ชั้น 2 วทก.</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-secondary flex-shrink-0" />
              <span>เวลาทำการ 08:00 - 20:00 น.</span>
            </div>
            {contactInfo && (
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] text-slate-300 mt-2">
                {contactInfo}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} ชมรมดนตรี วิทยาลัยเทคโนโลยีทางการแพทย์และสาธารณสุข กาญจนาภิเษก (วทก.)
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>พัฒนาเพื่อส่งเสริมกิจกรรมนักศึกษา</span>
          <span>•</span>
          <span className="text-slate-400">เวอร์ชัน 1.0.0</span>
        </div>
      </div>
    </footer>
  );
};
