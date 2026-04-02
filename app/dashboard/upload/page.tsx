import { createClient } from '@/lib/supabase/server';
import BulkUpload from '@/components/dashboard/BulkUpload';

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Bulk Upload</h1>
        <p className="mt-1 text-sm text-surface-500">Upload multiple students at once via CSV file</p>
      </div>
      <BulkUpload schoolId={user!.id} />
    </div>
  );
}
