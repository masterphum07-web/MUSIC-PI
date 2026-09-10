import { useState } from 'react';
import { ToastProvider, useToast } from '@/components/common/Toast';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Modal } from '@/components/common/Modal';
import { Music, CheckCircle, Sparkles } from 'lucide-react';

function SetupShowcase() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <header className="flex items-center justify-between py-6 border-b border-slate-200 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-secondary font-bold tracking-wider uppercase">
              วิทยาลัยเทคโนโลยีทางการแพทย์และสาธารณสุข กาญจนาภิเษก
            </div>
            <h1 className="text-xl font-bold text-primary">ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.</h1>
          </div>
        </div>
        <Badge variant="gold" size="md">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Frontend Setup สำเร็จ
        </Badge>
      </header>

      {/* Design System Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-base font-bold text-primary mb-3">🎨 Design Tokens & Components</h2>
          <p className="text-xs text-slate-500 mb-4">
            ตรวจสอบสีสัน ฟอนต์ภาษาไทย (IBM Plex Sans Thai / Sarabun) และคอมโพเนนต์พื้นฐาน
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Button size="sm" variant="primary" onClick={() => toast.success('ทดสอบสำเร็จ', 'ปุ่ม Primary ทำงานเรียบร้อย')}>
              Primary Button
            </Button>
            <Button size="sm" variant="secondary" onClick={() => toast.info('แจ้งเตือน', 'ปุ่ม Secondary ทำงานเรียบร้อย')}>
              Secondary
            </Button>
            <Button size="sm" variant="gold" onClick={() => toast.success('พิเศษ', 'ปุ่ม Gold เด่นชัด')}>
              Gold Highlight
            </Button>
            <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}>
              เปิด Modal
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="gold">Gold</Badge>
            <Badge variant="success">ว่าง (Available)</Badge>
            <Badge variant="warning">ใกล้ถึงเวลา</Badge>
            <Badge variant="danger">จองแล้ว</Badge>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-bold text-primary mb-3">📝 Form Elements</h2>
          <div className="space-y-3">
            <Input
              label="ชื่อ-นามสกุลจริง"
              placeholder="เช่น นายสมชาย ใจดี"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              required
            />
            <Select
              label="ชั้นปี"
              options={[
                { value: 'ปี 1', label: 'ชั้นปีที่ 1' },
                { value: 'ปี 2', label: 'ชั้นปีที่ 2' },
                { value: 'ปี 3', label: 'ชั้นปีที่ 3' },
                { value: 'ปี 4', label: 'ชั้นปีที่ 4' },
                { value: 'บุคลากร', label: 'อาจารย์ / บุคลากร' },
              ]}
            />
          </div>
        </Card>
      </div>

      {/* Modal Demonstration */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="ทดสอบคอมโพเนนต์ Modal"
        description="ระบบ Dialog Modal พร้อม Animate และ Backdrop Blur"
      >
        <div className="text-sm text-slate-600 space-y-3">
          <p>
            พร้อมสำหรับเข้าสู่ <strong>PHASE 6: หน้าหลัก (Public Dashboard & Timeline Grid)</strong> ในสเต็ปถัดไป
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-700">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>เชื่อมต่อ API Client เข้ากับ Google Apps Script เรียบร้อยแล้ว</span>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button size="sm" variant="primary" onClick={() => setModalOpen(false)}>
            เข้าใจแล้ว
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <SetupShowcase />
    </ToastProvider>
  );
}

export default App;
