import React from 'react';
import { ShieldCheck, Music, Phone, Clock } from 'lucide-react';
import {
  PublicSettings,
  DEFAULT_RULES_TITLE,
  DEFAULT_RULES_TEXT,
  DEFAULT_CONTACT_TITLE,
  DEFAULT_CONTACT_LOCATION,
  DEFAULT_FOOTER_COPYRIGHT,
  DEFAULT_FOOTER_TAGLINE,
} from '@/types';

export interface RulesFooterProps {
  settings?: PublicSettings;
  contactInfo?: string;
}

export const RulesFooter: React.FC<RulesFooterProps> = ({ settings, contactInfo }) => {
  const rulesTitle = settings?.rules_title?.trim() || DEFAULT_RULES_TITLE;
  const rawRulesText = settings?.rules_text?.trim() || DEFAULT_RULES_TEXT;
  const rulesList = rawRulesText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const contactTitle = settings?.contact_title?.trim() || DEFAULT_CONTACT_TITLE;
  const contactLocation = settings?.contact_location?.trim() || DEFAULT_CONTACT_LOCATION;
  const weekdayHours = settings?.operating_hours_weekday?.trim() || '16:30-20:00';
  const weekendHours = settings?.operating_hours_weekend?.trim() || '09:00-20:00';
  const extraContact = settings?.contact_info?.trim() || contactInfo?.trim();
  const copyright = settings?.footer_copyright?.trim() || DEFAULT_FOOTER_COPYRIGHT;
  const tagline = settings?.footer_tagline?.trim() || DEFAULT_FOOTER_TAGLINE;

  return (
    <footer className="mt-16 bg-slate-900 text-slate-300 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
        {/* Rules Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-gold font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0" />
            <span>{rulesTitle}</span>
          </div>
          <ul className="text-xs space-y-2 text-slate-400 leading-relaxed list-disc list-inside">
            {rulesList.map((line, idx) => {
              const colonIndex = line.indexOf(':');
              if (colonIndex !== -1 && colonIndex < 35) {
                const head = line.slice(0, colonIndex + 1);
                const body = line.slice(colonIndex + 1);
                return (
                  <li key={idx}>
                    <strong>{head}</strong>
                    {body}
                  </li>
                );
              }
              return <li key={idx}>{line}</li>;
            })}
          </ul>
        </div>

        {/* Contact & Hours Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gold font-bold text-sm">
            <Phone className="w-4 h-4 text-gold flex-shrink-0" />
            <span>{contactTitle}</span>
          </div>
          <div className="text-xs space-y-2 text-slate-400">
            <div className="flex items-start gap-2">
              <Music className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <span>{contactLocation}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-secondary flex-shrink-0" />
              <span>
                เวลาทำการ: จันทร์-ศุกร์ {weekdayHours} น. | เสาร์-อาทิตย์ {weekendHours} น.
              </span>
            </div>
            {extraContact && (
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] text-slate-300 mt-2 whitespace-pre-line">
                {extraContact}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} {copyright}
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>{tagline}</span>
          <span>•</span>
          <span className="text-slate-400">เวอร์ชัน 1.0.0</span>
        </div>
      </div>
    </footer>
  );
};
