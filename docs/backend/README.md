# Backend Documentation

## 1. Overview
The backend application is built with **Laravel 13** on **PHP 8.3**, adhering strictly to clean modular architecture principles and domain boundaries defined in `docs/master/MASTER-SPECIFICATION.md` and `AGENTS.md`.

- **Location**: `apps/api/`
- **PHP Version**: 8.3.35+
- **Laravel Framework**: 13.34.0
- **API Prefix**: `/api/v1`
- **Test Framework**: PHPUnit 11
- **Code Style & Linting**: Laravel Pint

---

## 2. Directory Structure

```text
apps/api/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── Auth/       # LoginController, MeController, LogoutController
│   │   │       ├── HealthCheckController.php
│   │   │       └── TenantCurrentController.php
│   │   └── Middleware/         # RequestCorrelation, TenantResolution, TenantAuthenticate, TenantAuthorize
│   ├── Models/                 # Tenant, GlobalIdentity, TenantUser, Student, Staff, Role, Permission, etc.
│   ├── Providers/              # AppServiceProvider
│   ├── Support/                # ApiResponse envelope helper
│   └── Tenancy/                # TenantContext, TenantResolver, TenantDatabaseManager
├── bootstrap/                  # Application bootstrap & exception handler (app.php)
├── config/                     # Configuration files (database.php with control + tenant connections)
├── database/
│   └── migrations/             # Control plane migrations
│       └── tenant/             # Tenant database migrations (users, auth, courses)
├── routes/                     # API routes (api.php prefixed /api/v1, web.php, console.php)
├── storage/                    # Logs and framework caches
├── tests/                      # Feature & Unit test suites
├── .env.example                # Standard environment configuration
├── phpunit.xml                 # PHPUnit test runner configuration
└── pint.json                   # Code style configuration (Pint)
```

---

## 3. Education Core Domain (M4)

- **Domain Models (Tenant Database)**:
  - `Course`: Represents educational course owned/taught by `Staff` (teacher), containing `Lesson`s and `Enrollment`s.
  - `Lesson`: Unit of educational content belonging to a `Course`, ordered by `sort_order`.
  - `Enrollment`: Distinct participation entity linking `Student` to `Course` (`Course ≠ Subscription`, `Enrollment ≠ Payment`).
- **Invariants Enforced**:
  - `User ≠ Student`
  - `Teacher ≠ Role`
  - `Course ≠ Subscription`
  - `Enrollment ≠ Payment`
  - `Failures default to deny` (SEC-INV-009)
  - Strict cross-tenant isolation (SEC-INV-001)
- **Controllers**:
  - `App\Http\Controllers\Api\Education\CourseController`
  - `App\Http\Controllers\Api\Education\LessonController`
  - `App\Http\Controllers\Api\Education\EnrollmentController`
  - `App\Http\Controllers\Api\Education\StudentController`
- **Education Gate Verified**: Proven via `EducationGateTest` with full lifecycle (Teacher creates course & lessons, Student enrolls and views, cross-tenant isolation verified, Assistant permissions enforced).

## 4. Classroom & Attendance Domain (M5)

- **Domain Models (Tenant Database)**:
  - `Branch`: Optional/organizational physical branch containing classrooms.
  - `Classroom`: Room resource belonging to a branch with student capacity.
  - `SchoolClass`: Academic class taught by `Staff` (teacher) containing enrolled students (`class_students`).
  - `ClassSession`: Scheduled occurrence of a class (`Attendance ≠ Session`).
  - `AttendanceRecord`: Student attendance status (`present`, `absent`, `late`, `excused`) and mode (`manual`, `qr`).
- **Invariants Enforced**:
  - `Attendance ≠ Session`
  - `Failures default to deny` (SEC-INV-009)
  - Strict cross-tenant isolation (SEC-INV-001)
- **Controllers**:
  - `App\Http\Controllers\Api\Attendance\ClassController`
  - `App\Http\Controllers\Api\Attendance\SessionController`
  - `App\Http\Controllers\Api\Attendance\AttendanceController`
- **Attendance Gate Verified**: Proven via `AttendanceGateTest` (teacher creates class, creates session, records manual attendance, assistant scans student QR code, generates attendance summary report, and verifies cross-tenant isolation).

---

## 5. Assessment Domain (M6)

- **Domain Models (Tenant Database)**:
  - `Assignment`: Course/lesson learning task with points and `due_at` deadline.
  - `AssignmentSubmission`: Student submission with late arrival tracking (`is_late`), scoring, and feedback.
  - `Exam`: Timed evaluation with question pool, points, and grade publication toggle.
  - `Question`: Question item supporting multiple choice, essay, and true/false types with options and point values.
  - `ExamAttempt`: Student lifecycle of exam sitting (`started_at`, `submitted_at`, `status`).
  - `ExamAnswer`: Student answer recording with auto/manual point awards.
  - `Grade`: Independent grade record with student reference, gradable reference, score, max score, percentage, and controlled publication state (`is_published`).
- **Invariants Enforced**:
  - `Assessment ownership belongs to tenant`
  - `Grade model independence`
  - `Controlled grade publication`
  - `Failures default to deny` (SEC-INV-009)
  - Strict cross-tenant isolation (SEC-INV-001)
- **Controllers**:
  - `App\Http\Controllers\Api\Assessment\AssignmentController`
  - `App\Http\Controllers\Api\Assessment\ExamController`
  - `App\Http\Controllers\Api\Assessment\GradeController`
- **Assessment Gate Verified**: Proven via `AssessmentGateTest` (assignment submission, deadline check, late submission flagging, duplicate submission rejection, exam start, duplicate attempt rejection, answer recording, exam submit, teacher grading, controlled grade publication, permission enforcement, and tenant isolation).

---

## 6. Identity, Authentication & Authorization (M3)

- **Global Student Identity**: Control plane model (`GlobalIdentity`) linking across tenants via `StudentIdentityLink`.
- **Invariants Enforced**:
  - `User ≠ Student`
  - `Teacher ≠ Role`
  - `Parent ≠ Student`
  - `Global Identity ≠ Tenant Authorization` (SEC-INV-006)
- **Authentication**: Bearer tokens (`TenantToken`) with hash security (`SEC-INV-008`).
  - Endpoints: `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`.
- **Authorization**: Granular RBAC permissions with default deny (`SEC-INV-009`) via `tenant.can:<permission>` middleware.

---

## 7. Tenancy Foundation (M2)

- **Control Plane**: Manages tenant registry, domain mappings, feature flags, and database allocation.
- **Dynamic Database Switching**: Managed by `App\Tenancy\TenantDatabaseManager` via connection `'tenant'`.
- **Tenant Context**: Request-scoped singleton `App\Tenancy\TenantContext`.
- **Tenant Resolver**: Resolves tenant by domain, subdomain, or `X-Tenant-Slug` / `X-Tenant-ID` headers.
- **Tenant Gate Verified**: Isolated tenant database execution proven by `TenantIsolationTest`.

---

## 8. Runtime Foundation & API Contracts (M1)

### 8.1 Request Correlation
- Every incoming request through `RequestCorrelationMiddleware` is assigned a unique `request_id` (propagating an existing `X-Request-ID` header or generating a UUIDv4).
- The `request_id` is bound to the request attributes and injected into the logging context (`Log::withContext(['request_id' => ...])`).
- The `request_id` is returned in the `X-Request-ID` response header and inside the `meta.request_id` envelope.

### 8.2 Response & Error Envelope
All API endpoints under `/api/v1` return standardized JSON envelopes matching the approved Phase F specification:

**Success**:
```json
{
  "data": {},
  "meta": {
    "request_id": "...",
    "timestamp": "..."
  }
}
```

**Error**:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": {}
  },
  "meta": {
    "request_id": "...",
    "timestamp": "..."
  }
}
```

### 8.3 Centralized Exception Handling
Configured in `bootstrap/app.php`:
- `TenantNotFoundException` → 404 `TENANT_NOT_FOUND`
- `TenantInactiveException` → 403 `TENANT_INACTIVE`
- `ValidationException` → 422 `VALIDATION_FAILED` with errors details map
- `AuthenticationException` → 401 `UNAUTHENTICATED`
- `AuthorizationException` → 403 `FORBIDDEN`
- `ModelNotFoundException` / `NotFoundHttpException` → 404 `RESOURCE_NOT_FOUND`
- `MethodNotAllowedHttpException` → 405 `METHOD_NOT_ALLOWED`
- `ThrottleRequestsException` → 429 `RATE_LIMIT_EXCEEDED`
- `Throwable` → 500 `INTERNAL_SERVER_ERROR` (hides internals unless `APP_DEBUG=true`)

### 8.4 Health Check Endpoint
- **URL**: `GET /api/v1/health`
- **Controller**: `App\Http\Controllers\Api\HealthCheckController`
- **Output**: Reports database and cache connectivity, application version, and environment.

---

## 9. Verification & Development Commands

From `apps/api/`:

```bash
# Check application status & boot
php artisan about

# List registered routes
php artisan route:list

# Run migrations
php artisan migrate

# Run unit and feature tests
cmd /c "vendor\bin\phpunit"

# Check code style with Pint
cmd /c "vendor\bin\pint --test"

# Fix code style automatically
cmd /c "vendor\bin\pint"
```
