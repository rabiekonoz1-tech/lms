# Changelog

All notable changes to this project will be documented in this file.

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
