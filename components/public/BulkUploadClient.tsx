'use client';

import { useState, useRef } from 'react';
import { Form, FormField } from '@/types/database';
import { submitBulkFormResponsesAction } from '@/app/actions/form';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { UploadCloud, FileSpreadsheet, ArrowLeft, Check, AlertCircle, Download } from 'lucide-react';
import levenshtein from 'fast-levenshtein';
import { validateRowData } from '@/lib/validation';

export default function BulkUploadClient({ 
  form, 
  orgName, 
  onCancel, 
  onSuccess 
}: { 
  form: Form, 
  orgName: string, 
  onCancel: () => void,
  onSuccess: () => void
}) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);
  
  // Mapping: form.field.id -> csv/xlsx header name
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [showMapping, setShowMapping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ row: number, field: string, message: string }[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setError(null);

    const isCSV = uploadedFile.name.endsWith('.csv');
    const isExcel = uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls');

    if (isCSV) {
      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.meta.fields) {
            setupMapping(results.meta.fields, results.data);
          } else {
            setError("Could not read headers from the CSV file.");
          }
        },
        error: (err) => {
          setError("Failed to parse CSV: " + err.message);
        }
      });
    } else if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data: any[] = XLSX.utils.sheet_to_json(ws);
          
          if (data.length > 0) {
            const headers = Object.keys(data[0]);
            setupMapping(headers, data);
          } else {
            setError("The Excel sheet is empty.");
          }
        } catch (err: any) {
          setError("Failed to parse Excel file: " + err.message);
        }
      };
      reader.readAsBinaryString(uploadedFile);
    } else {
      setError("Unsupported file format. Please upload a .csv or .xlsx file.");
    }
  };

  const downloadTemplate = () => {
    const headers = form.fields.map(f => f.label);
    const csv = Papa.unparse([headers]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const setupMapping = (headers: string[], data: any[]) => {
    setParsedHeaders(headers);
    setParsedData(data);

    // Try auto-mapping exactly by label or name, with fuzzy fallback
    const initialMapping: Record<string, string> = {};
    let allMapped = true;

    form.fields.forEach(field => {
      // 1. Exact match by label
      let match = headers.find(h => h.toLowerCase().trim() === field.label.toLowerCase().trim());
      
      // 2. Exact match by name (data key)
      if (!match) {
        match = headers.find(h => h.toLowerCase().trim() === field.name.toLowerCase().trim());
      }

      // 3. Fuzzy match fallback
      if (!match) {
        let bestMatch = '';
        let minDistance = Infinity;
        
        headers.forEach(header => {
          const distLabel = levenshtein.get(field.label.toLowerCase(), header.toLowerCase());
          const distName = levenshtein.get(field.name.toLowerCase(), header.toLowerCase());
          const distance = Math.min(distLabel, distName);
          
          if (distance < minDistance && distance <= 2) { // Allow up to 2 character difference
            minDistance = distance;
            bestMatch = header;
          }
        });

        if (bestMatch) match = bestMatch;
      }

      if (match) {
        initialMapping[field.id] = match;
      } else if (field.required) {
        allMapped = false;
      }
    });

    setMapping(initialMapping);
    setShowMapping(true);
  };

  const handleSubmit = async (validRowsOnly = false) => {
    if (parsedData.length === 0) return;

    // Validate required mappings
    const missingRequired = form.fields.filter(f => f.required && !mapping[f.id]);
    if (missingRequired.length > 0) {
      setError(`Please map the required field(s): ${missingRequired.map(f => f.label).join(', ')}`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setValidationErrors(null);

      // Transform raw data into the final format expected by DB
      const formattedRows = parsedData.map((row, index) => {
        const newRow: Record<string, any> = {};
        form.fields.forEach(field => {
          const mappedHeader = mapping[field.id];
          if (mappedHeader && row[mappedHeader] !== undefined) {
            newRow[field.id] = row[mappedHeader];
          } else {
            newRow[field.id] = null;
          }
        });
        return { row: newRow, index };
      });

      // Validate each row
      const allErrors: { row: number, field: string, message: string }[] = [];
      const validRows: Record<string, any>[] = [];

      for (const { row, index } of formattedRows) {
        const result = validateRowData(row, form.fields);
        if (!result.success) {
          for (const err of result.error.issues) {
            allErrors.push({
              row: index + 1,
              field: err.path[0] as string,
              message: err.message,
            });
          }
        } else {
          validRows.push(row);
        }
      }

      if (allErrors.length > 0 && !validRowsOnly) {
        setValidationErrors(allErrors);
        setIsSubmitting(false);
        return;
      }

      const rowsToSubmit = validRowsOnly ? validRows : formattedRows.map(r => r.row);

      if (rowsToSubmit.length === 0) {
        setError('No valid rows to submit. Please fix the errors and try again.');
        setIsSubmitting(false);
        return;
      }

      // Submit via Server Action
      await submitBulkFormResponsesAction(form.id, orgName, rowsToSubmit);
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Bulk Upload</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition"
          >
            <Download className="w-4 h-4" />
            Download CSV Template
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileUpload}
          />
          <UploadCloud className="w-12 h-12 text-gray-400 group-hover:text-blue-500 mx-auto mb-4 transition-colors" />
          <p className="text-lg font-medium text-gray-900">Click or drag file to this area to upload</p>
          <p className="text-sm text-gray-500 mt-2">Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files.</p>
        </div>
      ) : showMapping ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">{file.name}</p>
                <p className="text-sm text-blue-700">{parsedData.length} records found</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setFile(null);
                setShowMapping(false);
                setParsedData([]);
              }} 
              className="text-sm text-blue-600 hover:underline"
            >
              Replace File
            </button>
          </div>

          <div className="bg-white border text-sm border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 className="font-semibold text-gray-800">Map Columns</h4>
              <p className="text-gray-500 text-xs mt-1">Match your uploaded file columns to the system fields.</p>
            </div>
            
            <div className="divide-y divide-gray-100">
              {form.fields.map(field => {
                const isMapped = !!mapping[field.id];
                return (
                  <div key={field.id} className="grid grid-cols-2 p-4 items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isMapped ? 'bg-green-500' : field.required ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                      <span className="font-medium text-gray-700">{field.label}</span>
                      {field.required && <span className="text-red-500 text-xs">*</span>}
                    </div>
                    <div>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={mapping[field.id] || ""}
                        onChange={(e) => setMapping({...mapping, [field.id]: e.target.value})}
                      >
                        <option value="">-- Do not map --</option>
                        {parsedHeaders.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {validationErrors && (
            <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
              <div className="bg-red-100 px-4 py-3 border-b border-red-200">
                <h4 className="font-semibold text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Validation Errors ({validationErrors.length} issues)
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-red-700">Row</th>
                      <th className="text-left px-4 py-2 font-medium text-red-700">Field</th>
                      <th className="text-left px-4 py-2 font-medium text-red-700">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100">
                    {validationErrors.map((err, i) => (
                      <tr key={i} className="text-red-700">
                        <td className="px-4 py-2">Row {err.row}</td>
                        <td className="px-4 py-2">{err.field}</td>
                        <td className="px-4 py-2">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {validationErrors && (
            <button 
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-sm transition"
            >
              <Check className="w-5 h-5" />
              Submit Valid Rows Only
            </button>
          )}

          <button 
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-sm transition"
          >
            {isSubmitting ? 'Importing...' : (
              <>
                <Check className="w-5 h-5" />
                Finish Import
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
