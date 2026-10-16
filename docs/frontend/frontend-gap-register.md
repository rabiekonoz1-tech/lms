# Frontend Gap Register & Integration Audit

## 1. Video Progress Tracking (Missing Backend Capability)
* **Feature:** Tracking student watch progress and completion for video lessons.
* **Reason:** The Frontend relies on `localStorage` (`completedLessonIds`) because there is no API endpoint (e.g., `POST /courses/{courseId}/lessons/{id}/progress`) or `VideoEvent`/`LearningProgress` model in the backend to store completion state.
* **Impact:** 🟠 **Medium**. The student's video progress is lost if they switch devices. Analytics for video engagement are impossible.
* **Solution (Backend Change Needed):** Add a `LearningProgress` entity to the backend and expose a progress tracking endpoint in `LessonController`. Until then, Frontend will continue using local state, but the architecture strictly prohibits relying on localStorage as the source of truth for critical data.

## 2. Support Access Identity Impersonation (Frontend Gap)
* **Feature:** Platform Support team needs a UI to view tenants, generate support tokens (`POST /support/access/{tenantId}`), and seamlessly "enter" the tenant context without knowing the admin password.
* **Reason:** The backend implements temporary support access (generating a JWT with limited scope) in `SupportAccessLog` and related controllers, but the Platform Frontend (`PlatformTenantsPage`) lacks the action button to "Enter Tenant as Support".
* **Impact:** 🔴 **High**. Support cannot diagnose issues inside a tenant without breaking the security invariant (asking for passwords).
* **Solution (Frontend Change):** Add an "Enter as Support" button in `PlatformTenantsPage` that calls the backend access endpoint, receives the temporary JWT, and redirects to the tenant URL (`http://{slug}.localhost:3000`) with the token appended to the URL or injected into cookies securely.

## 3. Exam Grading Execution Validation (Closed ✅)
* **Status:** Resolved. Frontend was executing exams and determining scores client-side. Now it submits raw answers to `POST /courses/{courseId}/assignments/{id}/submit` and the Backend correctly computes the grade. 

## 4. Assignment Submissions Review (Closed ✅)
* **Status:** Resolved. Added `getSubmissions` to `AssignmentController` and built the grading modal in `TeacherAssessmentsPage`.
