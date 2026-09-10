import React from 'react';
import { Megaphone, X } from 'lucide-react';

export interface AnnouncementBarProps {
  text?: string;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ text }) => {
  const [visible, setVisible] = React.useState(true);

  if (!text || !visible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 via-teal-50 to-blue-50 border-b border-secondary/20 text-slate-700 py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
            <Megaphone className="w-3.5 h-3.5" />
          </span>
          <span className="font-semibold text-secondary flex-shrink-0">ประกาศ:</span>
          <span className="truncate text-slate-700">{text}</span>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/50 transition-colors flex-shrink-0"
          aria-label="ปิดแถบประกาศ"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
