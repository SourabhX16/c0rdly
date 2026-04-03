import { getAdminFormsAction } from '@/app/actions/form';
import Link from 'next/link';
import { PlusCircle, Link as LinkIcon, Edit, Eye, Users } from 'lucide-react';

export default async function AdminFormsPage() {
  const forms = await getAdminFormsAction();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dynamic Forms</h1>
          <p className="text-gray-500 mt-1">Create and manage data collection forms</p>
        </div>
        <Link 
          href="/admin/forms/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm font-medium"
        >
          <PlusCircle className="w-5 h-5" />
          Create Form
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <PlusCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">No forms created yet</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto mb-6">
            Get started by creating your first dynamic form to start collecting data from organizations.
          </p>
          <Link 
            href="/admin/forms/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition"
          >
            Create Your First Form
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div key={form.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col">
              <div className="p-6 flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {form.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {form.description || "No description provided."}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg">
                  <span className="font-medium px-2 py-1 bg-white rounded border border-gray-200 text-xs">
                    {form.fields.length} Fields
                  </span>
                  <span className="text-gray-400">&bull;</span>
                  <span className="truncate">Created {new Date(form.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex bg-blue-50/50 p-3 rounded-lg border border-blue-100/50 items-center justify-between">
                  <p className="text-xs font-mono text-blue-800 truncate pr-4">
                    /f/{form.share_url_id}
                  </p>
                  <button 
                    className="text-blue-600 hover:text-blue-800 shrink-0"
                    title="Copy share link"
                    // Add copy logic later
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex justify-between items-center bg-white mt-auto">
                <Link
                  href={`/admin/forms/${form.id}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  <Users className="w-4 h-4" />
                  Responses
                </Link>
                <div className="flex gap-4">
                  <Link
                    href={`/f/${form.share_url_id}`}
                    target="_blank"
                    className="text-gray-500 hover:text-gray-900 transition"
                    title="View Form"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
