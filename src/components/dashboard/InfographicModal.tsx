import React from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Sparkles, Printer, ExternalLink, Download, Clock, ShieldCheck, QrCode, Mail, Music, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface InfographicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
}

export const InfographicModal: React.FC<InfographicModalProps> = ({
  isOpen,
  onClose,
  onOpenBooking,
}) => {
  const handlePrint = () => {
    window.open(`${import.meta.env.BASE_URL}infographic.html`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2 text-primary font-bold">
          <Sparkles className="w-5 h-5 text-gold animate-pulse" />
          <span>แผ่นพับ & โปสเตอร์แนะนำระบบจองห้องซ้อมดนตรี วทก.</span>
        </div>
      }
      description="คู่มือและรายละเอียดการใช้งานระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก."
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1 -mr-1">
        {/* Top 3D Visual Banner */}
        <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 group">
          <img
            src={`${import.meta.env.BASE_URL}infographic-banner.jpg`}
            alt="ระบบจองห้องซ้อมดนตรี วทก. Key Visual Banner"
            className="w-full h-48 sm:h-64 object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex flex-col justify-end p-4 sm:p-5 text-white">
            <div className="inline-flex items-center gap-1.5 bg-secondary/90 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white w-fit mb-1.5 border border-white/20">
              <span>WTK MUSIC STUDIO</span>
            </div>
            <h3 className="text-base sm:text-xl font-extrabold text-white leading-tight drop-shadow-md">
              ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.
            </h3>
            <p className="text-xs text-slate-200 mt-0.5 line-clamp-2">
              ตรวจสอบคิวว่างสด จองง่ายใน 3 ขั้นตอน พร้อมระบบเช็คอิน QR Code สะดวก รวดเร็ว 100% ฟรี
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-2">
            <Button
              variant="gold"
              size="sm"
              onClick={handlePrint}
              className="text-xs font-bold shadow-sm"
            >
              <Printer className="w-4 h-4 mr-1.5 text-amber-950" />
              <span>เปิดหน้าพิมพ์โปสเตอร์ A4 (Print / PDF)</span>
            </Button>
            <a
              href={`${import.meta.env.BASE_URL}infographic-poster.jpg`}
              download="WTK-Music-Studio-Poster.jpg"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-secondary" />
              <span>โหลดภาพโปสเตอร์ 3D</span>
            </a>
          </div>

          <a
            href={`${import.meta.env.BASE_URL}infographic.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:text-primary-dark font-semibold inline-flex items-center gap-1 underline underline-offset-4"
          >
            <span>เปิดหน้าเต็มในแท็บใหม่</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 3-Step Guide Grid */}
        <section className="space-y-3">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="w-5 h-5 rounded-lg bg-primary text-white text-[11px] font-bold flex items-center justify-center">1</span>
            <span>3 ขั้นตอนการจองห้องซ้อมง่ายๆ</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <div className="text-xs font-bold text-slate-800">เลือกวัน & เวลา</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ดูผังปฏิทิน เช็คคิวว่างล่วงหน้า 14 วัน เลือกเวลาซ้อมได้สูงสุด 3 ชม./ครั้ง
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <div className="text-xs font-bold text-slate-800">กรอกข้อมูลผู้จอง</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ระบุชื่อ-สกุล, ชั้นปี, สาขา, จำนวนคน และวัตถุประสงค์ในการขอใช้ห้อง
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <div className="text-xs font-bold text-slate-800">รับรหัส & คีย์การ์ด</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ระบบออกรหัสการจองและ QR Code ส่งเข้าอีเมลทันที พร้อมใช้เช็คอิน
              </p>
            </div>
          </div>
        </section>

        {/* Operating Hours & Studio Gear Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Operating Hours Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200 space-y-2.5">
            <div className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-secondary" />
              <span>เวลาเปิดให้บริการประจำสัปดาห์</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center p-2 bg-white/80 rounded-xl">
                <span className="text-slate-600">จันทร์ - ศุกร์:</span>
                <strong className="text-slate-800 font-bold">16:30 - 20:00 น.</strong>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/80 rounded-xl">
                <span className="text-slate-600">เสาร์ - อาทิตย์:</span>
                <strong className="text-slate-800 font-bold">09:00 - 20:00 น.</strong>
              </div>
            </div>
          </div>

          {/* Studio Equipment Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-200 space-y-2.5">
            <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Music className="w-4 h-4 text-amber-600" />
              <span>เครื่องดนตรีประจำห้องซ้อม</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700">
              <div className="p-1.5 bg-white/80 rounded-lg flex items-center gap-1">🥁 กลองชุด Pearl</div>
              <div className="p-1.5 bg-white/80 rounded-lg flex items-center gap-1">🎸 แอมป์ Marshall</div>
              <div className="p-1.5 bg-white/80 rounded-lg flex items-center gap-1">🔊 แอมป์ Fender</div>
              <div className="p-1.5 bg-white/80 rounded-lg flex items-center gap-1">🎹 คีย์ Roland</div>
              <div className="p-1.5 bg-white/80 rounded-lg flex items-center gap-1">🎙️ ไมค์ Shure x2</div>
              <div className="p-1.5 bg-white/80 rounded-lg flex items-center gap-1">🎛️ PA System</div>
            </div>
          </div>
        </div>

        {/* 4 Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto" />
            <div className="text-[11px] font-bold text-slate-800">กันคิวซ้อน 100%</div>
            <div className="text-[10px] text-slate-500">บล็อกการชนคิวสด</div>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <QrCode className="w-5 h-5 text-primary mx-auto" />
            <div className="text-[11px] font-bold text-slate-800">เช็คอิน 1 คลิก</div>
            <div className="text-[10px] text-slate-500">สแกน QR Code</div>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <Mail className="w-5 h-5 text-secondary mx-auto" />
            <div className="text-[11px] font-bold text-slate-800">แจ้งเตือนอีเมล</div>
            <div className="text-[10px] text-slate-500">ส่งรหัสห้องทันที</div>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <CheckCircle2 className="w-5 h-5 text-teal-600 mx-auto" />
            <div className="text-[11px] font-bold text-slate-800">ฟรี 100%</div>
            <div className="text-[10px] text-slate-500">สำหรับชาว วทก.</div>
          </div>
        </div>

        {/* Essential Rules Box */}
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1.5 text-rose-950">
          <div className="font-bold flex items-center gap-1.5 text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>ข้อปฏิบัติสำคัญ:</span>
          </div>
          <ul className="text-[11px] space-y-1 list-disc list-inside text-rose-900 leading-relaxed">
            <li>ต้องเช็คอินภายใน 30 นาทีหลังเวลาเริ่มจอง (มิฉะนั้นระบบจะตัดสิทธิ์ No-show)</li>
            <li>ห้ามนำอาหารและเครื่องดื่มเข้าห้องซ้อมเด็ดขาด (ยกเว้นน้ำเปล่ามีฝาปิด)</li>
            <li>เมื่อซ้อมเสร็จสิ้น ต้องกดปุ่ม "คืนห้อง" หรือสแกน QR คืนห้องทันที</li>
            <li>ปิดสวิตช์เครื่องขยายเสียง แอมป์ แอร์ และไฟทุกดวงก่อนออกจากห้องซ้อม</li>
          </ul>
        </div>

        {/* Bottom Booking Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span>ชมรมดนตรี วิทยาลัยเทคโนโลยีทางการแพทย์และสาธารณสุข กาญจนาภิเษก</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1 sm:flex-initial text-xs"
            >
              ปิดหน้าต่าง
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onOpenBooking();
              }}
              className="flex-1 sm:flex-initial text-xs font-bold shadow-md"
            >
              <span>⚡ จองห้องซ้อมตอนนี้</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
