import { getSubmissions, getUniqueOrgs } from '@/actions/submissions';
import { getForms } from '@/actions/forms';
import SubmissionsTable from '@/components/admin/SubmissionsTable';

export default async function AdminSubmissionsPage() {
  const submissions = await getSubmissions();
  const forms = await getForms();
  const orgs = await getUniqueOrgs();

  return (
    <div className="py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-white tracking-tight">Printing Submissions</h1>
        <p className="mt-2 text-sm text-frost-gray font-medium">Manage client requests and track the progress of printing jobs.</p>
      </div>

      <SubmissionsTable initialSubmissions={submissions} forms={forms} orgs={orgs} />
    </div>
  );
}
