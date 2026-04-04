import { getOrganizations } from '@/actions/organizations';
import OrganizationManager from '@/components/admin/OrganizationManager';

export default async function OrganizationsPage() {
  const organizations = await getOrganizations();

  return (
    <div className="py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-white tracking-tight">Organizations</h1>
        <p className="mt-2 text-sm text-frost-gray font-medium">Manage registered organizations and their contact details.</p>
      </div>

      <OrganizationManager organizations={organizations} />
    </div>
  );
}
