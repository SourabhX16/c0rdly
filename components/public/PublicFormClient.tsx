'use client';

import { useState, useEffect, useRef } from 'react';
import { Form } from '@/types/database';
import { submitFormResponseAction } from '@/app/actions/form';
import { searchOrganizations } from '@/actions/submissions';
import { createSubmissionSchema } from '@/lib/validation';
import { CheckCircle, UploadCloud, Edit3, Download, Plus } from 'lucide-react';
import BulkUploadClient from './BulkUploadClient';
import Papa from 'papaparse';

export default function PublicFormClient({ form }: { form: Form }) {
  const [orgName, setOrgName] = useState('');
  const [orgSuggestions, setOrgSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNewIdForm, setShowNewIdForm] = useState(false);
  const [newIdData, setNewIdData] = useState({ email: '', phone: '', address: '' });
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const [mode, setMode] = useState<'manual' | 'bulk' | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const orgInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (orgInputRef.current && !orgInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (orgName.trim().length >= 2) {
        try {
          const results = await searchOrganizations(orgName.trim());
          setOrgSuggestions(results);
          setShowSuggestions(true);
        } catch (err) {
          console.error(err);
        }
      } else {
        setOrgSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [orgName]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!orgName.trim()) {
      setErrors({ orgName: 'Organization name is required' });
      return;
    }

    const schema = createSubmissionSchema(form.fields);
    const result = schema.safeParse(formData);

    if (!result.success) {
      const extractedErrors: Record<string, string> = {};
      for (const err of result.error.issues) {
        extractedErrors[err.path[0] as string] = err.message;
      }
      setErrors(extractedErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await submitFormResponseAction(form.id, orgName, formData);
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setErrors({ orgName: 'Organization name is required' });
      return;
    }

    setIsGeneratingId(true);
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient();
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: orgName.trim(),
          contact_email: newIdData.email || null,
          phone: newIdData.phone || null,
          address: newIdData.address || null,
        })
        .select('id')
        .single();

      if (error) throw error;

      alert(`ID Generated Successfully!\n\nYour Organization ID: ${data.id}\n\nUse "${orgName}" as your organization name when submitting forms.`);
      setShowNewIdForm(false);
      setNewIdData({ email: '', phone: '', address: '' });
    } catch (err: any) {
      alert(err.message || 'Failed to generate ID');
    } finally {
      setIsGeneratingId(false);
    }
  };

  const inputClasses = "input-dark w-full px-4 py-3";
  const selectClasses = "input-dark w-full px-4 py-3 appearance-none";

  if (success) {
    return (
      <div className="glass-card-elevated p-10 text-center animate-crystallize">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-400" strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-white mb-2">Thank you!</h2>
        <p className="text-frost-gray leading-relaxed">Your data has been successfully submitted.</p>
        <button
          onClick={() => {
            setSuccess(false);
            setFormData({});
          }}
          className="mt-6 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors duration-150"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card-floating overflow-hidden">
      <div className="p-8">
        {/* Organization Name Input */}
        <div className="mb-8 relative" ref={orgInputRef}>
          <label className="block text-sm font-semibold text-slate-white mb-2">
            Organization Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Delhi Public School, Raipur"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            onFocus={() => orgSuggestions.length > 0 && setShowSuggestions(true)}
            className={inputClasses}
          />
          {showSuggestions && orgSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 glass-card border border-white/[0.06] shadow-xl max-h-60 overflow-y-auto">
              {orgSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setOrgName(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors duration-150 text-sm font-medium text-frost-gray hover:text-indigo-400"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          {errors.orgName && <p className="text-red-400 text-xs mt-1">{errors.orgName}</p>}
          <p className="text-xs text-dim-steel mt-1.5">Start typing to see existing organizations</p>
          
          {/* New User Button */}
          <button
            type="button"
            onClick={() => setShowNewIdForm(!showNewIdForm)}
            className="mt-3 flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors duration-150"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            {showNewIdForm ? 'Cancel' : 'New user? Generate Organization ID'}
          </button>
        </div>

        {/* New ID Generation Form */}
        {showNewIdForm && (
          <div className="mb-8 p-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 animate-crystallize">
            <h3 className="font-display text-base font-semibold text-slate-white mb-4">Generate New Organization ID</h3>
            <form onSubmit={handleGenerateId} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-frost-gray mb-1.5">Contact Email</label>
                <input
                  type="email"
                  placeholder="contact@organization.com"
                  value={newIdData.email}
                  onChange={(e) => setNewIdData({...newIdData, email: e.target.value})}
                  className="input-dark w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-frost-gray mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newIdData.phone}
                  onChange={(e) => setNewIdData({...newIdData, phone: e.target.value})}
                  className="input-dark w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-frost-gray mb-1.5">Address</label>
                <textarea
                  placeholder="Full address"
                  value={newIdData.address}
                  onChange={(e) => setNewIdData({...newIdData, address: e.target.value})}
                  rows={2}
                  className="input-dark w-full px-3 py-2 text-sm resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isGeneratingId || !orgName.trim()}
                className="btn-primary w-full py-2.5 text-sm disabled:opacity-50"
              >
                {isGeneratingId ? 'Generating...' : 'Generate ID'}
              </button>
              <p className="text-xs text-dim-steel italic">Your organization name will be registered and you'll receive a unique ID.</p>
            </form>
          </div>
        )}

        {/* Mode Selector */}
        {!mode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setMode('manual')}
              className="flex flex-col items-center justify-center p-8 border-2 border-white/[0.06] rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-200 group bg-white/[0.02]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-3 group-hover:bg-indigo-500/20 transition-colors duration-200">
                <Edit3 className="w-6 h-6 text-indigo-400" strokeWidth={1.5} />
              </div>
              <span className="font-display font-semibold text-lg text-slate-white">Manual Entry</span>
              <span className="text-sm text-dim-steel mt-1">Fill out the form row by row</span>
            </button>
            <button
              onClick={() => setMode('bulk')}
              className="flex flex-col items-center justify-center p-8 border-2 border-white/[0.06] rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-200 group bg-white/[0.02]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-3 group-hover:bg-indigo-500/20 transition-colors duration-200">
                <UploadCloud className="w-6 h-6 text-indigo-400" strokeWidth={1.5} />
              </div>
              <span className="font-display font-semibold text-lg text-slate-white">Bulk Upload</span>
              <span className="text-sm text-dim-steel mt-1">Upload a CSV or Excel file</span>
            </button>
          </div>
        ) : mode === 'manual' ? (
          <form onSubmit={handleManualSubmit} className="space-y-5 animate-crystallize">
            <div className="flex items-center justify-between mb-2 pb-4 border-b border-white/[0.06]">
              <h3 className="font-display text-lg font-semibold text-slate-white">Manual Entry</h3>
              <button
                type="button"
                onClick={() => setMode(null)}
                className="text-sm text-dim-steel hover:text-indigo-400 font-medium transition-colors duration-150"
              >
                Change Method
              </button>
            </div>

            {form.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-medium text-slate-white">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </label>

                {field.type === 'text' && (
                  <input
                    type="text"
                    required={field.required}
                    className={inputClasses}
                    value={formData[field.id] || ''}
                    onChange={(e) => {
                      setFormData({...formData, [field.id]: e.target.value});
                      if (errors[field.id]) setErrors({...errors, [field.id]: ''});
                    }}
                  />
                )}
                {field.type === 'number' && (
                  <input
                    type="number"
                    required={field.required}
                    className={inputClasses}
                    value={formData[field.id] || ''}
                    onChange={(e) => {
                      setFormData({...formData, [field.id]: e.target.value});
                      if (errors[field.id]) setErrors({...errors, [field.id]: ''});
                    }}
                  />
                )}
                {field.type === 'date' && (
                  <input
                    type="date"
                    required={field.required}
                    className={inputClasses}
                    value={formData[field.id] || ''}
                    onChange={(e) => {
                      setFormData({...formData, [field.id]: e.target.value});
                      if (errors[field.id]) setErrors({...errors, [field.id]: ''});
                    }}
                  />
                )}
                {field.type === 'select' && (
                  <div className="relative">
                    <select
                      required={field.required}
                      className={selectClasses}
                      value={formData[field.id] || ''}
                      onChange={(e) => {
                        setFormData({...formData, [field.id]: e.target.value});
                        if (errors[field.id]) setErrors({...errors, [field.id]: ''});
                      }}
                    >
                      <option value="" className="text-dim-steel">Select an option...</option>
                      {field.options?.map((opt, i) => (
                        <option key={i} value={opt} className="bg-deep-abyss">{opt}</option>
                      ))}
                    </select>
                  </div>
                )}
                {field.type === 'file' && (
                  <div className="relative">
                    <input
                      type="file"
                      required={field.required}
                      className="w-full border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm bg-white/[0.02] text-frost-gray file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 transition-all cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFormData({...formData, [field.id]: e.target.files[0].name});
                          if (errors[field.id]) setErrors({...errors, [field.id]: ''});
                        }
                      }}
                    />
                  </div>
                )}
                {errors[field.id] && <p className="text-red-400 text-xs mt-1">{errors[field.id]}</p>}
              </div>
            ))}

            <div className="pt-6 mt-6 border-t border-white/[0.06]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3.5 text-base"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Entry'}
              </button>
            </div>
          </form>
        ) : (
          <div className="animate-crystallize">
             <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                <h3 className="font-display text-lg font-semibold text-slate-white">Bulk Upload</h3>
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="text-sm text-dim-steel hover:text-indigo-400 font-medium transition-colors duration-150 flex items-center gap-1"
                >
                  Change Method
                </button>
              </div>
            <BulkUploadClient
              form={form}
              orgName={orgName}
              onCancel={() => setMode(null)}
              onSuccess={() => setSuccess(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
