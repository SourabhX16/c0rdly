'use client';

import { useState } from 'react';
import { CheckCircle, Copy, IdCard, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewOrgClient() {
  const [orgName, setOrgName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient();
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: orgName.trim(),
          contact_email: contactEmail || null,
          phone: phone || null,
          address: address || null,
        })
        .select('id')
        .single();

      if (error) throw error;
      setGeneratedId(data.id);
    } catch (err: any) {
      alert(err.message || 'Failed to generate ID');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (generatedId) {
      navigator.clipboard.writeText(generatedId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (generatedId) {
    return (
      <div className="glass-card-elevated p-10 text-center animate-crystallize">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-400" strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-white mb-2">ID Generated Successfully!</h2>
        <p className="text-frost-gray leading-relaxed mb-6">Your unique organization ID has been created.</p>
        
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 mb-6">
          <p className="text-xs text-dim-steel mb-2 uppercase tracking-wider font-semibold">Your Organization ID</p>
          <div className="flex items-center justify-center gap-3">
            <code className="font-mono text-lg font-bold text-indigo-400 break-all">{generatedId}</code>
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors duration-150 shrink-0"
              title="Copy to clipboard"
            >
              {copied ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
              ) : (
                <Copy className="w-5 h-5 text-frost-gray" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-5 mb-6 text-left">
          <p className="text-sm text-frost-gray mb-3">
            <span className="font-semibold text-slate-white">Important:</span> When submitting forms, use this organization name:
          </p>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3">
            <code className="font-mono text-base font-bold text-indigo-400">{orgName}</code>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/portal"
            className="btn-primary flex-1 py-3 text-center"
          >
            Go to Portal
          </Link>
          <button
            onClick={() => {
              setGeneratedId(null);
              setOrgName('');
              setContactEmail('');
              setPhone('');
              setAddress('');
            }}
            className="flex-1 py-3 px-4 rounded-xl border border-white/[0.06] bg-white/[0.02] text-frost-gray hover:bg-white/[0.04] hover:text-slate-white font-semibold text-sm transition-all duration-150"
          >
            Generate Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card-elevated p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-white mb-2">
            Organization Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Delhi Public School, Raipur"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="input-dark w-full px-4 py-3"
          />
          <p className="text-xs text-dim-steel mt-1.5">Enter your institution or organization name</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-white mb-2">
            Contact Email
          </label>
          <input
            type="email"
            placeholder="contact@organization.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="input-dark w-full px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-white mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-dark w-full px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-white mb-2">
            Address
          </label>
          <textarea
            placeholder="Full address of your organization"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="input-dark w-full px-4 py-3 resize-none"
          />
        </div>

        <div className="pt-4 border-t border-white/[0.06]">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <IdCard className="w-5 h-5" strokeWidth={1.5} />
                Generate ID
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
