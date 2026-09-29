تمام. **Phase B هي أهم مرحلة قبل الـArchitecture** لأننا هنحوّل المنتج من "فكرة واضحة" إلى **Requirements رسمية قابلة للتنفيذ والاختبار والتتبع**.

:::writing{variant="document" id="74163" title="Phase B — Business Requirements & Functional Specification"}
# Phase B — Business Requirements & Functional Specification

**Document Status:** Draft — Pending Review  
**Previous Baseline:** Phase A — Product Definition — Approved  
**Implementation Status:** Not Started  
**Requirement Convention:** FR / NFR / BR / AC  
**Priority:** Critical / High / Medium / Future

---

# 1. Purpose

This document converts the approved Product Definition into formal business and system requirements.

It defines:

- Business Requirements
- Functional Requirements
- Non-Functional Requirements
- Business Rules
- Acceptance Criteria
- Requirement Dependencies
- Requirement Traceability

This document does not define implementation details such as exact classes, database tables, APIs, framework code, or infrastructure configuration.

Those decisions belong to downstream Architecture, Domain, Database, Security, and Infrastructure specifications.

---

# 2. Requirement Status Model

Every requirement must have one of the following states:

```text
CONFIRMED
OPEN
ASSUMED
DEFERRED
IMPLEMENTED
VERIFIED
```

A requirement cannot be considered complete merely because code exists.

It must satisfy its acceptance criteria and required tests.

---

# 3. Business Requirements

## BR-001 — Multi-Tenant Educational Platform

The platform shall provide a shared SaaS environment in which multiple independent educational tenants can operate while maintaining logical and technical isolation.

**Priority:** Critical

---

## BR-002 — Individual Teacher Tenant

The platform shall support an individual teacher operating as an independent tenant.

**Priority:** Critical

---

## BR-003 — Educational Organization Tenant

The platform shall support an educational center or organization as a tenant containing multiple teachers, assistants, students, and parents.

**Priority:** Critical

---

## BR-004 — Independent Teachers Within Organizations

Teachers operating inside the same organization shall maintain independent teaching relationships, content, classes, students, permissions, and operational data according to the configured tenant structure.

**Priority:** Critical

---

## BR-005 — Online Education

The platform shall provide a complete online education environment.

**Priority:** Critical

---

## BR-006 — Offline Education

The platform shall provide a complete offline education management environment.

**Priority:** Critical

---

## BR-007 — Hybrid Education

A tenant shall be able to use both online and offline capabilities simultaneously.

**Priority:** Critical

---

## BR-008 — Student Multi-Tenant Participation

A student shall be capable of participating in multiple teachers' or tenants' educational environments.

**Priority:** Critical

---

## BR-009 — Unified Student Experience

The platform shall provide the student with a unified dashboard through which the student can access authorized educational relationships across multiple teachers/tenants while preserving tenant-specific isolation.

**Priority:** Critical

---

## BR-010 — Tenant-Scoped Parent Accounts

Parent accounts shall be scoped to a tenant and shall not function as globally shared platform identities.

**Priority:** Critical

---

## BR-011 — Parent Multi-Student Support

A parent shall be capable of being associated with multiple students within the same tenant.

**Priority:** High

---

## BR-012 — White-Label Tenant Experience

Each tenant shall be capable of operating with its own branding, name, logo, colors, and subdomain.

**Priority:** Critical

---

## BR-013 — Configurable Tenant Authentication

The platform shall allow the platform administrator to determine which supported authentication model is available to a tenant.

**Priority:** Critical

---

## BR-014 — Access Credential System

The platform shall provide a secure access credential mechanism that may be presented to users commercially as a coupon.

**Priority:** Critical

---

## BR-015 — Device-Bound Access

The platform shall support binding an access credential to a specific device.

**Priority:** Critical

---

## BR-016 — Manual Subscription Processing

The platform shall support manually verified subscription payments.

**Priority:** Critical

---

## BR-017 — Payment Methods

The platform shall initially support:

- InstaPay
- Cash

**Priority:** Critical

---

## BR-018 — Payment Review

Payment requests shall be reviewable by authorized tenant users according to RBAC + ABAC permissions.

**Priority:** Critical

---

## BR-019 — Dynamic Authorization

The platform shall support dynamic authorization based on roles, permissions, attributes, actions, resources, and scopes.

**Priority:** Critical

---

## BR-020 — Student Attendance

The platform shall support QR-based attendance recording for offline education.

**Priority:** Critical

---

## BR-021 — Student Performance Management

The platform shall provide comprehensive student performance tracking.

**Priority:** Critical

---

## BR-022 — Custom Performance Metrics

Teachers shall be capable of defining custom performance metrics in addition to system-provided metrics.

**Priority:** High

---

## BR-023 — Parent Reporting

The platform shall provide parent-facing reports and performance information subject to authorization.

**Priority:** High

---

## BR-024 — External Video Integration

The platform shall support externally hosted educational videos through provider integrations and/or secure embedding mechanisms.

**Priority:** Critical

---

## BR-025 — Video Activity Tracking

The platform shall track relevant student video activity and learning progress.

**Priority:** Critical

---

## BR-026 — Google Meet Integration

The platform shall allow authorized users to create/manage Google Meet sessions through the configured Google Workspace integration.

**Priority:** High

---

## BR-027 — Platform Administration

The platform shall provide a separate platform-level administrative environment.

**Priority:** Critical

---

## BR-028 — Support Access

The platform shall provide a dedicated support role capable of authorized temporary tenant access.

**Priority:** High

---

## BR-029 — Auditability

Critical administrative, authentication, authorization, payment, access, and security actions shall be auditable.

**Priority:** Critical

---

## BR-030 — Documentation-Driven Engineering

The technical project shall maintain synchronized documentation describing requirements, architecture, decisions, implementation progress, and outstanding work.

**Priority:** Critical

---

# 4. Functional Requirements

# 4.1 Tenant Management

## FR-TEN-001 — Create Tenant

The system shall allow an authorized platform administrator to create a tenant.

### Acceptance Criteria

- A tenant receives a unique identity.
- A tenant type is defined.
- Tenant configuration is initialized.
- Tenant isolation context is established.
- Tenant creation is auditable.

---

## FR-TEN-002 — Tenant Types

The system shall support at minimum:

- Individual Teacher
- Educational Organization

---

## FR-TEN-003 — Tenant Configuration

Authorized administrators shall be able to configure tenant-level settings.

Settings may include:

- Branding
- Authentication mode
- Enabled modules
- Operational settings
- Access rules
- Educational settings

---

## FR-TEN-004 — Tenant Branding

The system shall support:

- Tenant name
- Logo
- Primary colors
- Branding configuration
- Subdomain

---

## FR-TEN-005 — Tenant Module Configuration

The platform shall allow supported modules to be enabled or disabled according to tenant configuration.

At minimum:

- Online
- Offline

A tenant may have:

```text
Online only
Offline only
Online + Offline
```

---

# 4.2 User and Identity Management

## FR-ID-001 — User Creation

The system shall support creation of users according to their applicable role and tenant relationship.

---

## FR-ID-002 — Student User Creation

A student account may be created before payment approval.

The student's access status shall remain subject to the payment/subscription workflow.

---

## FR-ID-003 — Student Multi-Tenant Membership

A student shall be able to have separate tenant-specific relationships with multiple teachers/organizations.

---

## FR-ID-004 — Unified Student Account Experience

The student-facing experience shall aggregate authorized tenant relationships without merging tenant-owned data into a single tenant data scope.

---

## FR-ID-005 — Parent Account

A parent account shall be created within a tenant.

---

## FR-ID-006 — Parent Multiple Children

A parent shall be able to have multiple student relationships within the same tenant.

---

# 4.3 Authentication

## FR-AUTH-001 — Traditional Authentication

The platform shall support authentication using supported contact credentials such as email and/or phone with password according to tenant configuration.

---

## FR-AUTH-002 — Access Credential Authentication

The platform shall support access through a valid access credential.

---

## FR-AUTH-003 — Combined Authentication

The platform shall support a configuration in which traditional authentication and an access credential are both required or used as configured by the tenant/platform policy.

---

## FR-AUTH-004 — Tenant Authentication Configuration

The Platform Super Admin shall be capable of configuring the authentication mode available to each tenant.

---

## FR-AUTH-005 — Secure Session Creation

Successful authentication shall create a secure application session according to the platform's security architecture.

---

## FR-AUTH-006 — Device Validation

Where device binding is enabled, access shall require the requesting device to satisfy the credential's device-binding policy.

---

# 4.4 Access Credential

## FR-CRED-001 — Credential Generation

The system shall generate unique access credentials.

---

## FR-CRED-002 — Credential Assignment

A credential shall be assignable to a specific student within a tenant.

---

## FR-CRED-003 — Tenant Access

A valid credential shall grant access to the authorized tenant according to its active access state.

---

## FR-CRED-004 — Credential QR

The system shall be capable of representing an access credential through a QR code where required.

---

## FR-CRED-005 — Credential Lifecycle

The credential system shall support lifecycle states including, at minimum:

```text
Generated
Assigned
Issued
Pending Activation
Activated
Device Bound
Active
Suspended
Revoked
Expired
```

The final state-transition model shall be defined in the Architecture and Domain specifications.

---

## FR-CRED-006 — Device Binding

A credential may be bound to one authorized device according to policy.

---

## FR-CRED-007 — Device Replacement

Authorized teachers and authorized platform administrators shall be capable of replacing a credential's bound device.

Every device replacement shall be auditable.

---

## FR-CRED-008 — Credential Security

Credentials shall not be treated as permanent authenticated sessions.

Credential validation shall result in secure authentication/session establishment according to the security architecture.

---

# 4.5 Subscription

## FR-SUB-001 — Subscription Creation

The system shall support subscription creation following an approved purchase or authorized manual activation.

---

## FR-SUB-002 — Subscription Products

The platform shall support:

- Online subscription
- Offline subscription
- Online + Offline subscription

---

## FR-SUB-003 — Subscription and Access Separation

Subscription status shall not be treated as equivalent to authentication or access.

The system shall maintain distinct concepts for:

```text
Payment
Subscription
Entitlement
Credential
Access
Session
```

---

## FR-SUB-004 — Manual Activation

Authorized tenant users shall be able to activate subscriptions manually where permitted.

---

## FR-SUB-005 — Subscription Status

Subscription lifecycle shall support states such as:

```text
Pending
Active
Suspended
Expired
Cancelled
Rejected
```

The final state machine shall be specified later.

---

# 4.6 Billing and Payment

## FR-BILL-001 — Payment Request

A student shall be able to submit a payment request.

---

## FR-BILL-002 — Payment Method

The student shall select a supported payment method.

Initial methods:

- InstaPay
- Cash

---

## FR-BILL-003 — Payment Information

The payment request may contain:

- Student name
- Email
- Phone
- Sender phone number
- Payment method
- Payment information
- Payment proof

---

## FR-BILL-004 — Payment Proof

The student shall be able to upload payment proof where required.

---

## FR-BILL-005 — Payment Review Queue

Authorized reviewers shall have access to pending payment requests.

---

## FR-BILL-006 — Payment Approval

An authorized reviewer shall be able to approve a valid payment request.

---

## FR-BILL-007 — Payment Rejection

An authorized reviewer shall be able to reject a payment request.

The system should support recording a rejection reason.

---

## FR-BILL-008 — Payment Audit

Payment approval/rejection actions shall record:

- Actor
- Timestamp
- Action
- Request
- Relevant reason/context

---

## FR-BILL-009 — WhatsApp Payment Notification

The payment workflow shall support future integration with the official WhatsApp API for payment confirmation/communication.

The integration must remain decoupled from the core billing domain.

---

# 4.7 Authorization

## FR-AUTHZ-001 — RBAC

The system shall support role-based authorization.

---

## FR-AUTHZ-002 — ABAC

The system shall support attribute-based authorization.

---

## FR-AUTHZ-003 — System Roles

The system shall provide predefined/system roles.

---

## FR-AUTHZ-004 — Custom Roles

Authorized tenant users shall be able to create/configure custom roles where permitted.

---

## FR-AUTHZ-005 — Permission Actions

Permissions shall support actions including, where applicable:

```text
View
Create
Update
Delete
Approve
Reject
Export
Grade
Manage
```

The final action catalog shall be centrally defined.

---

## FR-AUTHZ-006 — Allow/Deny/Inherit

The authorization engine shall support:

```text
Allow
Deny
Inherit
```

---

## FR-AUTHZ-007 — Resource Scope

Authorization shall support scoped access based on relevant resources and attributes.

Potential scopes include:

- Tenant
- Teacher
- Class
- Branch
- Student
- Assigned students
- Assigned classes
- Owned resources

The final scope catalog shall be defined in the authorization architecture.

---

## FR-AUTHZ-008 — Policy Enforcement

Authorization policies shall be enforced server-side.

---

## FR-AUTHZ-009 — Tenant Boundary

A valid permission within Tenant A shall not implicitly grant access to Tenant B.

---

# 4.8 Online Platform

## FR-ONLINE-001 — Courses

Teachers shall be able to create/manage courses according to permissions.

---

## FR-ONLINE-002 — Lessons

Courses shall contain lessons.

---

## FR-ONLINE-003 — Educational Content

Lessons shall support educational resources such as:

- Videos
- Files
- Assignments
- Exams
- Other supported content

---

## FR-ONLINE-004 — External Video Providers

The system shall support external video providers through an abstraction layer.

Initial candidates include:

- Google Drive
- Vimeo
- Other supported providers

---

## FR-ONLINE-005 — Video Embedding

The system shall support secure embedding where supported by the external provider.

---

## FR-ONLINE-006 — Video Progress

The system shall record supported student video activity.

Potential tracked information includes:

- Start
- Progress percentage
- Playback position
- Completion
- Last watched time
- Rewatch activity

---

## FR-ONLINE-007 — Video Anti-Abuse

The system shall provide mechanisms to detect suspicious or abnormal video consumption behavior.

---

## FR-ONLINE-008 — Dynamic Watermark

During protected video playback, the system shall support displaying:

- Student Name
- Student ID
- Student Contact Number

as dynamic watermark information.

---

## FR-ONLINE-009 — Assignments

Teachers shall be able to create assignments.

Students shall be able to submit assignments.

---

## FR-ONLINE-010 — Exams

Teachers shall be able to create examinations.

Students shall be able to take authorized examinations.

---

## FR-ONLINE-011 — Grading

Authorized users shall be able to grade supported assessments.

---

## FR-ONLINE-012 — Live Meetings

Authorized users shall be able to create/manage Google Meet sessions through the configured Google Workspace integration.

---

# 4.9 Offline Platform

## FR-OFFLINE-001 — Branches

The system shall support branches for applicable educational organizations.

---

## FR-OFFLINE-002 — Classrooms

The system shall support classrooms within applicable branches.

---

## FR-OFFLINE-003 — Classes

The system shall support classes associated with teachers/students.

---

## FR-OFFLINE-004 — Sessions

The system shall support individual educational sessions.

---

## FR-OFFLINE-005 — Attendance Modes

The system shall support configurable attendance modes including:

- Open
- Scheduled
- Session-based

---

## FR-OFFLINE-006 — QR Attendance

Authorized assistants shall be able to scan student QR codes to record attendance.

---

## FR-OFFLINE-007 — Mobile Attendance UX

The attendance scanning workflow shall be optimized for mobile web usage.

---

## FR-OFFLINE-008 — Attendance Validation

Attendance recording shall validate:

- Tenant
- Student
- Session
- Assistant permission
- Attendance rules

before creating an attendance record.

---

# 4.10 Analytics

## FR-ANALYTICS-001 — Standard KPIs

The platform shall support standard student performance KPIs.

Potential KPIs include:

- Attendance
- Exam performance
- Assignment completion
- Assignment delay
- Video completion
- Course progress
- Learning activity
- Improvement rate

---

## FR-ANALYTICS-002 — Custom KPIs

Authorized teachers shall be able to define custom performance metrics.

---

## FR-ANALYTICS-003 — Metric Definitions

Custom metrics shall contain a documented definition and calculation behavior.

---

## FR-ANALYTICS-004 — Historical Performance

The system shall support tracking student performance over time.

---

# 4.11 Parent Platform

## FR-PARENT-001 — Parent Dashboard

Parents shall have access to a dedicated dashboard within their tenant.

---

## FR-PARENT-002 — Multiple Children

Parents shall be able to switch between authorized students associated with their account.

---

## FR-PARENT-003 — Student Performance

Parents shall be able to view authorized student performance information.

---

## FR-PARENT-004 — Attendance Reports

Parents shall be able to view authorized attendance information.

---

## FR-PARENT-005 — Academic Reports

Parents shall be able to view authorized academic reports.

---

# 4.12 Reporting

## FR-REPORT-001 — Student Reports

The system shall generate student reports.

---

## FR-REPORT-002 — Parent Reports

The system shall generate parent-facing reports.

---

## FR-REPORT-003 — Report Data Scope

Reports shall only contain information the requesting user is authorized to access.

---

## FR-REPORT-004 — Future WhatsApp Delivery

The reporting system shall support future delivery through the official WhatsApp API.

---

# 4.13 Platform Administration

## FR-ADMIN-001 — Global Tenant Dashboard

The Super Admin shall be able to view tenant-level operational metrics.

Potential metrics:

- Tenant count
- Student count
- Teacher count
- Assistant count
- Usage
- Storage consumption
- Activity
- Subscription metrics
- Platform usage

---

## FR-ADMIN-002 — Tenant Privacy

Global visibility shall not automatically grant unrestricted access to private tenant content.

---

## FR-ADMIN-003 — Support Access

Authorized Support users shall be able to access a tenant temporarily for support purposes.

---

## FR-ADMIN-004 — Support Audit

Every support access session shall be auditable.

---

# 4.14 Notifications

## FR-NOTIFY-001 — In-App Notifications

The system shall support in-app notifications.

---

## FR-NOTIFY-002 — Email

The system shall support email delivery through SMTP.

---

## FR-NOTIFY-003 — WhatsApp

The system architecture shall support future integration with the official WhatsApp API.

---

# 5. Non-Functional Requirements

# 5.1 Security

## NFR-SEC-001

Security shall be enforced primarily server-side.

## NFR-SEC-002

Tenant data must be isolated.

## NFR-SEC-003

Authentication sessions must be securely managed.

## NFR-SEC-004

Authorization must be checked for every protected operation.

## NFR-SEC-005

Access credentials must not be treated as permanent sessions.

## NFR-SEC-006

Sensitive operations must be auditable.

## NFR-SEC-007

The system must implement rate limiting for security-sensitive endpoints.

## NFR-SEC-008

Video access must use appropriate provider-supported security controls.

## NFR-SEC-009

Dynamic watermarking must be supported for protected educational video.

## NFR-SEC-010

The platform must implement defenses against unauthorized tenant data access.

---

# 5.2 Performance

## NFR-PERF-001

Interactive dashboards should provide responsive user experience under expected operating load.

## NFR-PERF-002

QR attendance operations should be optimized for rapid mobile interaction.

## NFR-PERF-003

Long-running operations should not block synchronous user requests unnecessarily.

## NFR-PERF-004

Background processing should be used where appropriate.

---

# 5.3 Scalability

## NFR-SCALE-001

The architecture shall support approximately 100–1,000 tenants as an initial target range.

## NFR-SCALE-002

The architecture shall support future growth beyond the initial target without requiring a fundamental rewrite.

## NFR-SCALE-003

Tenant database architecture shall be capable of evolving according to tenant size.

## NFR-SCALE-004

The system shall support horizontal application scaling where required.

## NFR-SCALE-005

Background processing shall be horizontally scalable.

---

# 5.4 Availability and Reliability

## NFR-REL-001

Critical application data shall be backed up.

## NFR-REL-002

Database backup and restoration procedures shall be documented and tested.

## NFR-REL-003

Critical background jobs shall support safe retry behavior.

## NFR-REL-004

The system shall provide mechanisms for detecting operational failures.

---

# 5.5 Maintainability

## NFR-MAIN-001

The codebase shall follow SOLID principles.

## NFR-MAIN-002

The system shall use clearly documented architectural boundaries.

## NFR-MAIN-003

God Classes and God Components shall be prohibited.

## NFR-MAIN-004

New dependencies shall require architectural justification.

## NFR-MAIN-005

Business logic shall not be unnecessarily coupled to external providers.

---

# 5.6 Internationalization and UX

## NFR-UX-001

The primary user interface shall be Arabic RTL.

## NFR-UX-002

The platform shall use IBM Sans as the primary interface font.

## NFR-UX-003

The interface shall support Light Mode.

## NFR-UX-004

The interface shall support Dark Mode.

## NFR-UX-005

The web application shall be responsive across desktop, tablet, and mobile.

## NFR-UX-006

The application shall support PWA/Add-to-Home-Screen behavior where appropriate.

---

# 5.7 White Label

## NFR-WL-001

Tenant branding must be isolated between tenants.

## NFR-WL-002

Tenant branding changes must not require code deployment.

## NFR-WL-003

Tenant subdomains must resolve to the correct tenant context.

---

# 5.8 Observability

## NFR-OBS-001

The platform shall provide centralized application logging.

## NFR-OBS-002

Critical operations shall be traceable.

## NFR-OBS-003

Security-sensitive events shall be auditable.

## NFR-OBS-004

Background job failures shall be observable.

---

# 6. Business Rules

## BRULE-001 — Tenant Context

Every tenant-owned operation must execute within a valid tenant context.

---

## BRULE-002 — Tenant Isolation

Tenant A must never gain access to Tenant B data merely because both tenants operate on the same platform.

---

## BRULE-003 — Student Multi-Tenant Relationships

A student may have relationships with multiple tenants.

Each relationship must preserve tenant-specific ownership and permissions.

---

## BRULE-004 — Parent Scope

A parent account is scoped to a single tenant.

---

## BRULE-005 — Credential Scope

An access credential is associated with a specific tenant and student relationship.

---

## BRULE-006 — Credential Does Not Equal Session

Possession of a credential must not directly represent a long-lived authenticated session.

---

## BRULE-007 — Device Binding

Where device binding is enabled, the credential can only be used from an authorized device.

---

## BRULE-008 — Device Replacement

Only authorized teacher/platform administrative users may change a device binding.

---

## BRULE-009 — Payment Does Not Equal Activation

Submitting payment proof does not automatically grant educational access.

---

## BRULE-010 — Approval Required

A payment request must be approved by an authorized reviewer before the associated subscription/access is activated when manual approval is required.

---

## BRULE-011 — Authorization

Permission to perform an action must be evaluated against the applicable role, attributes, resource, scope, and tenant context.

---

## BRULE-012 — Deny Precedence

Where the authorization model produces conflicting explicit Allow and Deny rules, the final authorization architecture must define deterministic precedence.

---

## BRULE-013 — Inheritance

Inherited permissions must be resolved deterministically and must not bypass explicit restrictions.

---

## BRULE-014 — Teacher Authority

The tenant owner/teacher has broad tenant management capabilities subject to platform-level constraints.

---

## BRULE-015 — Assistant Authority

Assistants only receive the permissions and scopes assigned to them.

---

## BRULE-016 — Online/Offline Independence

Online and Offline capabilities may be enabled independently.

---

## BRULE-017 — Unified Student Dashboard

The student's unified dashboard may aggregate authorized relationships but must not merge ownership boundaries between tenants.

---

## BRULE-018 — Video Ownership

External video content remains hosted by the configured provider unless future storage architecture explicitly changes this behavior.

---

## BRULE-019 — Video Watermark

Protected video playback should display the configured student identification watermark.

---

## BRULE-020 — Attendance Integrity

Attendance records must identify the applicable tenant, student, class/session, actor, and timestamp.

---

## BRULE-021 — Parent Visibility

Parents may only view student information permitted by tenant configuration and authorization policies.

---

## BRULE-022 — Custom Metrics

Custom performance metrics must not modify core system behavior unpredictably.

They must operate through a controlled metric-definition model.

---

## BRULE-023 — Platform Admin Privacy

Global platform visibility does not automatically imply unrestricted access to tenant-private educational data.

---

## BRULE-024 — Support Access

Temporary support access must be explicitly authorized and auditable.

---

## BRULE-025 — Documentation Synchronization

Any implementation change affecting requirements, architecture, security, database structure, or behavior must update the corresponding documentation.

---

# 7. Acceptance Criteria Framework

Every implementation requirement must eventually satisfy:

```text
Requirement
    ↓
Expected Behavior
    ↓
Positive Test
    ↓
Negative Test
    ↓
Authorization Test
    ↓
Tenant Isolation Test
    ↓
Security Test where applicable
    ↓
Documentation Updated
```

A feature is not considered complete merely because its primary happy path works.

---

# 8. Cross-Cutting Acceptance Criteria

## AC-001 — Tenant Isolation

A user belonging to Tenant A cannot access Tenant B protected resources unless an explicitly authorized platform-level support operation permits it.

---

## AC-002 — Permission Enforcement

Removing a permission must prevent the associated action at the backend level regardless of frontend behavior.

---

## AC-003 — Device Binding

A credential bound to Device A must not automatically authenticate Device B.

---

## AC-004 — Payment Approval

A pending payment must not activate protected access unless the applicable activation rule has been satisfied.

---

## AC-005 — Unified Student Dashboard

A student with relationships to multiple tenants can view authorized information from each relationship without exposing unauthorized tenant data.

---

## AC-006 — Parent Isolation

A parent from Tenant A cannot access a student relationship belonging to Tenant B merely because the same person or phone number exists elsewhere.

---

## AC-007 — Support Access

Support access must produce an auditable record containing the relevant support actor and access context.

---

## AC-008 — Video Protection

Protected video playback must enforce the configured access checks before content is made available.

---

## AC-009 — Attendance

An attendance scan must fail if the scanning user lacks permission for the applicable attendance operation.

---

## AC-010 — Documentation

A completed feature must have its relevant requirement, implementation status, and documentation state updated.

---

# 9. Requirement Priority Model

## Critical

Required for the foundational product and Phase Zero architecture.

Examples:

- Multi-tenancy
- Authentication
- Authorization
- Credential system
- Subscription
- Payment workflow
- Online/Offline
- Tenant isolation
- Student identity
- Database isolation
- Security

## High

Required for the first production-ready release.

Examples:

- Parent dashboard
- Analytics
- Custom KPIs
- Google Meet
- Reporting
- White labeling
- Video tracking

## Medium

Can follow the initial production foundation.

Examples:

- Advanced notification behavior
- Advanced analytics
- Additional providers

## Future

Capabilities intentionally deferred.

Examples:

- Native mobile applications
- Additional payment providers
- Additional communication providers
- Advanced video infrastructure
- Future platform expansion

---

# 10. Requirements Traceability Model

Every requirement must eventually map to:

```text
Requirement ID
    ↓
Business Rule
    ↓
Domain
    ↓
Architecture Component
    ↓
Database Model
    ↓
API / Application Use Case
    ↓
Frontend Feature
    ↓
Automated Tests
```

Example:

```text
FR-OFFLINE-006
QR Attendance

        ↓

BRULE-020
Attendance Integrity

        ↓

Attendance Domain

        ↓

Attendance Application Service

        ↓

Attendance Persistence Model

        ↓

Attendance API

        ↓

Assistant QR Scanner UI

        ↓

Unit + Integration + Authorization + E2E Tests
```

---

# 11. Requirements Change Policy

Once a requirement becomes `CONFIRMED`, downstream documents must treat it as authoritative.

If a later business decision requires changing it:

1. Identify the affected requirement.
2. Record the change.
3. Record the reason.
4. Identify impacted architecture.
5. Identify impacted database/domain models.
6. Identify impacted security rules.
7. Identify impacted tests.
8. Update documentation.
9. Revalidate affected requirements.

No architectural implementation should silently change a confirmed business requirement.

---

# 12. Phase B Completion Criteria

Phase B is complete when:

- Business requirements are documented.
- Functional requirements are documented.
- Non-functional requirements are documented.
- Business rules are documented.
- Acceptance criteria are documented.
- Requirement IDs are established.
- Priorities are established.
- Cross-cutting requirements are documented.
- Traceability rules are established.
- Open decisions are explicitly separated from confirmed requirements.

---

# 13. Current Open Decisions

The following are intentionally deferred to later phases:

1. Exact subscription plan schema.
2. Exact subscription lifecycle/state machine.
3. Exact entitlement model.
4. Exact credential state-transition rules.
5. Exact device replacement limits.
6. Exact parent authentication flow.
7. Exact role/permission catalog.
8. Exact ABAC attribute model.
9. Exact permission precedence between Allow/Deny/Inherit.
10. Exact video provider contract.
11. Exact video anti-abuse algorithm.
12. Exact KPI calculation formulas.
13. Exact infrastructure topology.
14. Exact database provisioning strategy.
15. Exact performance thresholds.
16. Exact disaster recovery targets.
17. Exact notification event catalog.
18. Exact WhatsApp workflow.
19. Exact Google Meet OAuth/service-account architecture.
20. Exact support impersonation implementation.

These are not missing requirements; they are intentionally reserved for the appropriate downstream specification phase.
:::

**كده Phase B عندنا أصبحت قاعدة الـRequirements الرسمية.** والأهم فيها إننا فصلنا بوضوح بين:

**Business Requirement → Functional Requirement → Business Rule → Acceptance Criteria → Test لاحقًا.**

وده هيخلينا لما نوصل للـERD والـArchitecture نقدر نثبت إن كل قرار تقني له سبب راجع لاحتياج حقيقي.

المرحلة التالية ستكون **Phase C — Architecture Specification**، ودي مش هنبدأ فيها بكتابة Folder Structure وخلاص؛ هنبدأ أولًا بتحديد **Architectural Principles + System Boundaries + Domains + Control Plane/Data Plane + Tenant Resolution + Identity Architecture**، وبعدها ننزل تدريجيًا للـBackend والـFrontend والـPatterns.

وبحسب اتفاقنا، Phase B تظل **Draft** لحد ما تقول إنها معتمدة.