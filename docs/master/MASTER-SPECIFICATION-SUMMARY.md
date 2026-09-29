# MASTER SPECIFICATION — LMS PLATFORM

Status: APPROVED / AUTHORITATIVE

## 1. Product

Multi-tenant SaaS LMS + education management platform for the Gulf/Saudi market.

It supports:
- individual teachers
- educational centers/institutions
- online
- offline
- combined online + offline

## 2. UX

- Arabic RTL
- IBM Sans
- light/dark
- responsive/mobile-first
- web only
- PWA-capable
- white-label per tenant

## 3. Tenancy

Control Database + one Tenant Database per tenant.

Tenant is primarily a teacher or education center.

Tenant context is always trusted/server-resolved.

No client-supplied tenant identifier is trusted as authorization.

## 4. Identity

Global Student Identity maps to tenant-specific Student Accounts.

A student can work with multiple teachers/tenants.

Global identity does not grant cross-tenant access.

Parent accounts are tenant-scoped.

## 5. Authentication

Supported tenant-configurable modes:
- password/contact
- credential-only
- combined

Credential is not a permanent session.

## 6. Authorization

RBAC + ABAC/policy + scopes + attributes.

Backend is authoritative.

Fail closed.

## 7. Core Domains

- Identity
- Tenancy
- Authorization
- Education
- Classroom / Attendance
- Assessment
- Credentials
- Billing / Entitlements
- Analytics
- Reporting
- Communication
- Meetings
- Media
- Platform Admin
- Support
- Audit

## 8. Critical Separations

User != Student
Student != Credential
Credential != Session
Payment != Subscription
Subscription != Entitlement
Entitlement != Authentication
Authentication != Authorization
Teacher != Role
Role != Permission
Parent != Student
Course != Subscription
Attendance != Session
Video Event != Learning Progress

## 9. Billing

Initial payment methods:
- InstaPay
- Cash

Payment workflow:
Payment -> Review -> Subscription -> Entitlement -> Access

Do not use a simple `student.is_paid` flag as the source of truth.

## 10. Credentials

Credential lifecycle:
Generated -> Assigned -> Issued -> Pending Activation -> Activated -> Device Bound -> Active -> Suspended/Revoked/Expired

Secrets are hashed and never logged.

QR is an opaque representation.

## 11. Online Learning

- external video providers through adapters
- Google Meet through a provider abstraction
- video playback events separate from derived progress
- dynamic watermark may show student name, ID and contact
- web screenshot prevention is not guaranteed

## 12. Offline Learning

- branches
- classrooms
- classes
- sessions
- attendance
- QR scanning
- performance/assessment

## 13. Analytics

Standard KPIs can include:
- attendance %
- video completion
- assignment completion/delay
- exam performance
- course progress
- improvement

Custom metrics require versioned definitions.

## 14. API

REST `/api/v1`, OpenAPI target, explicit DTOs, machine-readable errors, idempotency for critical operations, provider abstraction, secure webhooks.

## 15. Frontend

Next.js + React + TypeScript.

Feature-oriented architecture.

Separate role experiences.

Thin pages, shared design system, RTL, responsive, theme, PWA boundaries, accessibility.

## 16. Testing

Layered verification with explicit tenant-isolation, security, concurrency, idempotency and critical-flow coverage.

## 17. Infrastructure

Container-ready, horizontally scalable app tier, queue workers, cache, storage, tenant DB provisioning/migrations, backups, observability and controlled deployment.

## 18. Implementation Order

M0 -> M1 -> M2 -> M3 -> M4 -> M5 -> M6 -> M7 -> M8 -> M9 -> M10 -> M11 -> M12 -> M13 -> M14

## 19. AI Governance

Before coding:
- read master + relevant docs
- inspect current implementation
- identify dependencies and scope

During:
- preserve architecture
- preserve tenant isolation
- preserve security
- avoid giant files
- no silent business-rule invention

After:
- test
- verify
- update documentation/status
- report evidence
- create ADR for architecture changes

## 20. Definition of Done

A feature is complete only when the applicable business, architecture, security, tenancy, API, frontend, testing and documentation requirements are satisfied.

IMPLEMENTED != VERIFIED != PRODUCTION_READY
