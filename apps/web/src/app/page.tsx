'use client';

import React, { useState } from 'react';
import { Navbar } from '../components/layout/navbar';
import { Sidebar, NavigationTab } from '../components/layout/sidebar';
import { useAuth } from '../context/auth-context';
import { StudentDashboard } from '../components/dashboard/student-dashboard';
import { TeacherDashboard } from '../components/dashboard/teacher-dashboard';
import { ParentDashboard } from '../components/dashboard/parent-dashboard';
import { CourseExplorer } from '../components/courses/course-explorer';
import { AttendanceView } from '../components/attendance/attendance-view';
import { AssessmentView } from '../components/assessment/assessment-view';
import { MeetingsHub } from '../components/meetings/meetings-hub';
import { AnalyticsHub } from '../components/analytics/analytics-hub';
import { ReportsHub } from '../components/reports/reports-hub';
import { CredentialsHub } from '../components/credentials/credentials-hub';

export default function HomePage() {
  const { currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <>
                {currentRole === 'student' && <StudentDashboard />}
                {currentRole === 'teacher' && <TeacherDashboard />}
                {currentRole === 'parent' && <ParentDashboard />}
              </>
            )}

            {activeTab === 'courses' && <CourseExplorer />}
            {activeTab === 'attendance' && <AttendanceView />}
            {activeTab === 'assessments' && <AssessmentView />}
            {activeTab === 'meetings' && <MeetingsHub />}
            {activeTab === 'analytics' && <AnalyticsHub />}
            {activeTab === 'reports' && <ReportsHub />}
            {activeTab === 'credentials' && <CredentialsHub />}
          </div>
        </main>
      </div>
    </div>
  );
}
