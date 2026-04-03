import FormBuilder from '@/components/admin/FormBuilder';

export default function NewFormPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create New Form</h1>
        <p className="text-gray-500 mt-1">Design your form schema with custom fields.</p>
      </div>
      <FormBuilder />
    </div>
  );
}
