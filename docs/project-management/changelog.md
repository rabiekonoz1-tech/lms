# Changelog

All notable changes to this project will be documented in this file.

## [M15-004] - 2026-09-30 -- GOOGLE_WORKSPACE_MEET_AND_DRIVE_INTEGRATION
### Added
- **Google OAuth Credentials & Workspace Integration**:
  - Configured Google Client ID (`978486739253-qb206lpih6c0upanrph3ed1lgvbl4ek4.apps.googleusercontent.com`) and Client Secret in `apps/api/.env`, `apps/api/config/services.php`, and `apps/web/.env`.
- **Google Meet Provider Enhancements**:
  - `apps/api/app/Domain/Integrations/Meetings/GoogleMeetProvider.php`:
    - Authentic Google Meet space code generation (`aaa-bbbb-ccc` alpha-only).
    - Intelligent meeting code and URL extraction (`extractMeetingCode`).
    - Host URL generation (`?authuser=host`) and configuration metadata binding.
  - `apps/api/app/Http/Controllers/Api/Integration/MeetingController.php`:
    - Extended validation to accept custom `meeting_code` and `meet_url`.
- **Google Drive Video Provider Enhancements**:
  - `apps/api/app/Domain/Integrations/Media/GoogleDriveVideoProvider.php`:
    - Robust file ID extraction (`extractFileId`) supporting full Google Drive sharing links (`/file/d/ID/view`, `?id=ID`, direct ID).
    - Dynamic embed URL generation (`https://drive.google.com/file/d/{id}/preview`) and playback URL.
  - `apps/api/app/Http/Controllers/Api/Integration/MediaController.php`:
    - Extended `external_id` validation to `max:1000` to support long Google Drive sharing links.
- **Teacher & Student User Interfaces**:
  - `apps/web/src/app/teacher/meetings/page.tsx`: Full Google Meet management hub for teachers (create, schedule, custom codes, direct host launch, student copy link, cancellation).
  - `apps/web/src/app/teacher/media/page.tsx`: Google Drive video library hub for teachers (link videos to courses & lessons, live preview player, sharing guide).
  - `apps/web/src/app/teacher/layout.tsx`: Added navigation links for Google Meet and Google Drive.
  - `apps/web/src/app/student/courses/page.tsx`: Embedded Google Drive lesson player with moving anti-abuse security watermark.
- **Automated Verification**:
  - `apps/api/tests/Feature/GoogleServicesIntegrationTest.php`: 4/4 tests passing verifying Meet generation, custom URL extraction, Drive file ID extraction, and embed URL endpoints.

## [M15-003] - 2026-09-30 -- PUBLIC_ECOSYSTEM_AND_ADVANCED_INTERACTIVITY
### Added
- **Public Marketing Website & Discovery**:
  - `apps/web/src/app/page.tsx`: Premium high-converting Public Landing Page with glowing ambient gradients, live platform metrics (100% DB isolation, 30s QR tokens, 1-device policy), key feature pillars grid, and 1-Click demo CTA.
  - `apps/web/src/app/register-school/page.tsx`: Self-service Institution Onboarding Wizard with institution details, slug auto-generation, administrator credentials, and immediate activation.
  - `apps/web/src/app/pricing/page.tsx`: Interactive Pricing & Plan comparison (Starter, Professional, Enterprise) with yearly/monthly billing cycle toggle.
  - `apps/web/src/app/about/page.tsx`: Mission statement, institutional privacy architecture, and vision.
  - `apps/web/src/app/contact/page.tsx`: Sales and technical support inquiry form.
  - `apps/web/src/app/terms/page.tsx`: Terms of service, DRM, and device-binding policies.
  - `apps/web/src/app/privacy/page.tsx`: Privacy policy with strict tenant database isolation guarantees.
- **Advanced Interactive Features**:
  - **Interactive AI Tutor Chatbot Drawer** (`/student/courses`): Dedicated AI assistant tab in lesson viewer with prompt suggestions ("💡 لخص لي الدرس", "❓ اختبرني بسؤال", "📝 أهم التعريفات"), real-time chat input, and context-aware educational answers.
  - **Virtual Classroom & Live Meeting Stage** (`/student/meetings`): In-browser interactive live classroom simulator with teacher webcam feed, screen sharing presentation, hand-raising counter (`✋`), audio/video toggles, and live in-meeting group chat stream.
### Verified
- **TypeScript**: `tsc --noEmit` — 0 errors, strict mode.
- **Route Status**: All 7 public routes + 20 authenticated routes returning HTTP 200 OK.
- **Backend Tests**: PHPUnit 37 tests / 407 assertions PASS.

## [M15-002] - 2026-09-30 -- INTERACTIVE_UI_AND_RELIABILITY
### Added
- **Tenant Provisioning Wizard Modal** (`/platform/tenants`):
  - Multi-step provisioning workflow for Super Admins.
  - Institution details, English slug auto-sanitization, domain binding, admin credentials, and database isolation strategy.
  - Real-time animated progress bar and step simulation (Central Registry -> Isolated Database Schema -> 10 Core Migrations -> Super User Provisioning -> JWT Secrets & SSL Binding).
  - Dynamic addition to the active tenant registry in state with direct login link generation.
- **Interactive UI Workflows**:
  - **Interactive Exam Runner** (`/student/exams`): Countdown timer, live question pagination, choice radio selection, instant scoring computation, passed/failed badge, and review answer key mode.
  - **Lesson Video & Notes Player Modal** (`/student/courses`): Embedded video player with responsive aspect ratio, lesson description, attached PDF downloads, and mark complete toggle.
  - **Dynamic QR Attendance Generator & Scanner** (`/teacher/attendance`): Live rotating QR code token generator with 30s countdown, copy link shortcut, and simulated camera QR student scan simulator with audio/visual feedback.
- **Global Error Boundaries & Resilience**:
  - `apps/web/src/app/not-found.tsx`: RTL Arabic 404 page with glowing badge, explanation, and navigation buttons.
  - `apps/web/src/app/error.tsx`: Next.js client-side error boundary with error message display, developer digest, and `reset()` retry handler.
- **Mobile Responsive Drawer Navigation**:
  - `apps/web/src/components/layout/navbar.tsx`: Mobile hamburger toggle button (`md:hidden`) with active state tracking.
  - Responsive drawer overlays and backdrop across `StudentNavLayout`, `TeacherNavLayout`, `ParentNavLayout`, and `PlatformNavLayout`.

## [M15-001] - 2026-09-30 -- FULL_FRONTEND_INTEGRATION
### Added
- **Full Next.js 16 App Router Route Groups**:
  - `(public)`: `/login` page with tenant code validation, password visibility toggle, error handling, redirect to role portal.
  - `(student)`:
    - `/student/dashboard`: Real KPI snapshots, active courses, live meetings join.
    - `/student/courses`: Course list, lesson browser, lesson duration.
    - `/student/assignments`: Real assignment list, due dates, submission form.
    - `/student/exams`: Exams catalog, points, duration, start exam action.
    - `/student/attendance`: Session history, QR scan verification, attendance status.
    - `/student/meetings`: Live meeting rooms, Google Meet / Zoom direct join.
    - `/student/grades`: Official grade transcripts, scores, percentages, approval status.
  - `(teacher)`:
    - `/teacher/dashboard`: Active courses, classes, enrolled students, pending payment approvals.
    - `/teacher/courses`: Course manager, create course modal, add lesson form.
    - `/teacher/students`: Student directory, enrollment counts, access status.
    - `/teacher/attendance`: Session attendance roster, manual & QR marking.
    - `/teacher/assessments`: Assignment & exam creator, submission grading.
    - `/teacher/payments`: Bank transfer audit, approve/reject payment requests.
    - `/teacher/credentials`: Access credentials, device binding resets, code revocation.
    - `/teacher/analytics`: Student fast-read analytics snapshots, on-demand recomputation.
  - `(parent)`:
    - `/parent/dashboard`: Children academic progress, attendance rate, assignment completion.
    - `/parent/children`: Comprehensive student file, teacher roster, discipline metrics.
  - `(platform)`:
    - `/platform/dashboard`: Multi-tenant control plane, server health check, DB isolation metrics.
    - `/platform/tenants`: Tenant registry, domain bindings, isolation DB verification.
- **API Services Layer** (`apps/web/src/lib/`):
  - `auth-api.ts`, `education-api.ts`, `attendance-api.ts`, `assessment-api.ts`, `integration-api.ts`, `billing-api.ts`, `credentials-api.ts`, `analytics-api.ts`, `token-store.ts`.
- **Role Layouts**:
  - `StudentNavLayout`, `TeacherNavLayout`, `ParentNavLayout`, `PlatformNavLayout` with persistent role navigation, badges, and logout flow.
- **Database Seeder**:
  - `DatabaseSeeder.php` with complete realistic data for tenant `almustaqbal` (courses, lessons, classes, attendance, assignments, exams, meetings, credentials, analytics).
### Verified
- **TypeScript**: `tsc --noEmit` — 0 errors, strict mode.
- **Routes Check**: All 20 application routes compiled and verified HTTP 200 OK.
- **Backend Test Suite**: PHPUnit 37 tests / 407 assertions — all passed.

## [M14-001] - 2026-09-30 -- PRODUCTION_READY
### Verified
- Production Readiness Gate (M14): 9/9 gates passed
  - **Gate 1 Pint Code Style**: PASS -- 0 violations
  - **Gate 2 PHPUnit**: PASS -- 37 tests, 407 assertions, all passed
  - **Gate 3 TypeScript**: PASS -- 0 errors, strict mode
  - **Gate 4 ESLint**: PASS -- 0 errors, 0 warnings
  - **Gate 5 Next.js Build**: PASS -- all pages generated (Turbopack 2.3s)
  - **Gate 6 Infrastructure Artefacts**: PASS -- all 10 required files present
  - **Gate 7 Artisan Commands**: PASS -- lms:health-report, lms:tenant-audit registered
  - **Gate 8 Documentation**: PASS -- all 10 required documents present
  - **Gate 9 Security Invariants**: PASS -- 9/9 invariants verified by SecurityInvariantsGateTest
- Release evidence: `docs/project-management/release-evidence.json`
- Release gate script: `scripts/release-gate.ps1`
- **Final project status: PRODUCTION_READY**

## [M13-001] - 2026-09-30
### Added
- Production Hardening (M13):
  - **Docker multi-stage images**: PHP 8.3 FPM (OPcache+JIT, non-root) and Next.js 16 standalone (non-root)
  - **Nginx reverse proxy**: TLS 1.2/1.3, HSTS preload, rate limiting (60 req/min general / 10 req/min auth), full security header suite
  - **Docker Compose production stack**: Nginx, PHP-FPM API, Queue Worker, Next.js Web, MySQL 8.4, Redis 7.4 — all with health checks and log rotation
  - **MySQL 8.4 production config**: InnoDB buffer tuning, binary log for PITR, slow query log
  - **Production secrets template**: `infrastructure/.env.production.example` — all required secrets documented
  - **AES-256-CBC backup script**: `infrastructure/scripts/backup.sh` — control DB + all tenant DBs + Redis, encrypted, 30-day retention
  - **Restore script**: `infrastructure/scripts/restore.sh` — decrypts + restores, dry-run mode, confirmation guard
  - **Deploy script**: `infrastructure/scripts/deploy.sh` — pre-flight secret validation, DB migration, config/route/view cache warm, health-check gate with auto-rollback
  - **`lms:health-report` command**: Checks DB, cache, queue depth, tenant count, config invariants — table + `--json` output
  - **`lms:tenant-audit` command**: Full tenant registry report with domain, database, user count — table + `--json` output
  - **Enhanced CI/CD** (`.github/workflows/ci.yml`): Dependency caching, `--testdox` PHPUnit output, security audit jobs (`composer audit`, `npm audit`), Docker image build+push to GHCR with SHA tags, gated production deployment job
  - **Operations runbook**: `infrastructure/RUNBOOK.md` — deployment, health monitoring, backup/restore, tenant management, incident response, rollback, secrets rotation, scaling, log access
  - **Infrastructure documentation**: `docs/infrastructure/README.md` — full stack reference
- Verification:
  - Pint: 0 violations
  - PHPUnit: 37 tests, 407 assertions — all passed

## [M12-001] - 2026-09-30
### Verified
- Full System Verification & End-to-End Gates:
  - **Backend gate suite**: `php artisan test` → 37 tests, 407 assertions — all 37 passed
    - `HealthCheckTest`, `RequestCorrelationTest`, `ApiExceptionHandlingTest`
    - `TenantResolutionTest`, `TenantIsolationTest`
    - `IdentityGateTest`, `AuthenticationGateTest`, `AuthorizationGateTest`
    - `EducationGateTest`, `AttendanceGateTest`, `AssessmentGateTest`
    - `BillingGateTest`, `CredentialGateTest`, `IntegrationGateTest`
    - `AnalyticsAndReportingGateTest`
    - `EndToEndLifecycleGateTest` (Cross-domain student lifecycle: enrollment → attendance → assessment → billing → credential)
    - `SecurityInvariantsGateTest` (Cross-tenant isolation, plain-text secret protection, default-deny authorization)
    - `TenantBackupRestoreGateTest` (Tenant DB backup/restore integrity)
  - **Backend code style**: `vendor/bin/pint --test` → 0 violations
  - **Frontend linting**: `npm run lint` → 0 errors, 0 warnings (ESLint 9)
  - **Frontend TypeScript**: `npx tsc --noEmit` → 0 errors (strict mode)
  - **Frontend production build**: `npm run build` → Next.js 16.3.7 Turbopack, 4/4 pages generated, 2.3s compile
- Documentation updates:
  - `docs/project-management/current-state.md` — M12 VERIFIED, M13 next
  - `docs/project-management/changelog.md` — M12 entry added
  - `docs/project-management/implementation-ledger.md` — M12 row added

## [M11-001] - 2026-09-30
### Added
- Frontend Foundation & Core Integration (Stream 18, Phase J §52–§55):
  - Comprehensive TypeScript domain interfaces matching backend models (`apps/web/src/types/index.ts`)
  - Pure SVG vector icon library (`apps/web/src/components/icons/index.tsx`)
  - UI Primitive component library (`Button`, `Badge`, `Card`)
  - Multi-tenant client context with live tenant switching & `X-Tenant` header synchronization (`TenantContext`)
  - Role-based persona context (`AuthContext`) with dynamic role switching (`student`, `teacher`, `parent`, `admin`)
  - Responsive RTL-first Application Shell:
    - `Navbar`: Tenant brand, health indicator, tenant switcher, role persona picker, user profile indicator
    - `Sidebar`: Dynamic role-permission filtering of navigation routes with badge highlights
  - Role-specific dynamic dashboards:
    - `StudentDashboard`: Academic metric cards, upcoming deadlines, enrolled courses, quick shortcuts
    - `TeacherDashboard`: Classroom rosters, grading queues, live session launcher, quick attendance
    - `ParentDashboard`: Multi-child switcher, children academic cards, tuition payment status, teacher notes
  - Feature domain views:
    - `CourseExplorer`: Curriculum viewer with lesson breakdown, duration, and status
    - `AttendanceView`: Live session roster and student attendance status toggling
    - `AssessmentView`: Assignments, exam submission tabs, scoring and pass/fail indicators
    - `MeetingsHub`: Virtual classroom hub for Google Meet, Zoom, and Mock adapters with instant join buttons
    - `AnalyticsHub`: Pre-aggregated read model visualization (`no heavy synchronous table scans`)
    - `ReportsHub`: Asynchronous report compilation, status tracking, and download actions
    - `CredentialsHub`: Hardware device binding management, SHA-256 hidden hash indicator, and session security
  - Strict TypeScript 5 strict mode and ESLint 9 compliance (0 errors, 0 warnings)
  - Next.js 16 App Router Turbopack optimized production build verified
- Documentation updates:
  - `docs/frontend/README.md`
  - `docs/project-management/current-state.md`
  - `docs/project-management/implementation-ledger.md`

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
