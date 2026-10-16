# Frontend Missing Features Report

Based on a comprehensive audit of the LMS Platform Frontend against the backend capabilities, the following features are either missing or not fully integrated.

## 1. What is Backend-Only? (No UI Exists)

- **Support Access Sessions:** The backend supports generating temporary access tokens for support (`api.platform.tenants.support_access`) and logging them. There is no UI in the platform admin dashboard to request, generate, or manage these support sessions.
- **Assignment Submissions:** The API supports `/courses/{courseId}/assignments/{id}/submit` and grading endpoints. The frontend lacks the student submission screen (file upload/text entry) and the teacher grading screen.
- **Report Generation & Download:** The backend supports asynchronous report generation (`api.reports.store`, `api.reports.download`). The frontend has a "ReportsHub" placeholder but lacks the actual UI to trigger or download these reports.
- **Metric Versioning UI:** The backend supports creating new metric versions (`api.metrics.add_version`). The frontend lacks an admin interface to manage analytics metric definitions.
- **Device Management:** The backend enforces device limits and allows device replacement (`api.credentials.replace_device`). The frontend lacks a "My Devices" screen for the student to view or request device replacement.

## 2. What is Frontend-Only or Mocked? (UI Exists, Backend Ignored)

- **Exam Execution (Critical):** The `StudentExamsPage` uses hardcoded questions (`DEMO_QUESTIONS`) and client-side grading. It completely ignores the backend endpoints for `start` attempt, `submitAnswer`, and `submit` exam.
- **QR Code Scanning (Critical):** The `TeacherAttendancePage` simulates a student scanning the QR code using a "Simulate Scan" button. The dynamic rotation and actual student QR reader component are missing. It does not hit the `api.attendance.scan` endpoint.
- **Video Learning Progress:** The lesson completion status is maintained locally in React state (`completedLessonIds`). It is not persisted to the backend upon completing a video.
- **AI Tutor:** The AI chat assistant within the video player uses a `setTimeout` simulation rather than connecting to a real backend AI/Chat endpoint.

## 3. What is Partially Integrated?

- **Payments Review:** The teacher dashboard accurately reports the number of pending payments by querying the backend. However, clicking into a detailed view to approve, reject, or view payment proof is not implemented.
- **Meetings:** The frontend successfully pulls meetings from the API and provides a "Join" link. However, creating a new meeting or cancelling one (Teacher Operations) does not have a dedicated form.

## Conclusion & Priority for Fixes
1. **P0 (Critical):** Connect the Exam Runner to the backend API. Client-side grading is a security risk.
2. **P0 (Critical):** Connect the QR Attendance Scanner to the backend.
3. **P1 (Core UX):** Build the Assignment Submission and Grading screens.
4. **P1 (Core UX):** Build the Payment Review screens.
5. **P2 (Important):** Persist video completion progress to the backend.
