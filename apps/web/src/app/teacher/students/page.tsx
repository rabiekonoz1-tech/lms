'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { educationApi } from '../../../lib/education-api';
import { analyticsApi } from '../../../lib/analytics-api';
import type { Student, StudentAnalyticsSnapshot } from '../../../types';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Drawer } from '../../../components/ui/drawer';
import { Input } from '../../../components/ui/input';
import { UserIcon } from '../../../components/icons';

interface StudentProfile extends Student {
  analytics?: StudentAnalyticsSnapshot;
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const stList = await educationApi.getStudents().catch(() => []);
        
        // Fetch analytics for each student (in a real app, this should be a bulk API call)
        // For demonstration, we fetch them concurrently
        const profiles: StudentProfile[] = await Promise.all(
          stList.map(async (st) => {
             const snap = await analyticsApi.getStudentDashboard(st.id).catch(() => null);
             return { ...st, analytics: snap || undefined };
          })
        );
        
        setStudents(profiles);
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    const name = s.user?.name || '';
    const email = s.user?.email || '';
    const phone = s.user?.phone || '';

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery);

    const matchesGrade = gradeFilter === 'ALL' || s.grade_level === gradeFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserIcon size={24} className="text-turquoise" />
            شؤون الطلبة والتسجيل الأكاديمي (Student Directory)
          </h1>
          <p className="text-sm text-secondary mt-1">
            دليل الطلاب الأكاديمي، سجل الحضور، بيانات التواصل الموثقة، ومتابعة الأجهزة المصرح بها.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">إجمالي المقيدين: {students.length} طالب</Badge>
          <Badge variant="purple">نشط: {students.filter((s) => s.status === 'active').length}</Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-card/60 border-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="بحث بالاسم، كود الطالب، البريد، أو الجوال..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full rounded-[16px] border border-border bg-background px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-turquoise"
          >
            <option value="ALL">جميع الصفوف الدراسية</option>
            <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
            <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
            <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-[16px] border border-border bg-background px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-turquoise"
          >
            <option value="ALL">جميع الحالات الأكاديمية</option>
            <option value="active">منتظم (Active)</option>
            <option value="suspended">معلق / تنبيه (Suspended)</option>
          </select>
        </div>
      </Card>

      {/* Main Students Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">قائمة الطلاب المسجلين بالمنظومة</h2>
          <span className="text-xs text-secondary">انقر على أي طالب لعرض ملفه الأكاديمي المفصل</span>
        </div>

        {loading ? (
           <div className="text-center text-sm text-secondary py-12">جارٍ تحميل بيانات الطلاب...</div>
        ) : students.length === 0 ? (
           <div className="text-center text-sm text-secondary py-12">لا يوجد طلاب مسجلين حالياً.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-border text-secondary">
                <tr>
                  <th className="pb-3 px-3">كود الطالب</th>
                  <th className="pb-3 px-3">الاسم الكامل</th>
                  <th className="pb-3 px-3">الصف الدراسي</th>
                  <th className="pb-3 px-3">نسبة الحضور</th>
                  <th className="pb-3 px-3">المعدل العام</th>
                  <th className="pb-3 px-3">الحالة</th>
                  <th className="pb-3 px-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="hover:bg-card/50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-3 font-mono font-bold text-turquoise">
                      {student.student_code}
                    </td>
                    <td className="py-4 px-3 font-semibold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-card border-border border text-turquoise font-bold text-xs flex items-center justify-center">
                          {(student.user?.name || 'ط').slice(0, 1)}
                        </div>
                        <div>
                          <span>{student.user?.name || 'طالب بدون اسم'}</span>
                          <span className="block text-[10px] text-secondary font-mono" dir="ltr">
                            {student.user?.email || '—'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-secondary">{student.grade_level || '—'}</td>
                    <td className="py-4 px-3 font-semibold">
                      <span className={(student.analytics?.attendance_rate ?? 0) >= 85 ? 'text-emerald-400' : 'text-rose-400'}>
                        {student.analytics?.attendance_rate ?? 0}%
                      </span>
                    </td>
                    <td className="py-4 px-3 font-semibold">
                      <span className={(student.analytics?.overall_score ?? 0) >= 80 ? 'text-cyan-400' : 'text-amber-400'}>
                        {student.analytics?.overall_score ?? 0}%
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      {student.status === 'active' ? (
                        <Badge variant="success">منتظم</Badge>
                      ) : (
                        <Badge variant="danger">معلق</Badge>
                      )}
                    </td>
                    <td className="py-4 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="px-3 py-1.5 rounded-lg bg-turquoise/20 hover:bg-turquoise text-indigo-300 hover:text-white text-[11px] font-semibold transition-all border border-turquoise/30"
                      >
                        عرض الملف الأكاديمي ←
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Student Profile & Academic Inspection Drawer */}
      <Drawer
        isOpen={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent?.user?.name || selectedStudent?.student_code || ''}
        subtitle={selectedStudent ? `${selectedStudent.student_code} • ${selectedStudent.grade_level || 'غير محدد'}` : ''}
        width="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-secondary font-mono">
              معرّف السجل: {selectedStudent?.id.slice(0, 12)}...
            </span>
            <button
              onClick={() => setSelectedStudent(null)}
              className="px-4 py-2 rounded-[16px] bg-card border-border border hover:bg-background hover:border-border hover:border text-foreground text-xs font-semibold"
            >
              إغلاق
            </button>
          </div>
        }
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Quick KPI Strip */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-[20px] bg-background border border-border text-center">
                <span className="text-[10px] text-secondary block">نسبة الحضور</span>
                <span className="text-xl font-bold text-primary mt-1 block">
                  {selectedStudent.analytics?.attendance_rate ?? 0}%
                </span>
              </div>
              <div className="p-3.5 rounded-[20px] bg-background border border-border text-center">
                <span className="text-[10px] text-secondary block">المعدل العام</span>
                <span className="text-xl font-bold text-turquoise mt-1 block">
                  {selectedStudent.analytics?.overall_score ?? 0}%
                </span>
              </div>
              <div className="p-3.5 rounded-[20px] bg-background border border-border text-center">
                <span className="text-[10px] text-secondary block">تسليم الواجبات</span>
                <span className="text-xl font-bold text-turquoise mt-1 block">
                  {selectedStudent.analytics?.assignment_completion_rate ?? 0}%
                </span>
              </div>
            </div>

            {/* Contact Card */}
            <div className="p-4 rounded-[20px] bg-background border border-border space-y-2">
              <span className="text-xs font-bold text-secondary block mb-2">بيانات التواصل المعتمدة:</span>
              <div className="flex justify-between text-xs py-1 border-b border-border/60">
                <span className="text-secondary">البريد الإلكتروني:</span>
                <span className="text-white font-mono" dir="ltr">{selectedStudent.user?.email || 'غير متوفر'}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-border/60">
                <span className="text-secondary">رقم الجوال:</span>
                <span className="text-white font-mono" dir="ltr">{selectedStudent.user?.phone || 'غير متوفر'}</span>
              </div>
            </div>

            {/* Action Shortcuts */}
            <div className="pt-2 flex gap-2">
              <Link
                href="/teacher/credentials"
                className="flex-1 text-center py-2.5 rounded-[16px] bg-turquoise/20 hover:bg-turquoise text-indigo-300 hover:text-white text-xs font-semibold border border-turquoise/30 transition-colors"
              >
                إدارة أجهزة وكود الطالب
              </Link>
              <Link
                href="/teacher/attendance"
                className="flex-1 text-center py-2.5 rounded-[16px] bg-card border-border border hover:bg-background hover:border-border hover:border text-foreground text-xs font-semibold transition-colors"
              >
                رصد حضور الطالب
              </Link>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
