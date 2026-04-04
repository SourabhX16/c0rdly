'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Building2, Mail, Phone, MapPin, Save } from 'lucide-react';
import { createOrganization, updateOrganization, deleteOrganization } from '@/actions/organizations';

interface Organization {
  id: string;
  name: string;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

interface OrganizationManagerProps {
  organizations: Organization[];
}

export default function OrganizationManager({ organizations }: OrganizationManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    phone: '',
    address: '',
  });

  const openCreateForm = () => {
    setEditingOrg(null);
    setFormData({ name: '', contact_email: '', phone: '', address: '' });
    setIsFormOpen(true);
  };

  const openEditForm = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      contact_email: org.contact_email || '',
      phone: org.phone || '',
      address: org.address || '',
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingOrg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingOrg) {
        await updateOrganization(editingOrg.id, formData);
      } else {
        await createOrganization(formData);
      }
      closeForm();
    } catch (error: any) {
      alert(error.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteOrganization(id);
    } catch (error: any) {
      alert(error.message || 'Failed to delete organization');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-white tracking-tight">Organizations</h2>
          <p className="text-sm text-frost-gray mt-1">Manage registered organizations</p>
        </div>
        <button
          onClick={openCreateForm}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-5 h-5" strokeWidth={1.5} />
          Add Organization
        </button>
      </div>

      {/* Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeForm}>
          <div className="glass-card-floating w-full max-w-lg p-6 space-y-4 animate-crystallize" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-display text-lg font-semibold text-slate-white">
                {editingOrg ? 'Edit Organization' : 'New Organization'}
              </h3>
              <button onClick={closeForm} className="text-dim-steel hover:text-slate-white transition-colors duration-150">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-frost-gray mb-1.5">Organization Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-dark w-full"
                  placeholder="Enter organization name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-frost-gray mb-1.5">Contact Email</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="input-dark w-full"
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-frost-gray mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-dark w-full"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-frost-gray mb-1.5">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-dark w-full resize-none"
                  rows={3}
                  placeholder="Full address"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="btn-secondary text-sm py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center gap-2 text-sm py-2.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" strokeWidth={1.5} />
                  {isSubmitting ? 'Saving...' : editingOrg ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Organization grid */}
      {organizations.length === 0 ? (
        <div className="glass-card-elevated flex flex-col items-center justify-center py-16 px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/10 mb-4">
            <Building2 className="w-8 h-8 text-indigo-400" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-xl font-semibold text-slate-white">No organizations yet</h3>
          <p className="text-frost-gray mt-2 max-w-md mx-auto mb-6 text-sm text-center leading-relaxed">
            Add your first organization to start tracking submissions.
          </p>
          <button
            onClick={openCreateForm}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-5 h-5" strokeWidth={1.5} />
            Add Organization
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="crystal-card overflow-hidden group"
            >
              <div className="p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/10">
                      <Building2 className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-display font-semibold text-slate-white group-hover:text-indigo-400 transition-colors duration-150">
                      {org.name}
                    </h3>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-frost-gray">
                  {org.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-dim-steel shrink-0" strokeWidth={1.5} />
                      <span className="truncate">{org.contact_email}</span>
                    </div>
                  )}
                  {org.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-dim-steel shrink-0" strokeWidth={1.5} />
                      <span>{org.phone}</span>
                    </div>
                  )}
                  {org.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-dim-steel shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="line-clamp-2">{org.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-white/[0.06] px-4 py-3 flex justify-end gap-2">
                <button
                  onClick={() => openEditForm(org)}
                  className="p-2 text-dim-steel hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all duration-150"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => handleDelete(org.id, org.name)}
                  className="p-2 text-dim-steel hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-150"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
