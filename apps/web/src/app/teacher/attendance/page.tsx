'use client';

import React, { useEffect, useState, useRef } from 'react';
import { attendanceApi } from '../../../lib/attendance-api';
import { educationApi } from '../../../lib/education-api';
import type { SchoolClass, ClassSession, Student } from '../../../types';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { CalendarIcon, CheckCircleIcon, QrCodeIcon } from '../../../components/icons';

interface CheckedInStudent {
  name: string;
  code: string;
  time: string;
  mode: string;
}

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [recordSuccess, setRecordSuccess] = useState<string | null>(null);

  // Live QR Presenter Modal state
  const [activeQrSession, setActiveQrSession] = useState<ClassSession | null>(null);
  const [liveAttendees, setLiveAttendees] = useState<CheckedInStudent[]>([]);
  
  // Real Scanner State
  const [scannedCode, setScannedCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [cList, stList] = await Promise.all([
          attendanceApi.getClasses().catch(() => []),
          educationApi.getStudents().catch(() => []),
        ]);
        setClasses(cList);
        setStudents(stList);

        if (cList.length > 0) {
          setSelectedClass(cList[0]);
          const sList = await attendanceApi.getSessions(cList[0].id).catch(() => []);
          setSessions(sList);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Keep scanner input focused
  useEffect(() => {
    if (activeQrSession && scannerInputRef.current) {
      scannerInputRef.current.focus();
    }
  }, [activeQrSession]);

  const handleRecord = async (sessionId: string, studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    if (!studentId) {
      alert('لا يوجد طالب محدد.');
      return;
    }
    try {
      await attendanceApi.recordAttendance(sessionId, {
        student_id: studentId,
        status,
        attendance_mode: 'manual',
      });
      setRecordSuccess(`تم تحديث حالة الحضور إلى: ${status === 'present' ? 'حاضر' : status === 'late' ? 'متأخر' : 'غائب'}`);
      setTimeout(() => setRecordSuccess(null), 3000);
    } catch {
      alert('حدث خطأ أثناء رصد الحضور.');
    }
  };

  const handleRealScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCode.trim() || !activeQrSession) return;
    
    setIsScanning(true);
    try {
      const res = await attendanceApi.scanQr(activeQrSession.id, scannedCode.trim());
      
      const newStudent: CheckedInStudent = {
        name: res.student?.user?.name || 'طالب غير معروف',
        code: res.student?.student_code || scannedCode.trim(),
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        mode: 'مسح إلكتروني QR',
      };
      
      setLiveAttendees((prev) => [newStudent, ...prev]);
      setRecordSuccess(`تم تسجيل حضور الطالب ${newStudent.name} بنجاح!`);
      setTimeout(() => setRecordSuccess(null), 3000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'رمز QR غير صالح أو الطالب غير مسجل في هذه الشعبة.');
    } finally {
      setScannedCode('');
      setIsScanning(false);
      if (scannerInputRef.current) {
        scannerInputRef.current.focus();
      }
    }
  };

  const quickStudent = students.length > 0 ? students[0] : null;
  const quickStudentName = quickStudent?.user?.name?.split(' ')[0] || 'طالب';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon size={24} className="text-turquoise" />
            رصد وإدارة الحضور الأكاديمي
          </h1>
          <p className="text-sm text-secondary mt-1">
            إدارة جلسات الحصص المدرسية، رصد الحضور يدوياً أو بواسطة قارئ الباركود/QR.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">الشعبة: {selectedClass?.name || '---'}</Badge>
        </div>
      </div>

      {recordSuccess && (
        <div className="rounded-[16px] border border-primary/30 bg-primary/10 p-4 text-primary text-sm transition-all">
          {recordSuccess}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-secondary text-sm">جارٍ تحميل الحصص والجلسات...</div>
      ) : (
        <div className="space-y-6">
          {/* Active Sessions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">الحصص الدراسية المسجلة</h2>
              <span className="text-xs text-secondary">إجمالي الحصص: {sessions.length}</span>
            </div>

            <div className="space-y-4">
              {sessions.length === 0 ? (
                <div className="text-center text-sm text-secondary py-8">لا توجد حصص مجدولة لهذه الشعبة.</div>
              ) : (
                sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="rounded-[20px] border border-border bg-card/60 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors hover:border-turquoise/30"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{sess.title}</span>
                        <Badge variant={sess.status === 'in_progress' ? 'info' : 'neutral'}>
                          {sess.status === 'in_progress' ? 'جلسة نشطة' : sess.status === 'completed' ? 'مكتملة' : 'مجدولة'}
                        </Badge>
                      </div>
                      <p className="text-xs text-secondary mt-1">
                        القاعة: قاعة افتراضية / فعلية • نمط الرصد: مسح QR الذكي + رصد يدوي
                      </p>
                    </div>

                    {/* Actions & QR Launcher */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveQrSession(sess);
                          setLiveAttendees([]);
                        }}
                        className="px-3.5 py-1.5 rounded-[16px] bg-turquoise hover:bg-turquoise text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                      >
                        <QrCodeIcon size={14} />
                        تشغيل ماسح الـ QR للحصة
                      </button>

                      {quickStudent && (
                        <div className="flex items-center gap-1.5 border-r border-border pr-2 mr-2">
                          <span className="text-xs text-secondary ml-1">{quickStudentName}:</span>
                          <button
                            onClick={() => handleRecord(sess.id, quickStudent.id, 'present')}
                            className="px-2.5 py-1 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-xs font-semibold"
                          >
                            حاضر
                          </button>
                          <button
                            onClick={() => handleRecord(sess.id, quickStudent.id, 'late')}
                            className="px-2.5 py-1 rounded-lg bg-accent/20 hover:bg-accent/30 border border-amber-500/30 text-accent text-xs font-semibold"
                          >
                            متأخر
                          </button>
                          <button
                            onClick={() => handleRecord(sess.id, quickStudent.id, 'absent')}
                            className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-xs font-semibold"
                          >
                            غائب
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Live QR Attendance Presenter Modal (Scanner Mode) */}
      {activeQrSession && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => {
            // Keep focus on input if user clicks background
            if (scannerInputRef.current) scannerInputRef.current.focus();
          }}
        >
          <div 
            className="w-full max-w-2xl bg-card border border-border rounded-[24px] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border bg-background flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-turquoise/20 text-turquoise">
                  <QrCodeIcon size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">جلسة المسح الإلكتروني (QR/Barcode)</h3>
                  <span className="text-[11px] text-secondary">{activeQrSession.title}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveQrSession(null)}
                className="text-secondary hover:text-white p-1 rounded-lg hover:bg-card hover:border-border hover:border"
              >
                ✕ إغلاق
              </button>
            </div>

            {/* QR Scanner Stage */}
            <div className="p-8 text-center bg-background flex flex-col items-center border-b border-border relative">
              <div className="absolute inset-0 bg-gradient-to-b from-turquoise/5 to-transparent pointer-events-none" />
              
              <div className="p-4 rounded-full bg-turquoise/10 text-turquoise mb-4 animate-pulse">
                <QrCodeIcon size={48} />
              </div>
              
              <h4 className="text-lg font-bold text-white mb-2">في انتظار المسح الضوئي...</h4>
              <p className="text-xs text-secondary mb-6 max-w-sm mx-auto">
                قم بتوجيه قارئ الباركود/QR نحو بطاقة الطالب. النظام يستمع الآن لإدخال جهاز المسح بشكل تلقائي.
              </p>

              <form onSubmit={handleRealScanSubmit} className="w-full max-w-sm relative z-10">
                <input
                  ref={scannerInputRef}
                  type="text"
                  placeholder="انقر هنا للتأكد من ربط الماسح..."
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  disabled={isScanning}
                  autoFocus
                  className="w-full bg-card/80 border border-turquoise/30 rounded-[16px] px-4 py-3 text-center text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-turquoise focus:border-turquoise shadow-inner"
                />
                {isScanning && (
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <div className="h-4 w-4 rounded-full border-2 border-turquoise border-t-transparent animate-spin" />
                  </div>
                )}
              </form>
            </div>

            {/* Live Checked In Roster */}
            <div className="p-6 overflow-y-auto max-h-64 space-y-3 bg-card">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <CheckCircleIcon size={14} className="text-primary" />
                  سجل الدخول اللحظي ({liveAttendees.length})
                </h4>
              </div>

              <div className="space-y-2">
                {liveAttendees.length === 0 ? (
                   <div className="text-center text-xs text-secondary py-6">لم يقم أي طالب بمسح الرمز بعد.</div>
                ) : (
                  liveAttendees.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-[16px] bg-background border border-border text-xs animate-in slide-in-from-top-2 duration-300"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <span className="font-semibold text-white">{att.name}</span>
                        <span className="font-mono text-[10px] text-secondary">({att.code})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-secondary font-mono text-[11px]">{att.time}</span>
                        <Badge variant="success">{att.mode}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-background flex items-center justify-between">
              <p className="text-[11px] text-secondary">
                البيانات تسجل فوراً في السيرفر الرئيسي (Source of Truth).
              </p>
              <button
                onClick={() => setActiveQrSession(null)}
                className="px-4 py-2 rounded-[16px] bg-card border-border border hover:bg-background hover:border-border hover:border text-white text-xs font-semibold"
              >
                إنهاء وإغلاق الماسح
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
