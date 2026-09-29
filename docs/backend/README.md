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
│   │   ├── Controllers/        # Thin controllers
│   │   │   └── Api/            # API v1 controllers (e.g., HealthCheckController)
│   │   └── Middleware/         # Middlewares (e.g., RequestCorrelationMiddleware)
│   ├── Models/                 # Domain/Control models
│   ├── Providers/              # Service providers
│   └── Support/                # Cross-cutting helpers (e.g., ApiResponse envelope)
├── bootstrap/                  # Application bootstrap & exception handler (app.php)
├── config/                     # Configuration files
├── database/                   # Migrations, seeders, factories
├── routes/                     # API routes (api.php prefixed /api/v1, web.php, console.php)
├── storage/                    # Logs and framework caches
├── tests/                      # Feature & Unit test suites
├── .env.example                # Standard environment configuration
├── phpunit.xml                 # PHPUnit test runner configuration
└── pint.json                   # Code style configuration (Pint)
```

---

## 3. Runtime Foundation & API Contracts (M1)

### 3.1 Request Correlation
- Every incoming request through `RequestCorrelationMiddleware` is assigned a unique `request_id` (propagating an existing `X-Request-ID` header or generating a UUIDv4).
- The `request_id` is bound to the request attributes and injected into the logging context (`Log::withContext(['request_id' => ...])`).
- The `request_id` is returned in the `X-Request-ID` response header and inside the `meta.request_id` envelope.

### 3.2 Response & Error Envelope
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

### 3.3 Centralized Exception Handling
Configured in `bootstrap/app.php`:
- `ValidationException` → 422 `VALIDATION_FAILED` with errors details map
- `AuthenticationException` → 401 `UNAUTHENTICATED`
- `AuthorizationException` → 403 `FORBIDDEN`
- `ModelNotFoundException` / `NotFoundHttpException` → 404 `RESOURCE_NOT_FOUND`
- `MethodNotAllowedHttpException` → 405 `METHOD_NOT_ALLOWED`
- `ThrottleRequestsException` → 429 `RATE_LIMIT_EXCEEDED`
- `Throwable` → 500 `INTERNAL_SERVER_ERROR` (hides internals unless `APP_DEBUG=true`)

### 3.4 Health Check Endpoint
- **URL**: `GET /api/v1/health`
- **Controller**: `App\Http\Controllers\Api\HealthCheckController`
- **Output**: Reports database and cache connectivity, application version, and environment.

---

## 4. Verification & Development Commands

From `apps/api/`:

```bash
# Check application status & boot
php artisan about

# List registered routes
php artisan route:list

# Run unit and feature tests
cmd /c "vendor\bin\phpunit"

# Check code style with Pint
cmd /c "vendor\bin\pint --test"

# Fix code style automatically
cmd /c "vendor\bin\pint"
```

---

## 5. Architectural Invariants
- Thin controllers: delegate business logic to domain/application services.
- Provider abstraction: external services (Google Meet, Vimeo, Google Drive) must sit behind adapters.
- Multi-tenancy: tenant context must be resolved server-side before accessing tenant database connections.
- Security: secrets and stack traces must never leak in production error responses or logs.
