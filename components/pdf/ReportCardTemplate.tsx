'use client';

import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { Student, ReportCard, SubjectMarks, CoScholasticEntry, PersonalQuality } from '@/types/database';

const s = StyleSheet.create({
  page: { padding: 24, fontFamily: 'Helvetica', fontSize: 8, lineHeight: 1.3 },
  header: { textAlign: 'center', marginBottom: 8, borderBottom: '2pt solid #1e40af', paddingBottom: 6 },
  schoolName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#1e40af', marginBottom: 2 },
  session: { fontSize: 9, color: '#475569', marginTop: 2 },
  title: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 4, color: '#1e3a8a' },
  logo: { width: 48, height: 48, objectFit: 'contain' as const },
  headerRow: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 10 },
  headerTextBlock: { textAlign: 'center' as const },
  studentPhoto: { width: 50, height: 60, objectFit: 'cover' as const, borderRadius: 2, border: '0.5pt solid #cbd5e1' },
  infoWithPhoto: { flexDirection: 'row' as const, gap: 8, marginBottom: 8 },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8, border: '1pt solid #cbd5e1', borderRadius: 2 },
  infoCell: { width: '50%', flexDirection: 'row', padding: 4, borderBottom: '0.5pt solid #e2e8f0' },
  infoLabel: { fontFamily: 'Helvetica-Bold', color: '#475569', width: 80 },
  infoValue: { flex: 1, color: '#0f172a' },

  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1e40af', marginBottom: 4, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  table: { border: '1pt solid #94a3b8', borderRadius: 2 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1e40af', borderRadius: '2 2 0 0' },
  tableHeaderCell: { padding: 4, fontFamily: 'Helvetica-Bold', color: '#ffffff', textAlign: 'center', fontSize: 7 },
  tableRow: { flexDirection: 'row', borderBottom: '0.5pt solid #e2e8f0' },
  tableRowAlt: { flexDirection: 'row', borderBottom: '0.5pt solid #e2e8f0', backgroundColor: '#f8fafc' },
  tableCell: { padding: 4, textAlign: 'center', fontSize: 7.5 },
  tableCellLeft: { padding: 4, textAlign: 'left', fontSize: 7.5 },
  totalRow: { flexDirection: 'row', backgroundColor: '#dbeafe', borderTop: '1pt solid #93c5fd' },
  totalCell: { padding: 4, textAlign: 'center', fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#1e3a8a' },

  twoColumn: { flexDirection: 'row', gap: 12, marginTop: 8 },
  column: { flex: 1 },

  miniTable: { border: '1pt solid #cbd5e1', borderRadius: 2 },
  miniHeader: { flexDirection: 'row', backgroundColor: '#e2e8f0', padding: 3 },
  miniHeaderCell: { fontFamily: 'Helvetica-Bold', color: '#334155', fontSize: 7, textAlign: 'center' },
  miniRow: { flexDirection: 'row', padding: 3, borderBottom: '0.5pt solid #f1f5f9' },
  miniCell: { fontSize: 7.5, textAlign: 'center' },
  miniCellLeft: { fontSize: 7.5, textAlign: 'left' },

  attendance: { flexDirection: 'row', marginTop: 10, border: '1pt solid #cbd5e1', borderRadius: 2, padding: 6 },
  attendanceItem: { flex: 1, textAlign: 'center' },
  attendanceLabel: { fontSize: 7, color: '#64748b', marginBottom: 2 },
  attendanceValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0f172a' },

  remarks: { marginTop: 8, padding: 6, border: '1pt solid #cbd5e1', borderRadius: 2, backgroundColor: '#f8fafc' },
  remarksLabel: { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: '#475569', marginBottom: 2 },
  remarksText: { fontSize: 8, color: '#0f172a' },

  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 8, borderTop: '1pt solid #cbd5e1' },
  sigBlock: { textAlign: 'center', width: '30%' },
  sigLine: { borderBottom: '1pt solid #94a3b8', marginBottom: 3, height: 20 },
  sigLabel: { fontSize: 7, color: '#64748b' },

  promoted: { textAlign: 'center', marginTop: 8, padding: 5, backgroundColor: '#dcfce7', borderRadius: 2 },
  promotedText: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#166534' },
});

interface Props {
  student: Student;
  report: ReportCard;
  schoolName: string;
  logoUrl?: string;
}

export default function ReportCardTemplate({ student, report, schoolName, logoUrl }: Props) {
  const scholastic = (Array.isArray(report.scholastic_data) ? report.scholastic_data : []) as SubjectMarks[];
  const coScholastic = (Array.isArray(report.co_scholastic_data) ? report.co_scholastic_data : []) as CoScholasticEntry[];
  const qualities = (Array.isArray(report.personal_qualities) ? report.personal_qualities : []) as PersonalQuality[];
  const attendance = (report.attendance && typeof report.attendance === 'object' ? report.attendance : null) as { total_days: number; present_days: number; percentage: number } | null;

  const grandTotal = scholastic.reduce((sum, sub) => sum + (sub.total || 0), 0);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerRow}>
            {logoUrl && <Image src={logoUrl} style={s.logo} />}
            <View style={s.headerTextBlock}>
              <Text style={s.schoolName}>{schoolName || 'School Name'}</Text>
              <Text style={s.session}>Academic Session: {report.session}</Text>
              <Text style={s.title}>PROGRESS REPORT</Text>
            </View>
          </View>
        </View>

        {/* Student Info */}
        <View style={s.infoWithPhoto}>
          <View style={[s.infoGrid, { flex: 1 }]}>
            {[
              { l: 'Student Name', v: student.name },
              { l: 'Scholar No', v: student.scholar_no },
              { l: 'Father Name', v: student.father_name },
              { l: 'Roll No', v: student.roll_no },
              { l: 'Mother Name', v: student.mother_name },
              { l: 'Class', v: `${student.class} ${student.section || ''}`.trim() },
              { l: 'DOB', v: student.dob },
              { l: 'Medium', v: student.medium },
              { l: 'SSSM ID', v: student.sssm_id || '—' },
              { l: 'Family ID', v: student.family_id || '—' },
              { l: 'Aadhar No', v: student.aadhar_no || '—' },
            ].map((item, i) => (
              <View key={i} style={s.infoCell}>
                <Text style={s.infoLabel}>{item.l}:</Text>
                <Text style={s.infoValue}>{item.v}</Text>
              </View>
            ))}
          </View>
          {student.photo_url && (
            <Image src={student.photo_url} style={s.studentPhoto} />
          )}
        </View>

        {/* Scholastic Table */}
        <Text style={s.sectionTitle}>Scholastic Record</Text>
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '25%', textAlign: 'left' }]}>Subject</Text>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>Monthly Test</Text>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>Half Yearly</Text>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>Project</Text>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>Annual</Text>
            <Text style={[s.tableHeaderCell, { width: '8%' }]}>Total</Text>
            <Text style={[s.tableHeaderCell, { width: '7%' }]}>Grade</Text>
          </View>
          {scholastic.map((sub, i) => (
            <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <Text style={[s.tableCellLeft, { width: '25%' }]}>{sub.subject}</Text>
              <Text style={[s.tableCell, { width: '15%' }]}>{sub.monthly_test ?? '—'}</Text>
              <Text style={[s.tableCell, { width: '15%' }]}>{sub.half_yearly ?? '—'}</Text>
              <Text style={[s.tableCell, { width: '15%' }]}>{sub.project ?? '—'}</Text>
              <Text style={[s.tableCell, { width: '15%' }]}>{sub.annual ?? '—'}</Text>
              <Text style={[s.tableCell, { width: '8%', fontFamily: 'Helvetica-Bold' }]}>{sub.total ?? '—'}</Text>
              <Text style={[s.tableCell, { width: '7%', fontFamily: 'Helvetica-Bold', color: '#1e40af' }]}>{sub.grade || '—'}</Text>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={[s.totalCell, { width: '85%', textAlign: 'right' }]}>Grand Total</Text>
            <Text style={[s.totalCell, { width: '8%' }]}>{grandTotal}</Text>
            <Text style={[s.totalCell, { width: '7%' }]}></Text>
          </View>
        </View>

        {/* Two-column: Co-Scholastic + Personal Qualities */}
        <View style={s.twoColumn}>
          <View style={s.column}>
            <Text style={s.sectionTitle}>Co-Scholastic Areas</Text>
            <View style={s.miniTable}>
              <View style={s.miniHeader}>
                <Text style={[s.miniHeaderCell, { width: '75%', textAlign: 'left' }]}>Area</Text>
                <Text style={[s.miniHeaderCell, { width: '25%' }]}>Grade</Text>
              </View>
              {coScholastic.map((item, i) => (
                <View key={i} style={s.miniRow}>
                  <Text style={[s.miniCellLeft, { width: '75%' }]}>{item.area}</Text>
                  <Text style={[s.miniCell, { width: '25%', fontFamily: 'Helvetica-Bold' }]}>{item.grade}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.column}>
            <Text style={s.sectionTitle}>Personal Qualities</Text>
            <View style={s.miniTable}>
              <View style={s.miniHeader}>
                <Text style={[s.miniHeaderCell, { width: '75%', textAlign: 'left' }]}>Quality</Text>
                <Text style={[s.miniHeaderCell, { width: '25%' }]}>Grade</Text>
              </View>
              {qualities.map((item, i) => (
                <View key={i} style={s.miniRow}>
                  <Text style={[s.miniCellLeft, { width: '75%' }]}>{item.quality}</Text>
                  <Text style={[s.miniCell, { width: '25%', fontFamily: 'Helvetica-Bold' }]}>{item.grade}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Attendance */}
        {attendance && (
          <View style={s.attendance}>
            <View style={s.attendanceItem}>
              <Text style={s.attendanceLabel}>Total Working Days</Text>
              <Text style={s.attendanceValue}>{attendance.total_days}</Text>
            </View>
            <View style={s.attendanceItem}>
              <Text style={s.attendanceLabel}>Days Present</Text>
              <Text style={s.attendanceValue}>{attendance.present_days}</Text>
            </View>
            <View style={s.attendanceItem}>
              <Text style={s.attendanceLabel}>Attendance %</Text>
              <Text style={s.attendanceValue}>{attendance.percentage}%</Text>
            </View>
          </View>
        )}

        {/* Remarks */}
        {report.teacher_remarks && (
          <View style={s.remarks}>
            <Text style={s.remarksLabel}>Teacher Remarks</Text>
            <Text style={s.remarksText}>{report.teacher_remarks}</Text>
          </View>
        )}

        {/* Promoted */}
        {report.promoted_to && (
          <View style={s.promoted}>
            <Text style={s.promotedText}>Promoted to: {report.promoted_to}</Text>
          </View>
        )}

        {/* Footer - Signatures */}
        <View style={s.footer}>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Class Teacher</Text>
          </View>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Parent/Guardian</Text>
          </View>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Principal</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
