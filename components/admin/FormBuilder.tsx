'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { createFormAction } from '@/app/actions/form';
import { FormField, FormFieldType, Form } from '@/types/database';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, Save, Type, ListMinus, Hash, Calendar, FileType, Eye, EyeOff, X } from 'lucide-react';
import { saveForm } from '@/actions/forms';

const fieldTypeIcons = {
  text: <Type className="w-4 h-4" strokeWidth={1.5} />,
  number: <Hash className="w-4 h-4" strokeWidth={1.5} />,
  select: <ListMinus className="w-4 h-4" strokeWidth={1.5} />,
  date: <Calendar className="w-4 h-4" strokeWidth={1.5} />,
  file: <FileType className="w-4 h-4" strokeWidth={1.5} />,
};

interface FormBuilderProps {
  initialData?: Form | null;
}

export default function FormBuilder({ initialData }: FormBuilderProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [fields, setFields] = useState<FormField[]>(initialData?.fields || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: { active: { id: string }; over: { id: string } | null }) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setFields((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const addField = (type: FormFieldType) => {
    const id = uuidv4();
    const label = `New ${type} field`;
    setFields([
      ...fields,
      {
        id,
        name: `field_${Date.now()}`,
        type,
        label,
        required: false,
        options: type === 'select' ? ['Option 1'] : [],
      },
    ]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please provide a title for the form.");
      return;
    }
    if (fields.length === 0) {
      alert("Please add at least one field.");
      return;
    }

    try {
      setIsSaving(true);
      await saveForm({
        id: initialData?.id,
        title,
        description,
        fields
      });
      router.push('/admin');
    } catch (e: any) {
      alert(e.message || "Something went wrong.");
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Sticky Toolbar */}
      <div className="flex justify-between items-center glass-card-elevated p-4 sticky top-[72px] z-40">
        <h2 className="font-display text-lg font-semibold text-slate-white">
          {initialData ? 'Edit Form' : 'Create New Form'}
        </h2>
        <div className="flex gap-2.5">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="btn-secondary flex items-center gap-2 text-sm py-2"
          >
            {isPreview ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
            {isPreview ? 'Edit Mode' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2 text-sm py-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" strokeWidth={1.5} />
            {isSaving ? "Saving..." : "Save Form"}
          </button>
        </div>
      </div>

      {isPreview ? (
        /* Preview Mode — light theme preview */
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-3xl mx-auto animate-crystallize">
          <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">{title || 'Untitled Form'}</h3>
            <p className="text-sm text-slate-500">{description || 'No description provided.'}</p>
          </div>
          <div className="space-y-5">
            {fields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-sm outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all">
                    <option value="">Select an option...</option>
                    {field.options?.map((opt: string) => <option key={opt}>{opt}</option>)}
                  </select>
                ) : field.type === 'file' ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                    <FileType className="mx-auto h-7 w-7 text-slate-400 mb-2" strokeWidth={1.5} />
                    <p className="text-xs text-slate-500 font-medium">Click to upload or drag & drop</p>
                  </div>
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-sm outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Edit Mode — dark theme */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-3 space-y-6">
            {/* Form Metadata */}
            <div className="glass-card-elevated p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 px-1">Form Title</label>
                <input
                  type="text"
                  placeholder="e.g. Marksheet Data Collection 2025"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full font-display text-2xl font-bold text-slate-white placeholder:text-dim-steel/40 border-none focus:ring-0 p-0 bg-transparent tracking-tight outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-dim-steel px-1">Description</label>
                <textarea
                  placeholder="Explain what this form is for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-frost-gray placeholder:text-dim-steel/40 border-none focus:ring-0 p-0 resize-none h-16 bg-transparent text-sm leading-relaxed outline-none"
                />
              </div>
            </div>

            {/* Form Fields Canvas */}
            <div className="bg-white/[0.02] p-8 rounded-2xl border border-white/[0.06] min-h-[500px]">
              {fields.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-dim-steel py-32">
                  <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/10 mb-4">
                    <Plus className="w-8 h-8 text-indigo-400" strokeWidth={1.5} />
                  </div>
                  <p className="font-display font-semibold text-frost-gray">Your canvas is empty</p>
                  <p className="text-xs text-dim-steel mt-1">Select field types from the right sidebar to start building</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                      {fields.map((field) => (
                        <SortableFieldItem
                          key={field.id}
                          field={field}
                          onUpdate={updateField}
                          onDelete={deleteField}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>

          {/* Editor Sidebar */}
          <div className="glass-card-elevated p-6 sticky top-[72px] space-y-8">
            <div>
              <h3 className="font-display text-xs font-bold text-frost-gray uppercase tracking-widest mb-4">Field Types</h3>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(fieldTypeIcons) as FormFieldType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => addField(type)}
                    className="flex items-center gap-3 w-full p-3.5 border border-white/[0.06] rounded-xl hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-all duration-150 text-sm font-medium text-frost-gray bg-white/[0.02]"
                  >
                    <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/10 text-indigo-400">
                      {fieldTypeIcons[type]}
                    </div>
                    <span className="capitalize">{type} Input</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.06]">
              <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/10">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">PRO TIP</p>
                <p className="text-xs text-frost-gray/70 font-medium leading-relaxed">
                  Set a unique &apos;Data Key&apos; for each field to map columns when uploading bulk CSV data.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortableFieldItem({ field, onUpdate, onDelete }: { field: FormField, onUpdate: (id: string, updates: Partial<FormField>) => void, onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`crystal-card p-6 flex items-start gap-5 group ${isDragging ? 'shadow-2xl ring-2 ring-indigo-500' : ''}`}
    >
      <div {...attributes} {...listeners} className="mt-2.5 cursor-grab opacity-20 hover:opacity-100 transition p-1 hover:bg-white/5 rounded-lg">
        <GripVertical className="w-5 h-5 text-frost-gray" strokeWidth={1.5} />
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-dim-steel mb-1 block px-1">Field Label</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate(field.id, { label: e.target.value })}
              className="w-full font-display font-semibold text-slate-white text-lg border-none focus:ring-0 p-0 bg-transparent outline-none"
              placeholder="Full Name"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/[0.06] text-dim-steel px-3 py-1.5 rounded-full border border-white/[0.06]">
              {fieldTypeIcons[field.type]}
              {field.type}
            </span>
            <button
              onClick={() => onDelete(field.id)}
              className="text-dim-steel hover:text-red-400 transition-colors duration-150 p-2 hover:bg-red-500/10 rounded-xl"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/[0.04]">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-dim-steel mb-1 block">Data Key (CSV Headers)</label>
            <input
              type="text"
              value={field.name}
              onChange={(e) => onUpdate(field.id, { name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              className="input-dark w-full text-xs font-mono font-semibold !text-indigo-400"
              placeholder="full_name"
            />
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-3 cursor-pointer group/check">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 border-2 border-white/[0.15] rounded-md peer-checked:bg-indigo-primary peer-checked:border-indigo-primary transition-all" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <span className="text-xs font-semibold text-dim-steel group-hover/check:text-frost-gray transition-colors">Required Field</span>
            </label>
          </div>
        </div>

        {field.type === 'select' && (
          <div className="mt-4 p-5 bg-indigo-500/[0.05] rounded-xl border border-indigo-500/10 space-y-3">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Dropdown Options</p>
            <div className="flex flex-wrap gap-2">
              {field.options?.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 rounded-xl">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...(field.options || [])];
                      newOpts[idx] = e.target.value;
                      onUpdate(field.id, { options: newOpts });
                    }}
                    className="text-xs font-semibold text-frost-gray bg-transparent border-none focus:ring-0 p-0 w-24 outline-none"
                  />
                  <button
                    onClick={() => {
                      const newOpts = [...(field.options || [])];
                      newOpts.splice(idx, 1);
                      onUpdate(field.id, { options: newOpts });
                    }}
                    className="text-dim-steel hover:text-red-400 rounded-full hover:bg-red-500/10 p-0.5 transition-colors duration-150"
                  >
                    <X className="w-3 h-3" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOpts = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                  onUpdate(field.id, { options: newOpts });
                }}
                className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-white/[0.03] border border-indigo-500/20 border-dashed px-3 py-1.5 rounded-xl hover:border-indigo-500/40 transition-all duration-150"
              >
                <Plus className="w-3 h-3" strokeWidth={1.5} />
                ADD OPTION
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
