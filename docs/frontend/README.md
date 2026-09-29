# Frontend Documentation

## 1. Overview
The web application is built with **Next.js 16 (App Router)**, **React 19**, and **TypeScript 5**, designed to deliver a modern, high-performance, RTL-first experience for Saudi and Gulf educational markets.

- **Location**: `apps/web/`
- **Framework**: Next.js 16.3.7
- **UI Runtime**: React 19.2.8
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS v4 + PostCSS
- **Linting**: ESLint 9 (`eslint-config-next`)

---

## 2. Directory Structure

```text
apps/web/
├── public/                     # Static assets (fonts, icons, images)
├── src/
│   ├── app/                    # Next.js App Router (pages, layouts, routes)
│   │   ├── favicon.ico
│   │   ├── globals.css         # Global CSS with Tailwind v4 imports
│   │   ├── layout.tsx          # Root layout (RTL-ready, IBM Plex Sans Arabic)
│   │   └── page.tsx            # Landing/welcome page
│   └── lib/                    # Shared libraries and utilities
│       └── api-client.ts       # Typed API client with envelope handling & correlation
├── .env.example                # Frontend environment template
├── eslint.config.mjs           # ESLint configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies and scripts
├── postcss.config.mjs          # PostCSS configuration
└── tsconfig.json               # TypeScript strict configuration
```

---

## 3. API Client & Contract Integration (M1)

The frontend communicates with `/api/v1` via `src/lib/api-client.ts`:
- Automatically attaches and receives `X-Request-ID` for end-to-end tracing.
- Unwraps the standard `{ data, meta }` response envelope.
- Throws strongly-typed `ApiError` instances containing `code`, `status`, `message`, `details`, and `requestId`.
- Supports method helpers: `apiClient.get<T>()`, `apiClient.post<T>()`, etc.

---

## 4. Verification & Development Commands

From `apps/web/`:

```bash
# Start development server
npm run dev

# Run type check
npx tsc --noEmit

# Run ESLint
npm run lint

# Build production bundle
npm run build
```

---

## 5. Architecture & Components (M11)

### 5.1 Contexts & State Providers
- **`TenantContext` (`src/context/tenant-context.tsx`)**:
  - Manages active tenant slug and metadata.
  - Syncs `X-Tenant` header with `apiClient`.
  - Supports live tenant switching for multi-tenant exploration.
- **`AuthContext` (`src/context/auth-context.tsx`)**:
  - Manages role personas (`student`, `teacher`, `parent`, `admin`).
  - Enforces invariant: *Frontend authorization is UI feedback only; backend security gate is authoritative*.

### 5.2 Application Shell & Layout
- **`Navbar` (`src/components/layout/navbar.tsx`)**:
  - RTL-first navigation header with active tenant status badge, tenant switcher, role persona switcher, and user identity indicator.
- **`Sidebar` (`src/components/layout/sidebar.tsx`)**:
  - Role-aware navigation drawer displaying module links dynamically based on active role permissions.

### 5.3 Role-Based Dashboards & Feature Views
- **Student Dashboard (`src/components/dashboard/student-dashboard.tsx`)**:
  - Academic progress, active courses, upcoming assignments & exams, and recent attendance summaries.
- **Teacher Dashboard (`src/components/dashboard/teacher-dashboard.tsx`)**:
  - Classroom rosters, grading queues, scheduled live lectures, and attendance entry shortcuts.
- **Parent Dashboard (`src/components/dashboard/parent-dashboard.tsx`)**:
  - Multi-child progress monitoring, fee payments & subscription status, attendance cards, and teacher notes.
- **Courses & Lessons (`src/components/courses/course-explorer.tsx`)**:
  - Course curriculum browser with lesson status, durations, and multi-tenant content isolation.
- **Classroom Attendance (`src/components/attendance/attendance-view.tsx`)**:
  - Session roster and interactive attendance marking (`present`, `absent`, `late`, `excused`).
- **Assessments & Grading (`src/components/assessment/assessment-view.tsx`)**:
  - Assignment submissions and timed quiz/exam interfaces with score tracking.
- **Virtual Classrooms (`src/components/meetings/meetings-hub.tsx`)**:
  - Google Meet, Zoom, and Mock provider integration display with direct join actions.
- **Academic Analytics (`src/components/analytics/analytics-hub.tsx`)**:
  - Pre-aggregated snapshot visualizer (`no synchronous heavy calculation on dashboard`).
- **Reporting Center (`src/components/reports/reports-hub.tsx`)**:
  - Asynchronous report generation, export, and authenticated download logs.
- **Security & Devices (`src/components/credentials/credentials-hub.tsx`)**:
  - Hardware device binding management, SHA-256 credential hashing badges, and active session controls.

---

## 6. UI/UX Principles
- **RTL-First**: Default text direction is right-to-left (`dir="rtl"`) with modern Tajawal and IBM Plex typography.
- **Design Tokens**: Dark glassmorphic aesthetic (`slate-950/80`, emerald accents, indigo/purple role cues).
- **Security Invariant**: Frontend authentication checks are UI state helpers only; security boundaries are strictly enforced on the backend.

