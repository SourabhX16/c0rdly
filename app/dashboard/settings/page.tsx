import { createClient } from '@/lib/supabase/server';
import ProfileSettings from '@/components/dashboard/ProfileSettings';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
        <p className="mt-1 text-sm text-surface-500">Manage your school profile and logo</p>
      </div>
      <ProfileSettings profile={profile!} />
    </div>
  );
}
