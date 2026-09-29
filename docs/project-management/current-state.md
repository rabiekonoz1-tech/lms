# Current Project State

Planning/documentation phases A–K have been approved.
Milestones M0 (Repository Bootstrap), M1 (Runtime Foundation Core), M2 (Tenancy Foundation), M3 (Identity / Authentication / Authorization), M4 (Education Core), M5 (Classroom & Attendance Core), M6 (Assessment Domain), and M7 (Billing, Packages & Entitlements) have been successfully implemented and verified.

## Current Mode

IMPLEMENTATION MODE

## Current Milestone

M7 — Billing, Packages & Entitlements (VERIFIED)  
Next Milestone: M8 — Credentials & Devices

## Current Task

M7-001 — Billing, Packages & Entitlements: Packages, Package Entitlements, Payment Requests, Payment Proof, Payment Review & Approval, Audit Logs, Subscription Activation, Entitlement Grants, and Billing Gate. (COMPLETED & VERIFIED)

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
    - No `student.is_paid` shortcut column
  - Controllers: `PackageController`, `PaymentRequestController`, `SubscriptionController`, `EntitlementController`
  - Billing Gate verified in `BillingGateTest` (Phase J §33):
    - Commercial package creation with entitlement mappings
    - Student payment request submission (`pending`)
    - Review list and details retrieval
    - Wrong reviewer authorization check (`403 FORBIDDEN`)
    - Payment request approval with reviewer attribution
    - Subscription activation and entitlement granting
    - Verification that student holds active entitlements (`hasEntitlement()`)
    - Immutable audit log written to `payment_review_logs`
    - Duplicate approval prevention (`422 ALREADY_PROCESSED`)
    - Payment request rejection with reason logging
    - Cross-tenant payment request isolation (`404` and `401`)

## In Progress

- Preparation for M8 (Credentials & Devices: Student Access Credentials, Code/Barcode Generation, Device Binding, Device Replacement, Credential Gate)

## Pending

- M8 Credentials / Devices
- M9 Integrations
- M10 Analytics / Reporting
- M11 Full Frontend
- M12 Full Verification
- M13 Production Hardening
- M14 Production Readiness

## Blocked

None.

## Verification Evidence

- Backend Tests: `vendor/bin/phpunit` -> 21 tests, 253 assertions passed (BillingGateTest, AssessmentGateTest, AttendanceGateTest, EducationGateTest, IdentityGateTest, AuthenticationGateTest, AuthorizationGateTest, TenantIsolationTest, TenantResolutionTest, HealthCheckTest, RequestCorrelationTest, ApiExceptionHandlingTest)
- Backend Linter: `vendor/bin/pint --test` -> Passed (0 violations)
- Frontend Types: `npx tsc --noEmit` -> Passed (0 errors)
- Frontend Linter: `npm run lint` -> Passed (0 errors)
