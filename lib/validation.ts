import { z } from 'zod';
import type { FormField } from '@/types/database';

export const FormFieldSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Field name is required'),
  type: z.enum(['text', 'number', 'select', 'date', 'file']),
  label: z.string().min(1, 'Label is required'),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

export const FormTemplateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  fields: z.array(FormFieldSchema).min(1, 'At least one field is required'),
});

export function createSubmissionSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny;
    switch (field.type) {
      case 'number':
        fieldSchema = z.coerce.number().refine(
          (val) => !isNaN(val),
          { message: `${field.label} must be a number` }
        );
        break;
      case 'select':
        fieldSchema = z.enum(field.options as [string, ...string[]]);
        break;
      case 'date':
        fieldSchema = z.iso.date();
        break;
      default:
        fieldSchema = z.string().min(1, `${field.label} is required`);
    }
    shape[field.name] = field.required ? fieldSchema : fieldSchema.optional();
  }
  return z.object(shape);
}

export const BulkUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (f) =>
        [
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ].includes(f.type),
      'Only CSV and Excel files are allowed'
    )
    .refine(
      (f) => f.size <= 10 * 1024 * 1024,
      'File size must be less than 10MB'
    ),
});

export const OrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(200),
  contact_email: z
    .string()
    .email()
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^\+?[\d\s()-]{7,15}$/)
    .optional()
    .or(z.literal('')),
  address: z.string().max(500).optional(),
});

export function validateRowData(
  rowData: Record<string, unknown>,
  fields: FormField[]
) {
  const schema = createSubmissionSchema(fields);
  return schema.safeParse(rowData);
}
