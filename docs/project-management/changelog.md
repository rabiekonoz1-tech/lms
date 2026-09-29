# Changelog

All notable changes to this project will be documented in this file.

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
