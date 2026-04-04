import FormBuilder from '@/components/admin/FormBuilder';

export default function NewFormPage() {
  return (
    <div className="max-w-[1280px] mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-white tracking-tight">Create New Form</h1>
        <p className="text-sm text-frost-gray mt-1.5">Design your form schema with custom fields.</p>
      </div>
      <FormBuilder />
    </div>
  );
}
