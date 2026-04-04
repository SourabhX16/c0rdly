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
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Printing Submissions</h1>
        <p className="mt-2 text-sm text-slate-500 font-medium">Manage client requests and track the progress of printing jobs.</p>
      </div>

      <SubmissionsTable initialSubmissions={submissions} forms={forms} orgs={orgs} />
    </div>
  );
}
