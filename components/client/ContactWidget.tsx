import { Phone, Mail, MapPin } from 'lucide-react';
import { CONTACT_PHONE, CONTACT_EMAIL, APP_FULL_NAME } from '@/lib/constants';

export default function ContactWidget({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Contact Us</h3>
        <div className="space-y-2 text-sm">
          <a href={`tel:${CONTACT_PHONE}`} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>{CONTACT_PHONE}</span>
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{CONTACT_EMAIL}</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <h3 className="font-bold text-slate-800 text-lg">{APP_FULL_NAME}</h3>
      <div className="space-y-3">
        <a href={`tel:${CONTACT_PHONE}`} className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition group">
          <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition">
            <Phone className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-medium">{CONTACT_PHONE}</span>
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition group">
          <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition">
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-medium truncate">{CONTACT_EMAIL}</span>
        </a>
        <div className="flex items-center gap-3 text-slate-600">
          <div className="bg-blue-50 p-2 rounded-lg">
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-medium">Available for all your printing needs</span>
        </div>
      </div>
    </div>
  );
}
