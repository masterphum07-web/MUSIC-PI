import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { adminLogin } from '@/lib/api';
import { AdminUser } from '@/types';
import { useToast } from '@/components/common/Toast';
import { Eye, EyeOff, Lock, User, Info } from 'lucide-react';

export interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, user: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('กรุณากรอกทั้งชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoginStatus('กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...');

    const timer = setTimeout(() => {
      setLoginStatus('กำลังเชื่อมต่อฐานข้อมูล Google Apps Script...');
    }, 2000);

    try {
      const res = await adminLogin(username.trim(), password.trim());
      clearTimeout(timer);
      setLoginStatus('เข้าสู่ระบบสำเร็จ! กำลังเปิดคอนโซล...');
      localStorage.setItem('wtk_admin_token', res.token);
      localStorage.setItem('wtk_admin_user', JSON.stringify(res.user));
      toast.success('เข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับ ${res.user.display_name}`);
      onSuccess(res.token, res.user);
      onClose();
    } catch (err: any) {
      clearTimeout(timer);
      setError(err.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      toast.error('เข้าสู่ระบบไม่สำเร็จ', err.message);
    } finally {
      setIsLoading(false);
      setLoginStatus('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={!isLoading}>
      <div className="space-y-5 py-1">
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto flex items-center justify-center">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="ตราสัญลักษณ์ วทก."
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
          <h2 className="text-lg font-bold text-primary">เข้าสู่ระบบผู้ดูแลระบบ</h2>
          <p className="text-xs text-slate-500">
            ระบบจัดการหลังบ้าน ชมรมดนตรี วทก.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>ชื่อผู้ใช้ (Username)</span>
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-primary" />
              <span>รหัสผ่าน (Password)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ระบุรหัสผ่านผู้ดูแล"
                required
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-3 pr-10 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Default credentials hint */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <strong>รหัสเริ่มต้นระบบ:</strong><br />
              ผู้ใช้: <code className="bg-white px-1.5 py-0.5 rounded border text-primary font-bold">admin</code> &nbsp;|&nbsp; 
              รหัสผ่าน: <code className="bg-white px-1.5 py-0.5 rounded border text-primary font-bold">Admin@WTK2026</code>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isLoading}
            className="w-full font-bold shadow-md"
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ Admin Console'}
          </Button>

          {isLoading && (
            <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-center space-y-1 animate-fade-in">
              <div className="text-xs font-bold text-primary flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                <span>{loginStatus || 'กำลังเชื่อมต่อเซิร์ฟเวอร์...'}</span>
              </div>
              <p className="text-[10px] text-slate-500">
                ระบบรักษาความปลอดภัยกำลังยืนยันตัวตน กรุณารอสักครู่
              </p>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};
