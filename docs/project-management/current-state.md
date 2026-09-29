# Current Project State

Planning/documentation phases A–K have been approved.
Milestones M0 (Repository Bootstrap), M1 (Runtime Foundation Core), M2 (Tenancy Foundation), M3 (Identity / Authentication / Authorization), M4 (Education Core), M5 (Classroom & Attendance Core), M6 (Assessment Domain), M7 (Billing, Packages & Entitlements), M8 (Credentials & Devices), M9 (Integrations & Media Abstraction), M10 (Analytics & Reporting), and M11 (Frontend Foundation & Core Integration) have been successfully implemented and verified.

## Current Mode

IMPLEMENTATION MODE

## Current Milestone

M11 — Frontend Foundation & Core Integration (VERIFIED)  
Next Milestone: M12 — Full System Verification & End-to-End Gates

## Current Task

M11-001 — Frontend Foundation & Core Integration: Next.js 16 App Router shell, Tenant & Auth contexts, RTL-first responsive design, role personas (Student, Teacher, Parent), Courses Explorer, Attendance Marking, Assessment Submissions, Virtual Classrooms Hub, Analytics & Reporting Center, and Device Credential views. (COMPLETED & VERIFIED)

## Completed

- Phases A–K approved
- Master Specification defined
- AI Operating Rules defined
- Implementation sequence defined
- **M0-001 Repository Bootstrap**:
  - Approved repository directory layout (`apps/api`, `apps/web`, `packages/`, `infrastructure/`, `scripts/`, `tests/`)
  - Laravel 13 backend & Next.js 16 frontend initialized & booted
- **M1-001 Runtime Foundation Core**:
  - Request correlation middleware (`RequestCorrelationMiddleware`)
  - Standardized API response helper (`ApiResponse`) with `{ data, meta }` and `{ error, meta }` envelopes
  - Centralized API exception handling in `bootstrap/app.php`
  - Health check endpoint `GET /api/v1/health`
  - Frontend typed API client (`apps/web/src/lib/api-client.ts`)
- **M2-001 Tenancy Foundation**:
  - Control plane models and migrations (`tenants`, `tenant_domains`, `tenant_databases`, `tenant_features`)
  - Dynamic connection switching and migration orchestrator `TenantDatabaseManager`
  - Base model `TenantModel` ensuring tenant database connection
  - Current tenant inspection endpoint `GET /api/v1/tenant/current`
  - Tenant Gate verified: `TenantIsolationTest` proving strict data separation
- **M3-001 Identity, Authentication & Authorization**:
  - Global student identity (`GlobalIdentity`, `StudentIdentityLink`) in Control DB
  - Tenant-scoped users, educational student profile (`Student`), staff (`Staff`), parents (`ParentProfile`)
  - Invariants strictly enforced: `User ≠ Student`, `Teacher ≠ Role`, `Parent ≠ Student`, `Global Identity ≠ Tenant Authorization`
  - Bearer token authentication (`TenantToken`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`)
  - Granular RBAC permissions with default deny (`TenantAuthorize` middleware, `tenant.can:<permission>`)
  - Identity, Authentication, and Authorization Gates passed with full test coverage
- **M4-001 Education Core**:
  - Tenant database migration for `courses`, `lessons`, and `enrollments`
  - Eloquent domain models: `Course`, `Lesson`, `Enrollment`, with relationships to `Staff` and `Student`
  - Controllers: `CourseController`, `LessonController`, `EnrollmentController`, `StudentController`
  - API routes for courses, lessons, enrollments, and student data
  - Education Gate verified in `EducationGateTest` (Phase J §24)
- **M5-001 Classroom & Attendance Core**:
  - Tenant database migration for `branches`, `classrooms`, `classes`, `class_students`, `sessions`, and `attendance_records`
  - Eloquent domain models: `Branch`, `Classroom`, `SchoolClass`, `ClassSession`, `AttendanceRecord`, with relationships to `Student` and `Staff`
  - Controllers: `ClassController`, `SessionController`, `AttendanceController`
  - Invariant strictly enforced: `Attendance ≠ Session`
  - Manual attendance recording, QR code scanning, and session attendance reporting with calculation of attendance rate percentage
  - Attendance Gate verified in `AttendanceGateTest` (Phase J §27)
- **M6-001 Assessment Domain**:
  - Tenant database migration for `assignments`, `assignment_submissions`, `exams`, `questions`, `exam_attempts`, `exam_answers`, and `grades`
  - Eloquent domain models: `Assignment`, `AssignmentSubmission`, `Exam`, `Question`, `ExamAttempt`, `ExamAnswer`, `Grade`
  - Invariants strictly enforced: `Assessment ownership belongs to tenant`, `Grade model independence`, `Controlled grade publication`
  - Controllers: `AssignmentController`, `ExamController`, `GradeController`
  - Assessment Gate verified in `AssessmentGateTest` (Phase J §30)
- **M7-001 Billing, Packages & Entitlements**:
  - Tenant database migration for `packages`, `package_entitlements`, `payment_requests`, `payment_review_logs`, `subscriptions`, and `entitlements`
  - Eloquent domain models: `Package`, `PackageEntitlement`, `PaymentRequest`, `PaymentReviewLog`, `Subscription`, `Entitlement`
  - Invariants strictly enforced:
    - `Payment ≠ Subscription`
    - `Subscription ≠ Entitlement`
    - `Payment Approval ≠ Authentication`
    - No `student.is_paid` shortcut column; student capabilities checked via `hasEntitlement()`
  - Controllers: `PackageController`, `PaymentRequestController`, `SubscriptionController`, `EntitlementController`
  - Billing Gate verified in `BillingGateTest` (Phase J §33)
- **M8-001 Credentials & Devices**:
  - Tenant database migration for `access_credentials`, `device_bindings`, and `device_change_logs`
  - Eloquent domain models: `AccessCredential`, `DeviceBinding`, `DeviceChangeLog`
  - Invariants strictly enforced:
    - Raw secret hashed (SHA-256); secret never stored in plain text or logged
    - Secret hash hidden from model serialization
    - Single active device binding per credential
    - Second device policy enforced (`403 SECOND_DEVICE_PROHIBITED`)
    - Authorized device replacement with immutable audit record in `device_change_logs`
    - Full lifecycle states (`pending`, `active`, `suspended`, `revoked`, `expired`)
  - Controllers: `CredentialController`
  - Credential Gate verified in `CredentialGateTest` (Phase J §37)
- **M9-001 Integrations & Media Abstraction**:
  - Provider abstractions: `MeetingProviderInterface`, `VideoProviderInterface`
  - Adapters: `GoogleMeetProvider`, `ZoomMeetingProvider`, `MockMeetingProvider`, `VimeoVideoProvider`, `GoogleDriveVideoProvider`, `MockVideoProvider`
  - Resilience & Failover: `MeetingProviderManager`, `VideoProviderManager` with automatic fallback
  - Tenant database migration for `meetings`, `media_assets`, and `integration_webhook_logs`
  - Invariants strictly enforced:
    - Vendor SDK abstraction (`Domain Contract -> Application Interface -> Provider Adapter -> External SDK`)
    - Idempotent meeting creation (`idempotency_key`)
    - External ID mapping (`external_meeting_id`, `external_media_id`)
    - Provider webhook HMAC-SHA256 signature verification
    - Strict cross-tenant isolation
  - Controllers: `MeetingController`, `MediaController`, `WebhookController`
  - Media / Meeting Gate verified in `IntegrationGateTest` (Phase J §40)
- **M10-001 Analytics & Reporting**:
  - Tenant database migration for `metric_definitions`, `metric_versions`, `metric_measurements`, `student_analytics_snapshots`, `report_definitions`, and `report_instances`
  - Eloquent domain models: `MetricDefinition`, `MetricVersion`, `MetricMeasurement`, `StudentAnalyticsSnapshot`, `ReportDefinition`, `ReportInstance`
  - Invariants strictly enforced:
    - No synchronous heavy calculation on dashboard queries (`StudentAnalyticsSnapshot` fast read model)
    - Metric versioning ensures historical measurements remain stable when formulas change
    - Accurate calculation of attendance rate, assignment completion rate, and exam averages
    - Strict tenant isolation and data scope authorization on report downloads
    - Graceful failure handling and lifecycle tracking for asynchronous report jobs
  - Controllers: `MetricController`, `DashboardController`, `ReportController`
  - Analytics & Reporting Gates verified in `AnalyticsAndReportingGateTest` (Phase J §45 and §47)
- **M11-001 Frontend Foundation & Core Integration**:
  - Pure SVG icon system (`apps/web/src/components/icons/index.tsx`)
  - UI component primitives: `Button`, `Badge`, `Card`
  - React contexts: `TenantContext` (multi-tenant live switching), `AuthContext` (role persona switcher)
  - Application shell: `Navbar` (brand, tenant badge, user menu, RTL layout), `Sidebar` (role-filtered dynamic navigation)
  - Role-specific dashboards: `StudentDashboard`, `TeacherDashboard`, `ParentDashboard`
  - Feature domain views: `CourseExplorer`, `AttendanceView`, `AssessmentView`, `MeetingsHub`, `AnalyticsHub`, `ReportsHub`, `CredentialsHub`
  - Strict TypeScript strictness across Next.js 16 App Router and Tailwind CSS v4 design system

## In Progress

- Preparation for M12 (Full System Verification & End-to-End Gates: Cross-domain integration tests, security boundaries, multi-tenant isolation, and automated gate suite)

## Pending

- M12 Full System Verification
- M13 Production Hardening
- M14 Production Readiness

## Blocked

None.

## Verification Evidence

- Backend Tests: `vendor/bin/phpunit` -> 25 tests, 347 assertions passed (AnalyticsAndReportingGateTest, IntegrationGateTest, CredentialGateTest, BillingGateTest, AssessmentGateTest, AttendanceGateTest, EducationGateTest, IdentityGateTest, AuthenticationGateTest, AuthorizationGateTest, TenantIsolationTest, TenantResolutionTest, HealthCheckTest, RequestCorrelationTest, ApiExceptionHandlingTest)
- Backend Linter: `vendor/bin/pint --test` -> Passed (0 violations)
- Frontend Types: `npx tsc --noEmit` -> Passed (0 errors)
- Frontend Linter: `npm run lint` -> Passed (0 errors)
- Frontend Production Build: `npm run build` -> Passed (Next.js 16.3.7 Turbopack static & dynamic pages generated successfully)
