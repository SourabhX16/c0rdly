'use client';

import { useState } from 'react';
import { Form } from '@/types/database';
import { submitFormResponseAction } from '@/app/actions/form';
import { CheckCircle, UploadCloud, Edit3 } from 'lucide-react';
import BulkUploadClient from './BulkUploadClient';

export default function PublicFormClient({ form }: { form: Form }) {
  const [orgName, setOrgName] = useState('');
  const [mode, setMode] = useState<'manual' | 'bulk' | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      alert('Organization name is required');
      return;
    }
    
    // Check required fields
    for (const field of form.fields) {
      if (field.required && !formData[field.id]) {
        alert(`Field "${field.label}" is required.`);
        return;
      }
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

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center border border-gray-100">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
        <p className="text-gray-500">Your data has been successfully submitted.</p>
        <button 
          onClick={() => {
            setSuccess(false);
            setFormData({});
          }}
          className="mt-6 text-blue-600 font-medium hover:underline"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-8 border-b border-gray-100 bg-gray-50/50">
        <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
        {form.description && (
          <p className="text-gray-600 mt-2">{form.description}</p>
        )}
      </div>

      <div className="p-8">
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Organization Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Acme Corp"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
          />
        </div>

        {!mode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => setMode('manual')}
              className="flex flex-col items-center justify-center p-8 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-700"
            >
              <Edit3 className="w-10 h-10 mb-3 text-blue-500" />
              <span className="font-semibold text-lg">Manual Entry</span>
              <span className="text-sm text-gray-500 mt-1">Fill out the form row by row</span>
            </button>
            <button 
              onClick={() => setMode('bulk')}
              className="flex flex-col items-center justify-center p-8 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-700"
            >
              <UploadCloud className="w-10 h-10 mb-3 text-blue-500" />
              <span className="font-semibold text-lg">Bulk Upload</span>
              <span className="text-sm text-gray-500 mt-1">Upload a CSV or Excel file</span>
            </button>
          </div>
        ) : mode === 'manual' ? (
          <form onSubmit={handleManualSubmit} className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Manual Entry</h3>
              <button 
                type="button" 
                onClick={() => setMode(null)}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Change Method
              </button>
            </div>

            {form.fields.map((field) => (
              <div key={field.id} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.type === 'text' && (
                  <input
                    type="text"
                    required={field.required}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData[field.id] || ''}
                    onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                  />
                )}
                {field.type === 'number' && (
                  <input
                    type="number"
                    required={field.required}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData[field.id] || ''}
                    onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                  />
                )}
                {field.type === 'date' && (
                  <input
                    type="date"
                    required={field.required}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData[field.id] || ''}
                    onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                  />
                )}
                {field.type === 'select' && (
                  <select
                    required={field.required}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={formData[field.id] || ''}
                    onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                  >
                    <option value="">Select an option...</option>
                    {field.options?.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                {field.type === 'file' && (
                  <input
                    type="file"
                    required={field.required}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => {
                      // We would handle file upload to storage here, and set the URL/path in formData
                      // For now, we will just store file name
                      if (e.target.files && e.target.files[0]) {
                        setFormData({...formData, [field.id]: e.target.files[0].name});
                      }
                    }}
                  />
                )}
              </div>
            ))}

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-sm disabled:opacity-50 transition"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Entry'}
              </button>
            </div>
          </form>
        ) : (
          <BulkUploadClient 
            form={form} 
            orgName={orgName} 
            onCancel={() => setMode(null)} 
            onSuccess={() => setSuccess(true)} 
          />
        )}
      </div>
    </div>
  );
}
