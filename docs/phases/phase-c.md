تمام يا باشا. دي **Phase C — Architecture Specification**، وهي أول مرحلة هنثبت فيها الشكل الهندسي الحقيقي للمشروع. أنا هنا متعمد أفصل بين **Architecture Decisions المعتمدة من كلامك** وبين **Architecture Decisions المقترحة** التي تحتاج اعتمادك، عشان ما ندخلش قرار افتراضي بالغلط في باقي المراحل.

:::writing{variant="document" id="91642" title="Phase C — Architecture Specification"}
# Phase C — Architecture Specification

**Document Status:** Draft — Pending Review  
**Previous Baseline:** Phase A — Approved / Phase B — Approved  
**Implementation Status:** Not Started  
**Architecture Style:** Domain-Oriented Modular Monolith with Clean/Hexagonal Boundaries  
**Backend:** Laravel  
**Frontend:** Next.js + React + TypeScript  
**Database:** PostgreSQL  
**Deployment Model:** Web Application / PWA-capable  
**Tenant Model:** Multi-Tenant / Multi-Database  
**Primary UI Language:** Arabic RTL  
**Primary UI Font:** IBM Sans

---

# 1. Architecture Goals

The system shall be designed to achieve:

1. Strong tenant isolation.
2. Clear separation of business domains.
3. Strong object-oriented design.
4. SOLID compliance.
5. Low coupling.
6. High cohesion.
7. Easy onboarding for developers.
8. AI-friendly project structure.
9. Testability.
10. Security by design.
11. Scalability without premature microservices complexity.
12. Provider-independent integrations.
13. Clear backend/frontend boundaries.
14. Strong documentation and architectural traceability.
15. Ability to evolve from small teacher tenants to large educational organizations.

---

# 2. Primary Architectural Decision

## ARCH-001 — Modular Monolith First

The initial product shall use a **Modular Monolith** rather than a distributed microservices architecture.

The application shall consist of strongly isolated business modules inside a single deployable backend.

Conceptually:

```text
                    Application
                        │
        ┌───────────────┼────────────────┐
        │               │                │
     Module A        Module B         Module C
        │               │                │
     Domain          Domain           Domain
        │               │                │
 Application      Application      Application
        │               │                │
 Infrastructure   Infrastructure   Infrastructure
```

### Reason

The expected initial tenant range is approximately 100–1,000 tenants, while the product is expected to evolve significantly.

A modular monolith provides:

- Strong domain separation
- Easier deployment
- Lower operational complexity
- Easier local development
- Easier AI-assisted development
- Centralized transactions where appropriate
- A future path toward service extraction

The architecture must allow a module to be extracted later without requiring a redesign of the whole system.

---

# 3. Architectural Philosophy

The codebase shall follow:

```text
High Cohesion
+
Low Coupling
+
Explicit Boundaries
+
Dependency Inversion
+
Composition over unnecessary inheritance
+
Single Responsibility
+
Explicit Domain Rules
```

Inheritance may be used where a genuine parent/child abstraction exists.

Inheritance shall not be used merely to make the code appear object-oriented.

---

# 4. System-Level Architecture

The platform shall be divided into:

```text
                         PLATFORM
                            │
               ┌────────────┴────────────┐
               │                         │
          CONTROL PLANE              TENANT DATA PLANE
               │                         │
      Platform Administration      Tenant Applications
      Tenant Registry              Teacher
      Platform Config              Assistants
      Global Metrics               Students
      Support                      Parents
      Identity Registry            Education Data
      Feature Configuration        Billing
                                   Attendance
                                   Analytics
```

---

# 5. Control Plane

The Control Plane is owned by the platform operator.

It is responsible for global platform concerns.

## Primary responsibilities

- Tenant registry
- Tenant provisioning
- Tenant status
- Tenant type
- Tenant subdomain
- Tenant branding metadata
- Tenant module configuration
- Tenant authentication configuration
- Platform-level plans/configuration
- Platform-level usage metrics
- Platform administration
- Platform support
- Platform audit
- Global identity mapping required for unified student experience
- Infrastructure/tenant database metadata
- Platform feature flags

The Control Plane must not become a container for tenant-owned business data.

---

# 6. Tenant Data Plane

Each tenant contains its own business data.

Typical tenant data includes:

```text
Teachers
Assistants
Students
Parents
Courses
Lessons
Videos / Video References
Assignments
Exams
Grades
Classes
Branches
Classrooms
Sessions
Attendance
Performance Metrics
Subscriptions
Payments
Entitlements
Access Credentials
Devices
Reports
Tenant Notifications
Tenant Audit Data
```

Tenant-owned data must be isolated from other tenants.

---

# 7. Multi-Database Architecture

The platform shall use:

```text
Control Database
        +
Tenant Database per Tenant
```

Conceptually:

```text
                 Control DB
                     │
        ┌────────────┼────────────┐
        │            │            │
    Tenant A      Tenant B     Tenant C
       DB            DB           DB
```

The initial architecture shall support a PostgreSQL deployment in which each tenant has an isolated database.

The system must not assume that every tenant will permanently remain on the same database infrastructure.

Future evolution may include:

```text
Small Tenant
    ↓
Shared PostgreSQL Infrastructure

Large Tenant
    ↓
Dedicated PostgreSQL Database

Very Large Tenant
    ↓
Dedicated PostgreSQL Cluster / Infrastructure
```

The tenant provisioning system must therefore abstract database location from business logic.

---

# 8. Tenant Resolution

Every incoming tenant request must be resolved into an explicit Tenant Context.

Possible tenant resolution inputs include:

- Subdomain
- Tenant identifier
- Authenticated membership
- Access Credential
- Support session

Conceptually:

```text
Request
  ↓
Tenant Resolver
  ↓
Validate Tenant
  ↓
Load Tenant Context
  ↓
Authorize Request
  ↓
Access Tenant Data
```

No tenant-scoped operation may occur without an explicit resolved tenant context.

---

# 9. Tenant Context Rule

Tenant context shall be treated as a security boundary.

Business components must never trust a tenant identifier supplied by the client without validating it against the authenticated identity and authorization context.

The backend must remain the authoritative source of tenant scope.

---

# 10. Student Identity Architecture

## ARCH-010 — Unified Student Experience

The platform must support a student's participation in multiple teachers/tenants while preserving tenant-specific student accounts and data.

The architecture shall separate:

```text
Global Identity
        +
Tenant Student Account
        +
Tenant Membership
        +
Tenant Access
```

Conceptually:

```text
                 Student Global Identity
                          │
            ┌─────────────┼─────────────┐
            │             │             │
       Tenant A        Tenant B      Tenant C
            │             │             │
      Student A      Student B     Student C
       Account        Account       Account
```

The global identity exists only to provide the unified platform experience and identity mapping.

The authoritative educational data remains tenant-owned.

The platform must not merge tenant academic records into a shared global academic database.

---

# 11. Parent Identity Architecture

Parent accounts are explicitly tenant-scoped.

Conceptually:

```text
Tenant A
   │
 Parent A
   ├── Student 1
   ├── Student 2
   └── Student 3
```

The same phone number may theoretically appear in another tenant without automatically granting access to that tenant.

Parent authentication and authorization must always resolve tenant context.

---

# 12. Core Domain Modules

The backend shall be organized around clearly defined domains.

Recommended primary domains:

```text
01. Identity & Access
02. Tenancy
03. Authorization
04. Education
05. Classroom & Attendance
06. Assessment
07. Enrollment & Access Credentials
08. Subscription & Billing
09. Analytics & Performance
10. Reporting
11. Communication
12. Meetings
13. Media / Video
14. Platform Administration
15. Support
16. Audit
```

The exact domain boundaries may be refined during Domain Model design, but business logic must remain modular.

---

# 13. Identity & Access Domain

Responsibilities:

- Authentication
- User identity
- Session management
- Credentials
- Device recognition
- Tenant access resolution
- Login policies
- Access verification

This domain shall not directly implement course logic, attendance logic, billing logic, or reporting logic.

---

# 14. Tenancy Domain

Responsibilities:

- Tenant registration
- Tenant lifecycle
- Tenant type
- Tenant configuration
- Tenant status
- Tenant branding metadata
- Tenant module configuration
- Tenant provisioning metadata

---

# 15. Authorization Domain

This domain is responsible for:

```text
RBAC
+
ABAC
+
Policies
+
Permissions
+
Scopes
+
Allow/Deny/Inherit
```

Authorization shall not be hardcoded into individual controllers or UI components.

---

# 16. Education Domain

Responsibilities:

- Courses
- Lessons
- Educational resources
- Learning structures
- Content organization
- Course enrollment
- Academic structure

---

# 17. Classroom & Attendance Domain

Responsibilities:

- Branch
- Classroom
- Class
- Session
- Attendance configuration
- QR attendance
- Attendance records
- Attendance policies

---

# 18. Assessment Domain

Responsibilities:

- Exams
- Questions
- Attempts
- Assignments
- Submissions
- Grading
- Results

---

# 19. Enrollment & Access Credential Domain

This domain manages:

- Access Credential generation
- Assignment
- Activation
- Tenant access
- Credential QR
- Credential lifecycle
- Device binding
- Device replacement
- Credential revocation
- Credential expiration

The commercial word "Coupon" should not determine internal architectural naming.

Internally, the primary abstraction shall be an:

**Access Credential**

---

# 20. Subscription & Billing Domain

The domain shall keep the following concepts separate:

```text
Payment
Subscription
Entitlement
Access Credential
Authentication Session
```

The relationships shall conceptually be:

```text
Payment
  ↓
Review
  ↓
Subscription
  ↓
Entitlement
  ↓
Access
```

Billing shall remain tenant-aware.

---

# 21. Analytics & Performance Domain

Responsibilities:

- Standard KPIs
- Custom KPIs
- Metric definitions
- Metric calculation
- Historical performance
- Progress tracking
- Teacher-specific performance frameworks

Analytics must consume domain events/data rather than embedding business logic into dashboards.

---

# 22. Reporting Domain

Responsibilities:

- Report definitions
- Report generation
- Report permissions
- Report formatting
- Report delivery orchestration

Report delivery must remain independent of specific communication providers.

---

# 23. Communication Domain

This domain shall provide an abstraction around:

```text
In-App
Email
WhatsApp
Future channels
```

The business domain should request:

```text
SendNotification
```

rather than directly calling:

```text
SMTP
WhatsApp API
```

---

# 24. Meeting Domain

The meeting domain shall expose a provider-independent abstraction.

Conceptually:

```text
MeetingProvider
       │
       ├── GoogleMeetProvider
       └── FutureProvider
```

The initial implementation will use the central Google Workspace integration.

The exact Google authentication mechanism belongs to the Integration Specification.

---

# 25. Media / Video Domain

Video architecture shall be provider-independent.

Conceptually:

```text
VideoProvider
      │
      ├── GoogleDriveProvider
      ├── VimeoProvider
      └── FutureProvider
```

The core learning domain should not depend directly on Google Drive or Vimeo classes.

---

# 26. Platform Administration Domain

Responsibilities:

- Global tenant overview
- Usage monitoring
- Platform metrics
- Platform configuration
- Platform-level policies
- Platform feature configuration
- Operational controls

This domain operates outside tenant business workflows.

---

# 27. Support Domain

Support operations must be isolated from ordinary tenant roles.

Support capabilities include:

- Temporary tenant access
- Tenant troubleshooting
- Device assistance
- Account support
- Operational investigation

Support operations must generate audit records.

---

# 28. Audit Domain

Audit capabilities should be treated as a cross-cutting architectural concern.

Auditable operations include at minimum:

- Authentication events
- Authorization changes
- Payment approvals
- Payment rejections
- Credential lifecycle changes
- Device binding changes
- Support access
- Administrative operations
- Sensitive tenant configuration changes

---

# 29. Backend Architecture

The Laravel application shall follow a domain-oriented internal structure.

Conceptually:

```text
Backend
│
├── Domain
│   ├── Identity
│   ├── Tenancy
│   ├── Authorization
│   ├── Education
│   ├── Attendance
│   ├── Assessment
│   ├── Credentials
│   ├── Billing
│   ├── Analytics
│   ├── Reporting
│   ├── Communication
│   ├── Meetings
│   ├── Media
│   ├── Platform
│   └── Support
│
├── Application
│   ├── Commands / Actions
│   ├── DTOs
│   ├── Use Cases
│   └── Application Services
│
├── Infrastructure
│   ├── Persistence
│   ├── Integrations
│   ├── Messaging
│   ├── Storage
│   └── External Providers
│
└── Shared
```

The exact Laravel namespaces and physical paths will be finalized before Phase Zero implementation.

---

# 30. Backend Layer Responsibilities

## Presentation Layer

Responsible for:

- HTTP requests
- Authentication entry points
- Input handling
- Serialization
- HTTP responses

Controllers must remain thin.

Controllers must not contain large business workflows.

---

## Application Layer

Responsible for orchestrating use cases.

Examples:

```text
CreateTenant
EnrollStudent
SubmitPayment
ApprovePayment
GenerateCredential
BindDevice
RecordAttendance
CreateMeeting
SubmitAssignment
GradeExam
GenerateStudentReport
```

---

## Domain Layer

Contains the business rules and domain behavior.

The domain must not depend directly on:

- HTTP
- Controllers
- React
- SMTP
- Google APIs
- Specific storage drivers

---

## Infrastructure Layer

Responsible for:

- Database persistence
- External API integrations
- File storage
- Messaging
- Providers
- Infrastructure-specific implementations

---

# 31. Dependency Rule

Dependencies must point inward toward stable abstractions.

Conceptually:

```text
Presentation
      ↓
Application
      ↓
Domain Contracts
      ↑
Infrastructure Implementations
```

Business logic must not depend directly on infrastructure vendors.

---

# 32. Repository Rule

Repositories shall be used intentionally rather than mechanically.

A Repository should exist when it provides meaningful abstraction around aggregate persistence or complex querying.

The system shall not create one repository for every database model merely because a Repository Pattern exists.

---

# 33. DTO Rule

DTOs shall be used at application boundaries when structured data transfer is beneficial.

Database models must not be blindly passed through every application layer.

---

# 34. Strategy Pattern

Strategy Pattern shall be used where multiple interchangeable behaviors exist.

Examples:

```text
VideoProvider
MeetingProvider
NotificationChannel
PaymentMethod
AuthenticationMode
AttendanceMode
```

Example:

```text
AuthenticationStrategy
├── CredentialAuthentication
├── PasswordAuthentication
└── CombinedAuthentication
```

---

# 35. Factory Pattern

Factories shall be used when object creation depends on runtime configuration or provider selection.

Examples:

```text
VideoProviderFactory
NotificationChannelFactory
MeetingProviderFactory
AuthenticationStrategyFactory
```

---

# 36. Adapter Pattern

Adapters shall isolate external providers from internal business logic.

Example:

```text
Internal Meeting Contract
          ↓
Google Meet Adapter
          ↓
Google API
```

Changing the provider must not require rewriting the core Meeting domain.

---

# 37. State Pattern

State-oriented logic shall be used for lifecycle-heavy concepts such as:

- Access Credential
- Subscription
- Payment Request
- Support Session
- Device Binding

State changes must be explicit and validated.

---

# 38. Policy Pattern

Authorization and business decisions shall use policies rather than scattered conditional checks.

Examples:

```text
CanApprovePayment
CanChangeDevice
CanViewStudent
CanRecordAttendance
CanAccessTenant
CanViewReport
```

---

# 39. Specification Pattern

The Specification Pattern may be used for reusable business conditions.

Examples:

```text
ActiveSubscription
EligibleStudent
ValidCredential
AuthorizedAttendanceSession
EligibleDevice
```

This shall be used only where condition reuse and composition justify it.

---

# 40. Domain Events

Business-significant events may include:

```text
StudentEnrolled
PaymentSubmitted
PaymentApproved
PaymentRejected
SubscriptionActivated
CredentialGenerated
CredentialActivated
DeviceBound
DeviceChanged
AttendanceRecorded
AssignmentSubmitted
ExamCompleted
ExamGraded
ReportGenerated
```

Domain events must represent meaningful business events, not every method invocation.

---

# 41. Reliable Event Processing

Where asynchronous events cross transaction boundaries, the architecture should support an Outbox-style reliability mechanism.

The goal is to prevent:

```text
Database transaction succeeds
BUT
Event delivery fails silently
```

The exact implementation belongs to the Infrastructure Specification.

---

# 42. Asynchronous Processing

The application shall use background processing for operations that do not need to block the user's request.

Examples:

- Email delivery
- Future WhatsApp delivery
- Report generation
- Analytics aggregation
- Integration callbacks
- Non-critical notifications
- Long-running processing

---

# 43. Frontend Architecture

The Next.js application shall use a **feature-oriented structure**.

Conceptually:

```text
Frontend
│
├── app
│   ├── routes
│   ├── layouts
│   └── route-specific shells
│
├── features
│   ├── authentication
│   ├── tenant
│   ├── dashboard
│   ├── students
│   ├── teachers
│   ├── courses
│   ├── lessons
│   ├── assignments
│   ├── exams
│   ├── attendance
│   ├── credentials
│   ├── subscriptions
│   ├── payments
│   ├── analytics
│   ├── reports
│   ├── meetings
│   ├── parent
│   ├── notifications
│   └── administration
│
├── shared
│   ├── UI
│   ├── hooks
│   ├── utilities
│   ├── types
│   └── constants
│
└── infrastructure
    ├── API
    ├── authentication
    ├── configuration
    └── integrations
```

---

# 44. Frontend Rules

The frontend shall not become a copy of the backend.

A frontend feature may contain:

```text
Components
Hooks
State
Queries
Mutations
Schemas
Types
Feature Utilities
Feature Configuration
```

Large business rules should remain on the backend.

---

# 45. Page/Route Rule

Routes and pages should primarily compose feature modules.

The system must avoid giant page files such as:

```text
Teachers.tsx
Students.tsx
Dashboard.tsx
```

containing the complete business behavior.

Pages should remain orchestration/composition layers.

---

# 46. Frontend Security Principle

The frontend shall never be treated as the authoritative authorization mechanism.

UI permission checks improve user experience.

Backend authorization determines actual access.

Therefore:

```text
Hide button
≠
Secure action
```

---

# 47. API Architecture

The frontend shall communicate with the backend through an explicit API contract.

Recommended direction:

```text
Versioned REST API
+
OpenAPI Contract
+
Typed Frontend Client
```

The API contract should define:

- Requests
- Responses
- Error structures
- Authentication requirements
- Permissions
- Pagination
- Validation
- Resource schemas

The exact API specification will be defined later.

---

# 48. Error Architecture

Errors should be categorized consistently.

Conceptually:

```text
Validation Error
Authentication Error
Authorization Error
Tenant Context Error
Business Rule Error
Resource Not Found
Conflict
Rate Limit
Integration Error
Internal Error
```

The frontend must not depend on vendor-specific exception messages.

---

# 49. Access Credential Architecture

The Credential subsystem shall conceptually work as:

```text
Credential
   ↓
Resolve Tenant
   ↓
Resolve Student Relationship
   ↓
Validate Credential State
   ↓
Validate Subscription / Entitlement
   ↓
Validate Device
   ↓
Create Secure Session
```

Credential possession does not itself become a permanent authentication session.

---

# 50. Device Binding Architecture

Device state shall be represented as an explicit security object.

Conceptually:

```text
Student
   │
Credential
   │
Device Binding
   │
Session
```

Device replacement must:

- Verify actor authorization.
- Invalidate the old binding where required.
- Establish the new binding.
- Generate an audit event.

---

# 51. Billing Architecture

The billing domain shall not directly grant access.

Instead:

```text
Payment
   ↓
Payment Review
   ↓
Subscription
   ↓
Entitlement
   ↓
Access Credential / Access Permission
```

This separation is mandatory to prevent billing state from becoming authentication state.

---

# 52. Online / Offline Architecture

Online and Offline shall be independent modules over a shared foundation.

Conceptually:

```text
Shared Platform Core
        │
   ┌────┴────┐
   │         │
Online     Offline
Platform    Platform
```

Shared components may include:

- Identity
- Students
- Teachers
- Authorization
- Analytics
- Reporting
- Credentials
- Notifications

Online-specific capabilities include:

- Courses
- Lessons
- Videos
- Assignments
- Exams
- Meetings

Offline-specific capabilities include:

- Branches
- Classrooms
- Classes
- Sessions
- QR attendance

---

# 53. Unified Student Dashboard Architecture

The student dashboard shall aggregate tenant memberships.

Conceptually:

```text
Student Global Identity
       │
       ├── Tenant A Membership
       ├── Tenant B Membership
       └── Tenant C Membership
```

The dashboard may present:

```text
All Learning
My Teachers
My Courses
My Lessons
My Assignments
My Exams
My Attendance
My Performance
```

but requests to tenant-owned data must still execute within the appropriate tenant security boundary.

---

# 54. White-Label Architecture

Tenant branding shall be configuration-driven.

Brand information should be resolved from the tenant context.

Conceptually:

```text
Request
 ↓
Tenant Resolver
 ↓
Tenant Branding
 ↓
Frontend Theme
```

Branding changes should not require a new software deployment.

---

# 55. Integration Architecture

All external integrations shall be behind provider abstractions.

Initial provider categories:

```text
Video
Meeting
Email
WhatsApp
Storage
```

The core domain must never directly depend on provider SDKs.

---

# 56. Security Boundary Architecture

The following boundaries are mandatory:

```text
Platform ↔ Tenant
Tenant A ↔ Tenant B
Frontend ↔ Backend
Business Domain ↔ Infrastructure
Credential ↔ Session
Payment ↔ Subscription
Subscription ↔ Access
Tenant Admin ↔ Platform Admin
Student ↔ Parent
Teacher ↔ Assistant
```

Every boundary must have explicit authorization and ownership rules.

---

# 57. Platform Admin Boundary

Platform Admin access is outside normal tenant permissions.

There are two platform-level roles:

```text
Super Admin
Support
```

Super Admin manages the platform.

Support performs authorized operational assistance.

Tenant Admin/Teacher permissions do not automatically grant Platform Admin permissions.

---

# 58. Support Impersonation Architecture

Support access shall be implemented as an explicit elevated operation.

Conceptually:

```text
Support User
   ↓
Request Tenant Access
   ↓
Authorization Check
   ↓
Reason / Context
   ↓
Temporary Support Session
   ↓
Tenant Access
   ↓
Audit
   ↓
Session Expiration
```

The support session must remain distinguishable from an ordinary teacher or tenant-user session.

---

# 59. Authorization Architecture

Authorization shall conceptually evaluate:

```text
Actor
+
Role
+
Attributes
+
Action
+
Resource
+
Tenant
+
Scope
+
Rules
```

Example:

```text
Can user X
approve payment Y
for student Z
inside tenant T
at the current time?
```

Authorization must be evaluated server-side.

---

# 60. Permission Architecture

Permission definitions should follow an explicit resource/action model.

Example:

```text
students.view
students.create
students.update
students.delete

payments.view
payments.approve
payments.reject

attendance.view
attendance.create
attendance.update
attendance.delete
```

The final catalog will be defined in the Authorization Specification.

---

# 61. Permission Inheritance

The system shall support:

```text
Allow
Deny
Inherit
```

The exact conflict precedence is intentionally reserved for the Security Specification.

Until formally approved, implementation shall not invent a conflicting rule.

---

# 62. Data Ownership Principle

Every entity must have an explicit owner/scope.

Examples:

```text
Tenant-owned
Teacher-owned
Student-owned
Parent-owned
Platform-owned
```

Ownership must not be inferred merely from table relationships.

---

# 63. Database Access Principle

Tenant business modules must not independently choose arbitrary database connections.

Database context shall be provided by the Tenant Resolution / Persistence infrastructure.

Business logic must remain unaware of the physical location of the tenant database.

---

# 64. Caching Architecture

Caching may be introduced for:

- Tenant configuration
- Branding
- Permission evaluations where safe
- Frequently accessed read models
- Global platform metrics

Security-sensitive cached values must have explicit invalidation rules.

Caching must never bypass authorization.

---

# 65. Queue Architecture

Queues shall be treated as first-class infrastructure.

Jobs must carry enough context to safely operate within the correct tenant.

A queued operation must never accidentally execute against the wrong tenant database.

This requirement is critical for multi-database architecture.

---

# 66. Scheduled Job Architecture

Scheduled tasks must explicitly resolve the relevant tenant context.

Tenant-specific scheduled operations must never rely on implicit global state.

---

# 67. File and Document Architecture

Tenant-owned uploaded files must be isolated logically and physically where applicable.

Storage paths should contain tenant-scoped namespaces.

Example:

```text
tenant/{tenant-id}/...
```

The actual storage provider remains an infrastructure concern.

---

# 68. Video Tracking Architecture

Video tracking shall separate:

```text
Playback Event
Learning Progress
Completion State
Analytics
```

The system should avoid using raw playback events directly as dashboard calculations.

Instead:

```text
Playback Events
      ↓
Processing / Aggregation
      ↓
Learning Progress
      ↓
Analytics
```

---

# 69. Analytics Architecture

Analytics must consume controlled metric definitions.

Conceptually:

```text
Domain Data
    ↓
Events / Aggregation
    ↓
Metric Engine
    ↓
Metric Values
    ↓
Reports / Dashboards
```

Custom metrics must follow controlled schemas and validation rules.

---

# 70. Observability Architecture

The platform should provide:

```text
Logs
Metrics
Traces
Audit
Health Checks
Background Job Monitoring
Integration Monitoring
```

Observability must distinguish between:

- Platform events
- Tenant events
- Security events
- Application errors
- Integration errors

---

# 71. Architecture Documentation Structure

The project must maintain:

```text
docs/
├── architecture/
│   ├── architecture.md
│   ├── system-context.md
│   ├── backend.md
│   ├── frontend.md
│   ├── tenancy.md
│   ├── identity.md
│   ├── authorization.md
│   ├── credentials.md
│   ├── billing.md
│   ├── integrations.md
│   ├── security.md
│   ├── scalability.md
│   └── observability.md
│
├── decisions/
│   └── ADR-*.md
│
└── project-management/
    ├── roadmap.md
    ├── backlog.md
    ├── completed.md
    ├── pending.md
    ├── blocked.md
    └── changelog.md
```

---

# 72. Architecture Decision Records

Any important architectural change must be documented using an ADR.

An ADR should contain:

```text
Decision ID
Context
Problem
Options
Chosen Decision
Reason
Consequences
Affected Modules
Affected Documents
Status
```

---

# 73. Architectural Rules

The following rules are mandatory:

### AR-001

No God Classes.

### AR-002

No God Components.

### AR-003

Controllers remain thin.

### AR-004

Business logic belongs to appropriate domain/application layers.

### AR-005

External providers must be abstracted.

### AR-006

Authorization must be server-side.

### AR-007

Tenant context must be explicit.

### AR-008

Cross-tenant access must never be implicit.

### AR-009

Repositories are used intentionally, not mechanically.

### AR-010

Patterns are used because they solve a problem.

### AR-011

New infrastructure dependencies require justification.

### AR-012

Architecture changes require documentation.

### AR-013

Security changes require documentation and testing.

### AR-014

Database architecture changes require impact analysis.

### AR-015

Every production feature must have automated tests.

---

# 74. Architectural Anti-Patterns

The following must be avoided:

```text
God Object
God Component
Fat Controller
Fat Page
Fat Model
Global Mutable State
Direct Provider Calls from Domain
Business Logic in UI
Business Logic in Migrations
Cross-Tenant Queries Without Context
Hardcoded Role Checks
Hardcoded Tenant IDs
Duplicated Business Rules
Unjustified Design Patterns
Uncontrolled Dependency Injection
Circular Module Dependencies
```

---

# 75. Module Dependency Policy

Modules must declare their allowed dependencies.

For example:

```text
Education
    ↓
Identity Contract
    ↓
Authorization Contract
```

but Education must not directly import:

```text
Google SDK
SMTP library
Next.js code
```

The dependency must pass through the appropriate abstraction.

---

# 76. Circular Dependency Rule

Circular dependencies between domains are prohibited.

If two domains require each other directly, the dependency must be reconsidered through:

- Domain Event
- Shared Contract
- Application Service
- Integration abstraction

---

# 77. Architecture Evolution Strategy

The system shall evolve in stages:

```text
Stage 1
Modular Monolith
+
Multi-Database

Stage 2
Horizontal Scaling
+
Queue Workers
+
Caching

Stage 3
Dedicated Infrastructure for Large Tenants

Stage 4
Selective Service Extraction if justified
```

Microservices are not a Phase Zero objective.

They are an optional future architectural evolution.

---

# 78. Architecture Quality Principle

The platform shall optimize for:

```text
Simple
+
Explicit
+
Modular
+
Testable
+
Secure
+
Scalable
```

rather than:

```text
Complex
+
Highly Abstracted
+
Over-Engineered
```

Complexity must be justified by a real business, security, scalability, or maintainability requirement.

---

# 79. Architecture Decision Status

## Confirmed

The following are confirmed from the business baseline:

- Laravel backend
- Next.js + React + TypeScript frontend
- PostgreSQL
- Multi-Tenant
- Multi-Database
- Individual Teacher Tenant
- Educational Organization Tenant
- Online Platform
- Offline Platform
- Unified Student Experience
- Tenant-scoped Parent
- RBAC + ABAC
- Dynamic permissions
- Allow / Deny / Inherit
- Access Credential
- Device Binding
- White Label
- Web/PWA
- Google Meet integration
- External video providers
- Arabic RTL
- IBM Sans
- Strong security/isolation
- Documentation-driven development
- Strong testing

## Proposed — Pending Approval

The following architecture choices are proposed in this phase:

1. Modular Monolith as the initial deployment model.
2. Domain-oriented module boundaries.
3. Clean/Hexagonal internal dependency boundaries.
4. Control Plane + Tenant Data Plane.
5. Global student identity shell for unified experience while keeping tenant Student Accounts separate.
6. Versioned REST API + OpenAPI contract.
7. Provider abstraction for all major external integrations.
8. Explicit Application/Domain/Infrastructure separation.
9. Outbox-style reliability for important asynchronous events.
10. Future evolution from shared PostgreSQL infrastructure to dedicated tenant infrastructure.
11. Explicit ADR-based architecture governance.

---

# 80. Phase C Completion Criteria

Phase C will be considered approved when:

- System boundaries are approved.
- Control Plane / Data Plane separation is approved.
- Student identity architecture is approved.
- Tenant database strategy is approved.
- Domain boundaries are approved.
- Backend boundaries are approved.
- Frontend boundaries are approved.
- Authorization architecture direction is approved.
- Credential architecture direction is approved.
- Billing architecture direction is approved.
- Integration abstraction direction is approved.
- Design Pattern strategy is approved.
- Architecture governance rules are approved.
- Proposed decisions are either approved or explicitly moved to Open Decisions.

---

# 81. Current Architecture Open Decisions

The following remain intentionally open for downstream phases:

1. Exact control database schema.
2. Exact tenant database provisioning mechanism.
3. Exact global student identity storage model.
4. Exact PostgreSQL infrastructure topology.
5. Exact API authentication mechanism.
6. Exact OAuth/Google Meet authentication implementation.
7. Exact video provider security implementation.
8. Exact RBAC/ABAC policy precedence.
9. Exact credential state machine.
10. Exact subscription state machine.
11. Exact entitlement model.
12. Exact queue/message infrastructure.
13. Exact cache technology.
14. Exact observability stack.
15. Exact backup and disaster-recovery topology.
16. Exact frontend state-management technology.
17. Exact OpenAPI generation workflow.

No implementation should silently decide an open architectural decision.
:::

كده **Phase C عملت لنا العمود الفقري الحقيقي للمشروع**. أهم قرار معماري اقترحته هنا هو **Modular Monolith قوي بدل Microservices من البداية**؛ لأننا نريد بنية Enterprise من غير ما ندخل تعقيد تشغيلي لا نحتاجه، وفي نفس الوقت خليت الـmodules والـboundaries مستقلة بحيث يمكن فصل أي جزء لاحقًا لو أصبح له مبرر حقيقي.

وفي نقطة مهمة جدًا ثبّتها في الـArchitecture: **الطالب له Tenant-specific Student Account عند كل مدرس/سنتر، لكن فيه Global Identity Layer خفيف وظيفته فقط توحيد تجربة الطالب عبر الاشتراكات المختلفة، وليس دمج بيانات المدرسين في قاعدة بيانات واحدة.**

وبما إنك طلبت مني أستخدم الـremembering في كل مرحلة، فقد ثبتُّ **اعتماد Phase B وبدء Phase C وقراراتها الأساسية وسياق الهوية/التينانت** كمرجع مستمر للمراحل التالية. memcite

بعد موافقتك على Phase C، المرحلة التالية هتكون **Phase D — Domain Model + ERD + Database Schema + Indexing + Data Isolation + Audit Model**، ودي هنبنيها من الـArchitecture دي مباشرة، مش من الصفر.