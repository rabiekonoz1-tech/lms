# Changelog

All notable changes to this project will be documented in this file.

## [M6-001] - 2026-09-29
### Added
- Assessment Domain:
  - Tenant database migration for `assignments`, `assignment_submissions`, `exams`, `questions`, `exam_attempts`, `exam_answers`, and `grades` tables
  - Eloquent domain models: `Assignment`, `AssignmentSubmission`, `Exam`, `Question`, `ExamAttempt`, `ExamAnswer`, and `Grade`
  - Invariants strictly enforced: `Assessment ownership belongs to tenant`, `Grade model independence`, `Controlled grade publication`
  - Controllers:
    - `AssignmentController`: Creation, retrieval, deadline-aware submissions, duplicate submission rejection, grading, and grade publishing
    - `ExamController`: Creation, question management, student attempt lifecycle (start, answer, submit), duplicate attempt rejection, grading, and grade publishing
    - `GradeController`: Independent student grade reporting with publication visibility filtering
  - Assessment Gate verified in `AssessmentGateTest` (Phase J §30):
    - Assignment submission & deadline tracking
    - Late submission flagging (`is_late = true`)
    - Duplicate submission blocking (`422 DUPLICATE_SUBMISSION`)
    - Exam start, question answering, and submission
    - Duplicate exam attempt blocking (`422 DUPLICATE_ATTEMPT`)
    - Teacher grading and grade publication control
    - Student grades visibility strictly controlled by publication state
    - Backend authorization enforcement (`403 FORBIDDEN` for students attempting to grade)
    - Cross-tenant assessment isolation verified (`404` and `401`)
  - Suite: 20 tests, 220 assertions passed (100% pass)
- Documentation updates:
  - `docs/domains/assessment/README.md`
  - `docs/backend/README.md`
  - `docs/project-management/current-state.md`
  - `docs/project-management/implementation-ledger.md`

## [M5-001] - 2026-09-29
### Added
- Classroom & Attendance Domain:
  - Tenant database migration for `branches`, `classrooms`, `classes`, `class_students`, `sessions`, and `attendance_records` tables
  - Eloquent domain models: `Branch`, `Classroom`, `SchoolClass`, `ClassSession`, and `AttendanceRecord` with relationships to `Staff` and `Student`
  - Invariant strictly enforced: `Attendance ≠ Session`
  - Controllers:
    - `ClassController`: Academic classes listing, creation, and student enrollment
    - `SessionController`: Class sessions scheduling and inspection
    - `AttendanceController`: Manual student attendance recording, QR code scanning, and session attendance reporting
  - Attendance Gate verified in `AttendanceGateTest` (Phase J §27):
    - Teacher creates class
    - Student enrolled in class
    - Teacher creates session
    - Student attendance recorded manually
    - Assistant scans student QR credential
    - Unauthorized attendance recording attempt denied (403 FORBIDDEN)
    - Session attendance report with rate % generated
    - Cross-tenant session/attendance isolation verified (404 and 401)
  - Suite: 19 tests, 181 assertions passed (100% pass)
- Documentation updates:
  - `docs/domains/attendance/README.md`
  - `docs/backend/README.md`
  - `docs/project-management/current-state.md`
  - `docs/project-management/implementation-ledger.md`

## [M4-001] - 2026-09-29
### Added
- Education Core Domain:
  - Tenant database migration for `courses`, `lessons`, and `enrollments` tables
  - Eloquent domain models: `Course`, `Lesson`, and `Enrollment` with relationships to `Staff` and `Student`
  - Controllers:
    - `CourseController`: Course creation, list (with role/student filtering), inspection, update, and deletion
    - `LessonController`: Course lesson creation and listing
    - `EnrollmentController`: Self and admin enrollment, student enrollment listings
    - `StudentController`: Student profile inspection with strict permission checks
  - Education Gate verified in `EducationGateTest` (Phase J §24):
    - Teacher creates course
    - Teacher creates lesson
    - Student enrolls in course
    - Student views authorized course and lessons
    - Cross-tenant course isolation verified (404 on cross query, 401 on cross token)
    - Assistant permissions boundary verified (permitted assistant allowed, basic assistant denied with 403 FORBIDDEN)
  - Suite: 18 tests, 152 assertions passed (100% pass)
- Documentation updates:
  - `docs/domains/education/README.md`
  - `docs/project-management/current-state.md`
  - `docs/project-management/implementation-ledger.md`

## [M3-001] - 2026-09-29
### Added
- Identity, Authentication & Authorization Core Foundation:
  - Control plane models and migrations for Global Identity: `GlobalIdentity`, `StudentIdentityLink`
  - Tenant database models and migrations: `TenantUser`, `Student`, `Staff`, `ParentProfile`, `Role`, `Permission`, `TenantToken`
  - Invariants strictly enforced: `User ≠ Student`, `Teacher ≠ Role`, `Parent ≠ Student`, `Global Identity ≠ Tenant Authorization` (SEC-INV-006)
  - Bearer token authentication: `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`
  - Granular RBAC authorization with default deny: `TenantAuthorize` middleware (`tenant.can:<permission>`)
  - Gates passed: `IdentityGateTest`, `AuthenticationGateTest`, `AuthorizationGateTest` (17 tests, 125 assertions passed)
  - Frontend `ApiClient` updated with automatic Bearer token injection
- Documentation updates:
  - `docs/domains/identity/README.md`
  - `docs/backend/README.md`
  - `docs/project-management/current-state.md`
  - `docs/project-management/implementation-ledger.md`

## [M2-001] - 2026-09-29
### Added
- Tenancy Foundation (Control DB + Tenant DB architecture):
  - Control plane models and migrations: `Tenant`, `TenantDomain`, `TenantDatabase`, `TenantFeature`
  - `TenantContext` singleton holding request-scoped active tenant state
  - `TenantResolver` resolving tenants via custom domains, subdomains, and `X-Tenant-Slug` / `X-Tenant-ID` headers
  - `TenantDatabaseManager` providing dynamic connection switching to `'tenant'` database connection and migration orchestration
  - `TenantModel` base class guaranteeing tenant connection scoping
  - `TenantResolutionMiddleware` enforcing tenant context and database binding on tenant routes
  - `GET /api/v1/tenant/current` endpoint returning resolved tenant information
  - Verification: `TenantResolutionTest` and `TenantIsolationTest` (Tenant Gate passed: strict database isolation between tenants verified)
  - Frontend `ApiClient` updated with tenant slug injection support
- Documentation updates:
  - `docs/domains/tenancy/README.md`
  - `docs/backend/README.md`
  - `docs/project-management/current-state.md`
  - `docs/project-management/implementation-ledger.md`

## [M1-001] - 2026-09-29
### Added
- Runtime Foundation core components:
  - `RequestCorrelationMiddleware` injecting and propagating `X-Request-ID` across HTTP and log context
  - `ApiResponse` support class providing standardized `{ data, meta }` and `{ error, meta }` envelopes
  - Centralized API exception handling in `bootstrap/app.php` mapping standard Laravel and HTTP exceptions to structured error codes
  - API Health Check endpoint `GET /api/v1/health` with `HealthCheckController` monitoring DB and cache readiness
  - Feature test suite: `HealthCheckTest`, `RequestCorrelationTest`, `ApiExceptionHandlingTest` (8 tests, 57 assertions passed)
  - Frontend `ApiClient` in `apps/web/src/lib/api-client.ts` with typed error handling and automatic request ID propagation
- Documentation updates:
  - `docs/backend/README.md`
  - `docs/frontend/README.md`
  - `docs/project-management/current-state.md`
  - `docs/project-management/implementation-ledger.md`

## [M0-001] - 2026-09-29
### Added
- Repository bootstrap adhering to clean modular architecture:
  - Laravel 13 backend in `apps/api/` with PHP 8.3, PHPUnit, and Pint
  - Next.js 16 frontend in `apps/web/` with React 19, TypeScript 5, Tailwind CSS v4, and ESLint 9
  - Shared package and infrastructure placeholders (`packages/`, `infrastructure/`, `scripts/`, `tests/`)
  - Standardized environment templates (`.env.example`, `apps/api/.env.example`, `apps/web/.env.example`)
  - Automated CI workflow in `.github/workflows/ci.yml`
- Documentation updates:
  - `docs/backend/README.md`
  - `docs/frontend/README.md`
  - `docs/infrastructure/README.md`
  - `docs/project-management/current-state.md`
  - `docs/project-management/implementation-ledger.md`
