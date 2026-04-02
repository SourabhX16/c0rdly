'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { updateProfile, updateLogoUrl } from '@/actions/profile';
import type { Profile } from '@/types/database';
import { Save, Loader2, Upload, X, ImageIcon } from 'lucide-react';

interface Props {
  profile: Profile;
}

export default function ProfileSettings({ profile }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [schoolName, setSchoolName] = useState(profile.school_name || '');
  const [contactEmail, setContactEmail] = useState(profile.contact_email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [address, setAddress] = useState(profile.address || '');
  const [logoUrl, setLogoUrl] = useState(profile.logo_url || '');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile({
        school_name: schoolName,
        contact_email: contactEmail,
        phone,
        address,
      });
      setSuccess('Profile updated successfully!');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, SVG)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be under 2MB');
      return;
    }

    setLogoLoading(true);
    setError('');
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const filePath = `logos/${profile.id}.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('school-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('school-assets')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Save URL to profile
      await updateLogoUrl(publicUrl);
      setLogoUrl(publicUrl);
      setSuccess('Logo uploaded successfully!');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo');
    } finally {
      setLogoLoading(false);
    }
  };

  const handleRemoveLogo = async () => {
    setLogoLoading(true);
    setError('');
    try {
      await updateLogoUrl('');
      setLogoUrl('');
      setSuccess('Logo removed');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to remove logo');
    } finally {
      setLogoLoading(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20';
  const labelCls = 'mb-1 block text-sm font-medium text-surface-700';

  return (
    <div className="space-y-6">
      {error && <div className="rounded-lg bg-danger-500/10 px-4 py-3 text-sm text-danger-600">{error}</div>}
      {success && <div className="rounded-lg bg-accent-100 px-4 py-3 text-sm font-medium text-accent-700">{success}</div>}

      {/* Logo Section */}
      <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-900">School Logo</h2>
        <p className="mt-1 text-sm text-surface-500">
          This logo will appear on generated report card PDFs
        </p>

        <div className="mt-4 flex items-center gap-6">
          {/* Logo preview */}
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-surface-300 bg-surface-50">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="School logo" className="h-full w-full object-contain p-1" />
            ) : (
              <ImageIcon className="h-8 w-8 text-surface-300" />
            )}
          </div>

          <div className="space-y-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-700 transition-all hover:border-primary-300 hover:bg-primary-50/50">
              {logoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {logoUrl ? 'Change Logo' : 'Upload Logo'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={logoLoading}
              />
            </label>
            {logoUrl && (
              <button
                onClick={handleRemoveLogo}
                disabled={logoLoading}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-danger-600 transition-all hover:bg-danger-500/10"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            )}
            <p className="text-xs text-surface-400">PNG, JPG, SVG, or WebP. Max 2MB.</p>
          </div>
        </div>
      </div>

      {/* School Info */}
      <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-900">School Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>School Name</label>
            <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className={inputCls}
              placeholder="e.g. Sunrise Public School" />
          </div>
          <div>
            <label className={labelCls}>Contact Email</label>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputCls}
              placeholder="e.g. info@school.edu.in" />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls}
              placeholder="e.g. +91 98765 43210" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Address</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className={inputCls}
              placeholder="Full school address" />
          </div>
        </div>

        <div className="mt-5">
          <button onClick={handleSave} disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
