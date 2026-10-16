# Frontend ↔ Backend Coverage Matrix

This matrix maps the actual backend capabilities (discovered in `apps/api/routes/api.php` and Domain models) to their corresponding frontend implementations in `apps/web/src/`.

| Capability | Backend | API | Auth | Permission | Role | Route | Screen | Real Data | Actions | States | Responsive | Tests | Status |
| ---------- | ------- | --- | ---- | ---------- | ---- | ----- | ------ | --------- | ------- | ------ | ---------- | ----- | ------ |
| **Tenancy Resolution** | ✅ | ✅ | ✅ | ✅ | Admin | `/platform/tenants` | ✅ | ✅ | ✅ | ✅ | ✅ | ⚪ | ✅ Complete |
| **Authentication (Login/Logout)** | ✅ | ✅ | ✅ | ✅ | All | `/login` | ✅ | ✅ | ✅ | ✅ | ✅ | ⚪ | ✅ Complete |
| **Course Explorer (Student)** | ✅ | ✅ | ✅ | ✅ | Student | `/student/courses` | ✅ | ✅ | ✅ | ✅ | ✅ | ⚪ | ✅ Complete |
| **Course Builder (Teacher)** | ✅ | ✅ | ✅ | ✅ | Teacher | `/teacher/courses` | ✅ | ✅ | ✅ | ✅ | ✅ | ⚪ | ✅ Complete |
| **Video Player & Progress** | ✅ | ✅ | ✅ | ✅ | Student | Modal in Courses | ✅ | 🟡 Partial | 🟡 UI Only | ✅ | ✅ | ⚪ | 🟡 Partial |
| **Exam Listing** | ✅ | ✅ | ✅ | ✅ | Student | `/student/exams` | ✅ | ✅ | ✅ | ✅ | ✅ | ⚪ | ✅ Complete |
| **Exam Execution & Grading** | ✅ | ✅ | ✅ | ✅ | Student | Modal in Exams | ✅ | 🔴 Mocked | 🔴 UI Only | ✅ | ✅ | ⚪ | 🟠 UI Only |
| **Assignments & Submissions** | ✅ | ✅ | ✅ | ✅ | Student | `/student/assignments` | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | ⚪ | 🔴 Missing |
| **Attendance (Manual Record)** | ✅ | ✅ | ✅ | ✅ | Teacher | `/teacher/attendance` | ✅ | ✅ | ✅ | ✅ | ✅ | ⚪ | ✅ Complete |
| **Attendance (QR Scan Workflow)** | ✅ | ✅ | ✅ | ✅ | Teacher | Modal | ✅ | 🟡 Partial | 🔴 Simulated | ✅ | ✅ | ⚪ | 🟡 Partial |
| **Payments Review** | ✅ | ✅ | ✅ | ✅ | Teacher | `/teacher/payments` | ✅ | ✅ | 🔴 | 🟡 | ✅ | ⚪ | 🟡 Partial |
| **Analytics Dashboards** | ✅ | ✅ | ✅ | ✅ | All | `/dashboard` | ✅ | ✅ | ⚪ | ✅ | ✅ | ⚪ | ✅ Complete |
| **Parent Monitoring** | ✅ | ✅ | ✅ | ✅ | Parent | `/parent/dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ | ⚪ | ✅ Complete |
| **Global Student Identity** | ✅ | ✅ | ✅ | ✅ | Student | Ribbon | ✅ | ✅ | ✅ | ✅ | ✅ | ⚪ | ✅ Complete |
| **Support Access** | ✅ | ✅ | ✅ | ✅ | Admin | API only | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | ⚪ | 🔵 Backend Only |

---

### Legend
* ✅ **Complete:** Fully integrated from Backend DB to Frontend UI with real data and actions.
* 🟡 **Partial:** Some parts are wired, but complex workflows (like QR Scanning, Video Progress syncing) are incomplete.
* 🟠 **UI Only:** Screen exists and looks good, but uses hardcoded data or client-side logic (e.g., Exam Runner).
* 🔵 **Backend Only:** Capability exists and is verified in the backend, but lacks frontend screens (e.g., Support Access, Assignment Submissions).
* 🔴 **Missing / Simulated:** Completely missing from the frontend or just simulated via a mock button without API integration.
* ⚪ **Planned / Not Tested:** E2E frontend tests (Cypress/Playwright) are not present, though backend PHPUnit tests exist.
