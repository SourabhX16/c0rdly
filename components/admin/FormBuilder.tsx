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
  text: <Type className="w-4 h-4" />,
  number: <Hash className="w-4 h-4" />,
  select: <ListMinus className="w-4 h-4" />,
  date: <Calendar className="w-4 h-4" />,
  file: <FileType className="w-4 h-4" />
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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm sticky top-[72px] z-40 backdrop-blur-md bg-white/80">
        <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Form' : 'Create New Form'}</h2>
        <div className="flex gap-3">
           <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isPreview ? 'Edit Mode' : 'Preview'}
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition group"
          >
            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {isSaving ? "Saving..." : "Save Form"}
          </button>
        </div>
      </div>

      {isPreview ? (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 max-w-3xl mx-auto animate-fade-in">
          <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-3xl font-black text-slate-900 mb-2">{title || 'Untitled Form'}</h3>
            <p className="text-slate-500">{description || 'No description provided.'}</p>
          </div>
          <div className="space-y-6">
            {fields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select className="block w-full border-slate-200 rounded-xl shadow-sm p-3 border focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm outline-none">
                    <option value="">Select an option...</option>
                    {field.options?.map((opt: string) => <option key={opt}>{opt}</option>)}
                  </select>
                ) : field.type === 'file' ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                    <FileType className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Click to upload or drag & drop</p>
                  </div>
                ) : (
                  <input 
                    type={field.type === 'number' ? 'number' : 'text'} 
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className="block w-full border-slate-200 rounded-xl shadow-sm p-3 border focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm outline-none" 
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-3 space-y-6">
            {/* Form Metadata */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 px-1">Form Title</label>
                <input
                  type="text"
                  placeholder="e.g. Student Registration Form 2024"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-3xl font-black text-gray-900 placeholder:text-gray-200 border-none focus:ring-0 p-0 bg-transparent tracking-tight"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Description</label>
                <textarea
                  placeholder="Explain what this form is for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-slate-500 placeholder:text-slate-300 border-none focus:ring-0 p-0 resize-none h-16 bg-transparent text-sm leading-relaxed"
                />
              </div>
            </div>

            {/* Form Fields Canvas */}
            <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-200 shadow-inner min-h-[500px]">
              {fields.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-32">
                  <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 border border-slate-100">
                    <Plus className="w-8 h-8 text-indigo-400" />
                  </div>
                  <p className="font-bold text-slate-500">Your canvas is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Select field types from the right sidebar to start building</p>
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
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm sticky top-[72px] space-y-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Field Types</h3>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(fieldTypeIcons) as FormFieldType[]).map((type) => (
                  <button 
                    key={type}
                    onClick={() => addField(type)} 
                    className="flex items-center gap-3 w-full p-4 border border-slate-100 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50 transition-all text-sm font-bold text-slate-700 bg-slate-50/50"
                  >
                    <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm text-indigo-600">
                      {fieldTypeIcons[type]}
                    </div>
                    <span className="capitalize">{type} Input</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
               <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider mb-1">PRO TIP</p>
                  <p className="text-xs text-indigo-900/70 font-medium leading-relaxed">
                    Set a unique 'Data Key' for each field to map columns when uploading bulk CSV data.
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortableFieldItem({ field, onUpdate, onDelete }: { field: FormField, onUpdate: any, onDelete: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-5 group transition-shadow hover:shadow-md ${isDragging ? 'shadow-2xl ring-2 ring-indigo-500' : ''}`}>
      <div {...attributes} {...listeners} className="mt-2.5 cursor-grab opacity-20 hover:opacity-100 transition p-1 hover:bg-slate-50 rounded-lg">
        <GripVertical className="w-5 h-5 text-slate-600" />
      </div>
      
      <div className="flex-1 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
             <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block px-1">Field Label</label>
             <input 
              type="text" 
              value={field.label} 
              onChange={(e) => onUpdate(field.id, { label: e.target.value })}
              className="w-full font-bold text-slate-900 border-none focus:ring-0 p-0 text-lg bg-transparent"
              placeholder="Full Name"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full border border-slate-200">
              {fieldTypeIcons[field.type]}
              {field.type}
            </span>
            <button 
              onClick={() => onDelete(field.id)} 
              className="text-slate-300 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-xl"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Data Key (Used for CSV Headers)</label>
            <input 
              type="text" 
              value={field.name} 
              onChange={(e) => onUpdate(field.id, { name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              className="w-full text-xs font-mono font-bold text-indigo-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
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
                <div className="w-5 h-5 border-2 border-slate-200 rounded-md peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                   <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                   </svg>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-600 group-hover/check:text-slate-900 transition-colors">Required Field</span>
            </label>
          </div>
        </div>

        {field.type === 'select' && (
          <div className="mt-4 p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 space-y-3">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Dropdown Options</p>
            <div className="flex flex-wrap gap-2">
              {field.options?.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg shadow-sm">
                  <input 
                    type="text" 
                    value={opt} 
                    onChange={(e) => {
                      const newOpts = [...(field.options || [])];
                      newOpts[idx] = e.target.value;
                      onUpdate(field.id, { options: newOpts });
                    }}
                    className="text-xs font-bold text-slate-700 bg-transparent border-none focus:ring-0 p-0 w-24"
                  />
                  <button 
                    onClick={() => {
                      const newOpts = [...(field.options || [])];
                      newOpts.splice(idx, 1);
                      onUpdate(field.id, { options: newOpts });
                    }}
                    className="text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => {
                  const newOpts = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                  onUpdate(field.id, { options: newOpts });
                }}
                className="flex items-center gap-1 text-[10px] font-black text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 border-dashed px-3 py-1.5 rounded-lg hover:border-indigo-400 transition-all"
              >
                <Plus className="w-3 h-3" />
                ADD OPTION
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
