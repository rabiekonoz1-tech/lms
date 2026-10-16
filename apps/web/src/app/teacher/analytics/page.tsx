'use client';

import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../../lib/analytics-api';
import type { StudentAnalyticsSnapshot } from '../../../types';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { AwardIcon, BarChartIcon, CalendarIcon, CheckCircleIcon, GraduationCapIcon } from '../../../components/icons';

export default function TeacherAnalyticsPage() {
  const [snapshot, setSnapshot] = useState<StudentAnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // Omar student ID from seeder
      const data = await analyticsApi.getStudentDashboard('01a0ef9d-5232-7086-9129-5989e81a7dd9');
      setSnapshot(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const data = await analyticsApi.refreshStudentDashboard('01a0ef9d-5232-7086-9129-5989e81a7dd9');
      setSnapshot(data);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChartIcon size={24} className="text-turquoise" />
            التحليلات ومؤشرات الأداء الأكاديمي
          </h1>
          <p className="text-sm text-secondary mt-1">
            نماذج القراءة السريعة (Fast Read Model Snapshots) وتحليل مؤشرات النجاح ونسب المخاطر للطلبة.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 bg-turquoise hover:bg-turquoise disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-[16px] text-xs transition-colors shadow-lg shadow-indigo-600/30"
        >
          <BarChartIcon size={16} />
          {isRefreshing ? 'جارٍ إعادة الحساب...' : 'إعادة احتساب المؤشرات (Recompute)'}
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-secondary text-sm">جارٍ تحميل التحليلات...</div>
      ) : (
        <div className="space-y-6">
          {/* Main KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5">
              <p className="text-xs text-secondary">معدل الحضور التراكمي</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {snapshot?.attendance_rate ?? 98.5}%
              </h3>
              <span className="text-[11px] text-primary flex items-center gap-1 mt-1">
                <CheckCircleIcon size={12} /> التزام ممتاز
              </span>
            </Card>

            <Card className="p-5">
              <p className="text-xs text-secondary">إنجاز التكليفات</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {snapshot?.assignment_completion_rate ?? 100}%
              </h3>
              <span className="text-[11px] text-primary flex items-center gap-1 mt-1">
                <CheckCircleIcon size={12} /> لا توجد واجبات متأخرة
              </span>
            </Card>

            <Card className="p-5">
              <p className="text-xs text-secondary">متوسط الاختبارات</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {snapshot?.exam_average ?? 96.0}%
              </h3>
              <span className="text-[11px] text-turquoise flex items-center gap-1 mt-1">
                <AwardIcon size={12} /> مستوى الامتياز (A+)
              </span>
            </Card>

            <Card className="p-5 border-turquoise/30 bg-[color-mix(in_srgb,var(--tq)_15%,transparent)]">
              <p className="text-xs text-secondary">المؤشر الأكاديمي المركب</p>
              <h3 className="text-2xl font-bold text-turquoise mt-1">
                {snapshot?.overall_score ?? 97.2}%
              </h3>
              <span className="text-[11px] text-indigo-300 flex items-center gap-1 mt-1">
                ⭐ مؤشر الأمان: مخاطر منخفضة
              </span>
            </Card>
          </div>

          {/* Student Detailed Breakdown */}
          <Card className="p-6">
            <h2 className="text-base font-bold text-white mb-4">
              تقرير الأداء التحليلي للطالب: عمر أحمد فاروق (STU-2026-001)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-[16px] bg-card border border-border">
                <span className="text-secondary block mb-1">تاريخ آخر احتساب:</span>
                <span className="font-mono text-white text-sm">
                  {snapshot?.last_calculated_at || new Date().toISOString().slice(0, 10)}
                </span>
              </div>
              <div className="p-4 rounded-[16px] bg-card border border-border">
                <span className="text-secondary block mb-1">تصنيف المخاطر الأكاديمية:</span>
                <Badge variant="success">منخفضة جداً (Low Risk)</Badge>
              </div>
              <div className="p-4 rounded-[16px] bg-card border border-border">
                <span className="text-secondary block mb-1">المقرر المتفوق به:</span>
                <span className="text-white font-semibold">رياضيات متقدمة - تفاضل وتكامل</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
