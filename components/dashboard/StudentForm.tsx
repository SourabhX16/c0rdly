'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createStudent, updateStudent } from '@/actions/students';
import { upsertReportCard } from '@/actions/reports';
import { createClient } from '@/lib/supabase/client';
import { CLASS_OPTIONS, MEDIUM_OPTIONS, GRADE_OPTIONS, CO_SCHOLASTIC_AREAS, PERSONAL_QUALITIES_LIST, DEFAULT_SUBJECTS_BY_CLASS } from '@/lib/utils';
import { ACADEMIC_SESSIONS, DEFAULT_SESSION } from '@/lib/constants';
import type { Student, ReportCard, SubjectMarks, CoScholasticEntry, PersonalQuality } from '@/types/database';
import { ArrowLeft, ArrowRight, Save, Loader2, Plus, Trash2, Upload, Camera } from 'lucide-react';

interface Props {
  schoolId: string;
  student?: Student;
  reportCard?: ReportCard | null;
}

const STEPS = ['Profile Info', 'Scholastic Data', 'Co-Scholastic & Qualities', 'Attendance & Remarks'];

export default function StudentForm({ schoolId, student, reportCard }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const isEdit = Boolean(student);

  // Step 1 - Profile
  const [name, setName] = useState(student?.name || '');
  const [scholarNo, setScholarNo] = useState(student?.scholar_no || '');
  const [rollNo, setRollNo] = useState(student?.roll_no || '');
  const [sssmId, setSssmId] = useState(student?.sssm_id || '');
  const [familyId, setFamilyId] = useState(student?.family_id || '');
  const [aadharNo, setAadharNo] = useState(student?.aadhar_no || '');
  const [dob, setDob] = useState(student?.dob || '');
  const [cls, setCls] = useState(student?.class || '5');
  const [section, setSection] = useState(student?.section || '');
  const [medium, setMedium] = useState(student?.medium || 'Hindi');
  const [fatherName, setFatherName] = useState(student?.father_name || '');
  const [motherName, setMotherName] = useState(student?.mother_name || '');
  const [photoUrl, setPhotoUrl] = useState(student?.photo_url || '');

  // Step 2 - Scholastic
  const [session, setSession] = useState(reportCard?.session || DEFAULT_SESSION);
  const [subjects, setSubjects] = useState<SubjectMarks[]>(() => {
    if (reportCard?.scholastic_data) return reportCard.scholastic_data as SubjectMarks[];
    return (DEFAULT_SUBJECTS_BY_CLASS[cls] || DEFAULT_SUBJECTS_BY_CLASS['5']).map((s) => ({
      subject: s, monthly_test: null, half_yearly: null, project: null, annual: null, total: null, grade: null,
    }));
  });

  // Step 3 - Co-scholastic & Qualities
  const [coScholastic, setCoScholastic] = useState<CoScholasticEntry[]>(() => {
    if (reportCard?.co_scholastic_data) return reportCard.co_scholastic_data as CoScholasticEntry[];
    return CO_SCHOLASTIC_AREAS.map((a) => ({ area: a, grade: 'B' }));
  });
  const [qualities, setQualities] = useState<PersonalQuality[]>(() => {
    if (reportCard?.personal_qualities) return reportCard.personal_qualities as PersonalQuality[];
    return PERSONAL_QUALITIES_LIST.map((q) => ({ quality: q, grade: 'B' }));
  });

  // Step 4 - Attendance & Remarks
  const [totalDays, setTotalDays] = useState(reportCard?.attendance?.total_days || 220);
  const [presentDays, setPresentDays] = useState(reportCard?.attendance?.present_days || 200);
  const [remarks, setRemarks] = useState(reportCard?.teacher_remarks || '');
  const [promotedTo, setPromotedTo] = useState(reportCard?.promoted_to || '');

  // When class changes, reset subjects
  const handleClassChange = (newClass: string) => {
    setCls(newClass);
    setSubjects((DEFAULT_SUBJECTS_BY_CLASS[newClass] || []).map((s) => ({
      subject: s, monthly_test: null, half_yearly: null, project: null, annual: null, total: null, grade: null,
    })));
  };

  const addSubject = () => {
    setSubjects([...subjects, { subject: '', monthly_test: null, half_yearly: null, project: null, annual: null, total: null, grade: null }]);
  };

  const removeSubject = (idx: number) => {
    setSubjects(subjects.filter((_, i) => i !== idx));
  };

  const updateSubjectField = (idx: number, field: keyof SubjectMarks, value: string | number | null) => {
    setSubjects(subjects.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 1 * 1024 * 1024) { setError('Photo must be under 1MB'); return; }

    setPhotoUploading(true);
    setError('');
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `photos/${schoolId}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('school-assets').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('school-assets').getPublicUrl(filePath);
      setPhotoUrl(urlData.publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    // Client-side validation
    if (!name.trim()) { setError('Student name is required'); setLoading(false); setStep(0); return; }
    if (!scholarNo.trim()) { setError('Scholar number is required'); setLoading(false); setStep(0); return; }
    if (!dob) { setError('Date of birth is required'); setLoading(false); setStep(0); return; }
    if (!fatherName.trim()) { setError('Father name is required'); setLoading(false); setStep(0); return; }
    if (!motherName.trim()) { setError('Mother name is required'); setLoading(false); setStep(0); return; }

    try {
      let studentId = student?.id;
      const profileData = {
        name: name.trim(), scholar_no: scholarNo.trim(), roll_no: rollNo.trim(),
        sssm_id: sssmId.trim() || undefined,
        family_id: familyId.trim() || undefined, aadhar_no: aadharNo.trim() || undefined,
        dob, class: cls, section: section.trim() || undefined, medium,
        father_name: fatherName.trim(), mother_name: motherName.trim(),
        photo_url: photoUrl || undefined,
      };

      if (isEdit && studentId) {
        await updateStudent(studentId, profileData);
      } else {
        const created = await createStudent(schoolId, profileData);
        studentId = created.id;
      }

      // Safe attendance percentage (guard against zero total days)
      const safeTotalDays = totalDays > 0 ? totalDays : 1;
      const safePresentDays = Math.min(presentDays, safeTotalDays);

      // Save report card
      await upsertReportCard(studentId!, schoolId, {
        session,
        scholastic_data: subjects,
        co_scholastic_data: coScholastic,
        personal_qualities: qualities,
        attendance: { total_days: safeTotalDays, present_days: safePresentDays, percentage: Math.round((safePresentDays / safeTotalDays) * 100) },
        teacher_remarks: remarks.trim() || undefined,
        promoted_to: promotedTo || undefined,
      });

      router.push('/dashboard/students');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20';
  const labelCls = 'mb-1 block text-sm font-medium text-surface-700';

  return (
    <div className="animate-fade-in space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              i === step ? 'bg-primary-600 text-white shadow-sm' :
              i < step ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-surface-500'
            }`}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
              {i + 1}
            </span>
            <span className="hidden sm:inline">{s}</span>
          </button>
        ))}
      </div>

      {error && <div className="rounded-lg bg-danger-500/10 px-4 py-3 text-sm text-danger-600">{error}</div>}

      <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
        {/* Step 1: Profile */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-surface-900">Student Profile</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Photo Upload */}
              <div className="sm:col-span-2 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-surface-300 bg-surface-50 flex-shrink-0">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl} alt="Student" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-6 w-6 text-surface-300" />
                  )}
                </div>
                <div>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-2 text-xs font-medium text-surface-600 transition-all hover:border-primary-300 hover:bg-primary-50/50">
                    {photoUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {photoUrl ? 'Change Photo' : 'Upload Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={photoUploading} />
                  </label>
                  <p className="mt-1 text-[10px] text-surface-400">Optional. Max 1MB.</p>
                </div>
              </div>

              <div><label className={labelCls}>Full Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required /></div>
              <div><label className={labelCls}>Scholar No *</label>
                <input type="text" value={scholarNo} onChange={(e) => setScholarNo(e.target.value)} className={inputCls} required /></div>
              <div><label className={labelCls}>Roll No *</label>
                <input type="text" value={rollNo} onChange={(e) => setRollNo(e.target.value)} className={inputCls} required /></div>
              <div><label className={labelCls}>Date of Birth *</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputCls} required /></div>
              <div><label className={labelCls}>Class *</label>
                <select value={cls} onChange={(e) => handleClassChange(e.target.value)} className={inputCls}>
                  {CLASS_OPTIONS.map((c) => <option key={c} value={c}>Class {c}</option>)}
                </select></div>
              <div><label className={labelCls}>Section</label>
                <input type="text" value={section} onChange={(e) => setSection(e.target.value)} className={inputCls} placeholder="A / B" /></div>
              <div><label className={labelCls}>Medium *</label>
                <select value={medium} onChange={(e) => setMedium(e.target.value)} className={inputCls}>
                  {MEDIUM_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select></div>
              <div><label className={labelCls}>SSSM ID</label>
                <input type="text" value={sssmId} onChange={(e) => setSssmId(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Family ID</label>
                <input type="text" value={familyId} onChange={(e) => setFamilyId(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Aadhar No</label>
                <input type="text" value={aadharNo} onChange={(e) => setAadharNo(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Father Name *</label>
                <input type="text" value={fatherName} onChange={(e) => setFatherName(e.target.value)} className={inputCls} required /></div>
              <div><label className={labelCls}>Mother Name *</label>
                <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} className={inputCls} required /></div>
            </div>
          </div>
        )}

        {/* Step 2: Scholastic Data */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">Scholastic Data</h2>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-surface-600">Session:</label>
                <select value={session} onChange={(e) => setSession(e.target.value)}
                  className="rounded-lg border border-surface-200 px-3 py-1.5 text-sm">
                  {ACADEMIC_SESSIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50">
                    <th className="px-3 py-2 text-left font-semibold text-surface-600">Subject</th>
                    <th className="px-3 py-2 text-center font-semibold text-surface-600">Monthly Test</th>
                    <th className="px-3 py-2 text-center font-semibold text-surface-600">Half Yearly</th>
                    <th className="px-3 py-2 text-center font-semibold text-surface-600">Project</th>
                    <th className="px-3 py-2 text-center font-semibold text-surface-600">Annual</th>
                    <th className="px-3 py-2 text-center font-semibold text-surface-600">Total</th>
                    <th className="px-3 py-2 text-center font-semibold text-surface-600">Grade</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {subjects.map((sub, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">
                        <input type="text" value={sub.subject} onChange={(e) => updateSubjectField(idx, 'subject', e.target.value)}
                          className="rounded-lg border border-surface-200 px-2 py-1.5 text-sm w-full" />
                      </td>
                      {(['monthly_test', 'half_yearly', 'project', 'annual'] as const).map((f) => (
                        <td key={f} className="px-3 py-2">
                          <input type="number" value={sub[f] ?? ''} onChange={(e) => updateSubjectField(idx, f, e.target.value ? Number(e.target.value) : null)}
                            className="w-16 rounded-lg border border-surface-200 px-2 py-1.5 text-center text-sm" min={0} max={100} />
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        <input type="number" value={sub.total ?? ''} onChange={(e) => updateSubjectField(idx, 'total', e.target.value ? Number(e.target.value) : null)}
                          className="w-16 rounded-lg border border-surface-200 px-2 py-1.5 text-center text-sm bg-surface-50" />
                      </td>
                      <td className="px-3 py-2">
                        <select value={sub.grade || ''} onChange={(e) => updateSubjectField(idx, 'grade', e.target.value || null)}
                          className="rounded-lg border border-surface-200 px-2 py-1.5 text-sm">
                          <option value="">—</option>
                          {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </td>
                      <td className="px-1 py-2">
                        <button onClick={() => removeSubject(idx)} className="rounded-lg p-1 text-surface-400 hover:text-danger-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addSubject}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-surface-300 px-3 py-2 text-sm text-surface-500 transition-colors hover:border-primary-400 hover:text-primary-600">
              <Plus className="h-3.5 w-3.5" /> Add Subject
            </button>
          </div>
        )}

        {/* Step 3: Co-Scholastic & Personal Qualities */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-surface-900">Co-Scholastic Areas</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {coScholastic.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-surface-200 px-4 py-3">
                    <span className="text-sm text-surface-700">{item.area}</span>
                    <div className="flex gap-1">
                      {GRADE_OPTIONS.slice(0, 5).map((g) => (
                        <button key={g} onClick={() => setCoScholastic(coScholastic.map((c, i) => i === idx ? { ...c, grade: g } : c))}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                            item.grade === g ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                          }`}>{g}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-surface-900">Personal Qualities</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {qualities.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-surface-200 px-4 py-3">
                    <span className="text-sm text-surface-700">{item.quality}</span>
                    <div className="flex gap-1">
                      {GRADE_OPTIONS.slice(0, 5).map((g) => (
                        <button key={g} onClick={() => setQualities(qualities.map((q, i) => i === idx ? { ...q, grade: g } : q))}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                            item.grade === g ? 'bg-accent-500 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                          }`}>{g}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Attendance & Remarks */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-surface-900">Attendance & Final Details</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className={labelCls}>Total Working Days</label>
                <input type="number" value={totalDays} onChange={(e) => setTotalDays(Number(e.target.value))} className={inputCls} /></div>
              <div><label className={labelCls}>Days Present</label>
                <input type="number" value={presentDays} onChange={(e) => setPresentDays(Number(e.target.value))} className={inputCls} /></div>
              <div><label className={labelCls}>Attendance %</label>
                <div className="flex h-[42px] items-center rounded-xl border border-surface-200 bg-surface-50 px-4 text-sm font-semibold text-primary-600">
                  {totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0}%
                </div></div>
            </div>
            <div><label className={labelCls}>Promoted To</label>
              <select value={promotedTo} onChange={(e) => setPromotedTo(e.target.value)} className={inputCls}>
                <option value="">Select</option>
                {CLASS_OPTIONS.map((c) => <option key={c} value={`Class ${c}`}>Class {c}</option>)}
              </select></div>
            <div><label className={labelCls}>Teacher Remarks</label>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3}
                className={inputCls} placeholder="e.g. Good performance. Keep it up!" /></div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          className="flex items-center gap-1 rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 disabled:opacity-40">
          <ArrowLeft className="h-4 w-4" /> Previous
        </button>

        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(step + 1)}
            className="flex items-center gap-1 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700">
            Next <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={handleSave} disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-600 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? 'Update' : 'Save'} Student
          </button>
        )}
      </div>
    </div>
  );
}
