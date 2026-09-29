# Changelog

All notable changes to this project will be documented in this file.

## [M10-001] - 2026-09-30
### Added
- Analytics & Reporting Domain:
  - Tenant database migration for `metric_definitions`, `metric_versions`, `metric_measurements`, `student_analytics_snapshots`, `report_definitions`, and `report_instances`
  - Eloquent domain models:
    - `MetricDefinition`: Keyed performance metric with versioning, category, and formula specification
    - `MetricVersion`: Versioned calculation definition preserving historical measurement interpretability
    - `MetricMeasurement`: Time-series individual student measurement referencing specific metric version
    - `StudentAnalyticsSnapshot`: Pre-aggregated read model serving fast dashboards without live scanning
    - `ReportDefinition`: Supported report definitions (`student_transcript`, `attendance_summary`, `academic`)
    - `ReportInstance`: Asynchronous report request tracking status (`queued`, `processing`, `completed`, `failed`), parameters, and file path
  - Domain Services:
    - `AnalyticsCalculationService`: Computes accurate attendance rates, assignment completion rates, exam averages, and weighted composite scores; records discrete measurements and updates fast read models
    - `ReportGenerationService`: Processes asynchronous report compilation jobs with structured JSON/CSV payloads and failure simulation handling
  - Controllers:
    - `MetricController`: Index, store (creates version 1 automatically), show, addVersion (upgrades version with changelog)
    - `DashboardController`: studentDashboard (fast read model serving), refresh (on-demand re-computation)
    - `ReportController`: Index, store (queued report creation and compilation), show, download (enforces download authorization)
  - Gates Verified in `AnalyticsAndReportingGateTest`:
    - Phase J §45 Analytics Gate:
      - Correct tenant isolation
      - Correct student mapping
      - Correct metric versioning
      - Accurate metric calculation
      - Historical measurement stability when definitions upgrade
      - Fast read model serving without synchronous heavy table scanning
    - Phase J §47 Reporting Gate:
      - Asynchronous report generation
      - Lifecycle job tracking
      - Graceful error/failure handling
      - Strict cross-tenant isolation
      - Download authorization enforcement
  - Suite: 25 tests, 347 assertions passed (100% pass)
- Documentation updates:
  - `docs/domains/analytics/README.md`
  - `docs/domains/reporting/README.md`
  - `docs/backend/README.md`
  - `docs/project-management/current-state.md`
  - `docs/project-management/implementation-ledger.md`

## [M9-001] - 2026-09-30
### Added
- Integrations & Media Abstraction Domain:
  - Provider abstraction contracts:
    - `MeetingProviderInterface` (create, get join URL, cancel, verify webhook signature)
    - `VideoProviderInterface` (upload/register, get embed URL, get status, verify webhook signature)
  - Domain Data Transfer Objects (DTOs):
    - `MeetingRequest`, `MeetingResponse`, `VideoUploadRequest`, `VideoUploadResponse`
  - Domain Exceptions:
    - `ProviderException`, `ProviderTimeoutException`, `InvalidSignatureException`
  - Meeting Provider Adapters:
    - `GoogleMeetProvider`: Formats Google Meet codes and URLs, verifies HMAC signatures
    - `ZoomMeetingProvider`: Formats Zoom meeting IDs and URLs, verifies HMAC signatures
    - `MockMeetingProvider`: Configurable mock for testing success, timeouts, and failures
  - Video Provider Adapters:
    - `VimeoVideoProvider`: Generates Vimeo embed URLs and status responses
    - `GoogleDriveVideoProvider`: Generates Google Drive preview embed URLs
    - `MockVideoProvider`: Configurable mock for video upload and embed testing
  - Resilience & Failover Managers:
    - `MeetingProviderManager`: Resolves provider drivers with automatic multi-provider failover
    - `VideoProviderManager`: Resolves video provider drivers with automatic multi-provider failover
  - Tenant database migration for `meetings`, `media_assets`, and `integration_webhook_logs`
  - Eloquent domain models:
    - `Meeting`: Virtual meetings attached to courses/sessions/staff with provider external ID mapping
    - `MediaAsset`: Video/audio/document media assets with embed URL resolution
    - `IntegrationWebhookLog`: Audit log for incoming webhooks with status tracking
  - Controllers:
    - `MeetingController`: Index, store (with idempotency check and failover), show, joinUrl, cancel
    - `MediaController`: Index, store (with failover), show, embedUrl
    - `WebhookController`: Signed provider webhook ingestion with HMAC-SHA256 signature verification and lifecycle event execution
  - Media / Meeting Gate verified in `IntegrationGateTest` (Phase J §40):
    - Provider success (meeting created, join URL generated, video uploaded, embed URL generated)
    - External ID mapping verified
    - Idempotency enforced on duplicate requests (200 OK replay)
    - Provider timeout handled gracefully with 504 Gateway Timeout
    - Provider failure handled gracefully with 502 Bad Gateway
    - Webhook signature verification verified (200 for valid HMAC signature, 401 for invalid signature)
    - Tenant isolation strictly verified (cross-tenant 404)
    - RBAC authorization verified (403 for unauthorized users)
  - Suite: 23 tests, 321 assertions passed (100% pass)
- Documentation updates:
  - `docs/domains/meetings/README.md`
  - `docs/domains/media/README.md`
  - `docs/backend/README.md`
  - `docs/project-management/current-state.md`
  - `docs/project-management/implementation-ledger.md`

## [M8-001] - 2026-09-29
### Added
- Credentials & Devices Domain:
  - Tenant database migration for `access_credentials`, `device_bindings`, and `device_change_logs` tables
  - Eloquent domain models: `AccessCredential`, `DeviceBinding`, and `DeviceChangeLog`
  - Invariants strictly enforced:
    - Raw secret hashed using SHA-256; secret never stored in plain text or logged
    - Secret hash hidden from model serialization (`$hidden = ['secret_hash']`)
    - Single active device binding per credential (second device policy enforced)
    - Device replacement requires administrative authorization and audit log
    - Strict cross-tenant credential isolation
  - Controllers:
    - `CredentialController`: Issuance (with one-time plain-text secret return), activation, device-bound verification, authorized device replacement, and revocation
  - Credential Gate verified in `CredentialGateTest` (Phase J §37):
    - Raw secret hashed and verified
    - Secret hidden from serialization and logs
    - Activation transitions status to active
    - Device binding recorded on activation
    - Second device access prohibited (`403 SECOND_DEVICE_PROHIBITED`)
    - Device replacement authorized and audited in `device_change_logs`
    - Revocation prohibits verification (`403 CREDENTIAL_REVOKED`)
    - Expired credential rejected (`403 CREDENTIAL_EXPIRED`)
    - Cross-tenant credential access rejected (404 and 401)
  - Suite: 22 tests, 288 assertions passed (100% pass)
- Documentation updates:
  - `docs/domains/credentials/README.md`
  - `docs/backend/README.md`
  - `docs/project-management/current-state.md`
  - `docs/project-management/implementation-ledger.md`

## [M7-001] - 2026-09-29
### Added
- Billing, Packages & Entitlements Domain:
  - Tenant database migration for `packages`, `package_entitlements`, `payment_requests`, `payment_review_logs`, `subscriptions`, and `entitlements` tables
  - Eloquent domain models: `Package`, `PackageEntitlement`, `PaymentRequest`, `PaymentReviewLog`, `Subscription`, and `Entitlement`
  - Invariants strictly enforced:
    - `Payment ≠ Subscription`
    - `Subscription ≠ Entitlement`
    - `Payment Approval ≠ Authentication`
    - No `student.is_paid` shortcut column; student capabilities checked via `hasEntitlement()`
  - Controllers:
    - `PackageController`: Commercial package creation and entitlement association
    - `PaymentRequestController`: Payment submission, review listing, reviewer approval, subscription activation, entitlement granting, and rejection with reason
    - `SubscriptionController`: Student subscription history inspection
    - `EntitlementController`: Active student entitlement querying
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
  - Suite: 21 tests, 253 assertions passed (100% pass)
- Documentation updates:
  - `docs/domains/billing/README.md`
  - `docs/backend/README.md`
  - `docs/project-management/current-state.md`
  - `docs/project-management/implementation-ledger.md`

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
