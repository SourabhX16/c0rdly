import PrintJobsClient from '@/components/admin/PrintJobsClient';

export default function PrintJobsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Print Jobs</h1>
        <p className="mt-1 text-sm text-surface-500">Select students, generate report card PDFs, and download as ZIP</p>
      </div>
      <PrintJobsClient />
    </div>
  );
}
