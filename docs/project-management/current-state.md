# Current Project State

Planning/documentation phases A–K have been approved.
Milestones M0 (Repository Bootstrap), M1 (Runtime Foundation Core), M2 (Tenancy Foundation), and M3 (Identity / Authentication / Authorization) have been successfully implemented and verified.

## Current Mode

IMPLEMENTATION MODE

## Current Milestone

M3 — Identity / Authentication / Authorization (VERIFIED)  
Next Milestone: M4 — Education Core

## Current Task

M3-001 — Identity, Authentication & Authorization Core Foundation. (COMPLETED & VERIFIED)

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

## In Progress

- Preparation for M4 (Education Core: Students, Staff, Courses, Lessons, Enrollments)

## Pending

- M4 Education Core
- M5 Attendance
- M6 Assessment
- M7 Billing / Entitlements
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

- Backend Tests: `vendor/bin/phpunit` -> 17 tests, 125 assertions passed (IdentityGateTest, AuthenticationGateTest, AuthorizationGateTest, TenantIsolationTest, TenantResolutionTest, HealthCheckTest, RequestCorrelationTest, ApiExceptionHandlingTest)
- Backend Linter: `vendor/bin/pint --test` -> Passed (0 violations)
- Frontend Types: `npx tsc --noEmit` -> Passed (0 errors)
- Frontend Linter: `npm run lint` -> Passed (0 errors)
