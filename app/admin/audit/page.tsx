import { getAuditLogsAction } from '@/lib/audit';
import { getForms } from '@/actions/forms';
import AuditTable from './components/AuditTable';

export default async function AdminAuditPage() {
  const logs = await getAuditLogsAction();
  const forms = await getForms();

  return (
    <div className="py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Audit Log</h1>
        <p className="mt-2 text-sm text-slate-500 font-medium">Track all admin actions on forms and submissions.</p>
      </div>

      <AuditTable initialLogs={logs} forms={forms} />
    </div>
  );
}
