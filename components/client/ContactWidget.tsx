import { Phone, Mail, MapPin } from 'lucide-react';
import { CONTACT_PHONE, CONTACT_EMAIL, APP_FULL_NAME } from '@/lib/constants';

export default function ContactWidget({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-6 py-4 text-sm">
        <a
          href={`tel:${CONTACT_PHONE}`}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors duration-150"
        >
          <Phone className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
          <span className="font-medium">{CONTACT_PHONE}</span>
        </a>
        <span className="text-slate-300">·</span>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors duration-150"
        >
          <Mail className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
          <span className="font-medium truncate">{CONTACT_EMAIL}</span>
        </a>
      </div>
    );
  }

  return (
    <div className="glass-card-elevated p-6 space-y-4">
      <h3 className="font-display text-base font-semibold text-slate-white">{APP_FULL_NAME}</h3>
      <div className="space-y-3">
        <a
          href={`tel:${CONTACT_PHONE}`}
          className="flex items-center gap-3 text-frost-gray hover:text-indigo-400 transition-colors duration-150 group"
        >
          <div className="bg-indigo-500/15 p-2 rounded-xl group-hover:bg-indigo-500/25 transition-colors duration-150">
            <Phone className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
          </div>
          <span className="font-medium text-sm">{CONTACT_PHONE}</span>
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="flex items-center gap-3 text-frost-gray hover:text-indigo-400 transition-colors duration-150 group"
        >
          <div className="bg-indigo-500/15 p-2 rounded-xl group-hover:bg-indigo-500/25 transition-colors duration-150">
            <Mail className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
          </div>
          <span className="font-medium text-sm truncate">{CONTACT_EMAIL}</span>
        </a>
        <div className="flex items-center gap-3 text-frost-gray">
          <div className="bg-indigo-500/15 p-2 rounded-xl">
            <MapPin className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
          </div>
          <span className="font-medium text-sm">Available for all your printing needs</span>
        </div>
      </div>
    </div>
  );
}
