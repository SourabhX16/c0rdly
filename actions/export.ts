'use server';

import { createClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';

export async function exportSubmissionsWithImages(submissionIds: string[], outputDir: string = 'C:\\exports') {
  const supabase = await createClient();
  
  const { data: submissions, error } = await supabase
    .from('form_responses')
    .select('*')
    .in('id', submissionIds);

  if (error) throw new Error(error.message);

  // Create images folder
  const imagesDir = path.join(outputDir, 'images');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

  // Download images and update paths
  const processedData = await Promise.all(
    submissions.map(async (sub, index) => {
      const processedFields: any = { ...sub.data };
      
      for (const [key, value] of Object.entries(processedFields)) {
        if (typeof value === 'string' && value.startsWith('form-uploads/')) {
          const filename = `${sub.id}_${key}_${index}.${value.split('.').pop()}`;
          const localPath = path.join(imagesDir, filename);
          
          // Download image
          const { data: blob } = await supabase.storage
            .from('form-uploads')
            .download(value.replace('form-uploads/', ''));
          
          if (blob) {
            const buffer = Buffer.from(await blob.arrayBuffer());
            fs.writeFileSync(localPath, buffer);
            processedFields[key] = localPath; // Local path for CorelDRAW
          }
        }
      }
      
      return { ...sub, data: processedFields };
    })
  );

  // Generate CSV
  const headers = ['ID', 'Organization', 'Status', 'Created At', ...Object.keys(processedData[0]?.data || {})];
  const rows = processedData.map(sub => [
    sub.id,
    sub.org_name,
    sub.status,
    sub.created_at,
    ...Object.values(sub.data)
  ]);

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  
  // Save CSV
  const csvPath = path.join(outputDir, 'submissions.csv');
  fs.writeFileSync(csvPath, csv);
  
  return { csvPath, imagesDir, totalImages: processedData.length };
}
