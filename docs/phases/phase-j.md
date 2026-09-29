تمام. كده كل المراحل من **A إلى I** أصبحت Approved، وندخل الآن في **Phase J — Implementation & Delivery Master Plan**.

المرحلة دي مهمة جدًا لأنها بتحوّل كل الـdocumentation السابقة من "تصميم معماري" إلى **خريطة تنفيذ فعلية للـAI**: إيه يتعمل الأول، وإيه يعتمد على إيه، وإيه ممنوع يتعمل قبل إيه، وإزاي نعرف إن كل milestone خلص فعلًا.

:::writing{variant="document" id="90417" title="Phase J — Implementation & Delivery Master Plan"}
# PHASE J — IMPLEMENTATION & DELIVERY MASTER PLAN

**Project:** Multi-Tenant SaaS LMS & Education Management Platform  
**Architecture Baseline:** Phases A–I Approved  
**Current Phase:** J  
**Status:** Draft — Pending Approval  
**Implementation Status:** Planning Only — No Implementation  
**Primary Backend:** Laravel  
**Primary Frontend:** Next.js + React + TypeScript  
**Database:** PostgreSQL  
**Architecture:** Modular Monolith  
**Tenant Architecture:** Control Database + Tenant Database per Tenant  
**API:** REST API v1 + OpenAPI  
**Frontend:** Responsive Web + PWA  
**Primary UX:** Arabic RTL + IBM Sans + Light/Dark + White-Label

---

# 1. Purpose

Phase J converts all approved architecture and requirements into an executable implementation roadmap.

It defines:

- implementation sequence
- dependency graph
- milestones
- workstreams
- implementation units
- module ownership
- AI-agent boundaries
- delivery gates
- dependency rules
- integration order
- database implementation order
- frontend implementation order
- test implementation order
- deployment order
- documentation synchronization
- branch/PR expectations
- rollback expectations
- completion criteria

This phase does **not** implement the application.

It establishes the exact path by which implementation should happen.

---

# 2. Fundamental Implementation Principle

The implementation must follow:

```text id="yd2h46"
Architecture
    ↓
Foundation
    ↓
Core Platform
    ↓
Business Domains
    ↓
API
    ↓
Frontend
    ↓
Integrations
    ↓
Testing
    ↓
Infrastructure Hardening
    ↓
Release
```

AI agents must not jump randomly between unrelated modules.

---

# 3. Source of Truth Hierarchy

When implementation questions arise, the AI must use this priority:

```text id="5wrv9w"
1. Approved Business Requirements
2. Approved Architecture
3. Approved Domain / Database Specification
4. Approved Security Rules
5. Approved API Contract
6. Approved Frontend Contract
7. Approved Testing Contract
8. Approved Infrastructure Contract
9. ADRs
10. Implementation Details
```

An implementation detail must never silently override an approved architectural rule.

---

# 4. Implementation State Model

Every work item must have a state:

```text id="xcth4x"
PLANNED
READY
IN_PROGRESS
IMPLEMENTED
VERIFIED
BLOCKED
DEFERRED
CANCELLED
PRODUCTION_READY
```

---

# 5. Difference Between Statuses

## PLANNED

Defined but not ready to implement.

## READY

Dependencies and required specifications exist.

## IN_PROGRESS

Implementation currently underway.

## IMPLEMENTED

Code exists.

## VERIFIED

Required verification has passed.

## PRODUCTION_READY

Implementation + verification + documentation + release requirements are complete.

This distinction is mandatory.

---

# 6. Master Implementation Streams

The project should be divided into:

```text id="y4jv2b"
STREAM 01 — Repository & Tooling
STREAM 02 — Runtime Foundation
STREAM 03 — Tenancy
STREAM 04 — Identity & Authentication
STREAM 05 — Authorization
STREAM 06 — Education Core
STREAM 07 — Classroom & Attendance
STREAM 08 — Assessment
STREAM 09 — Billing & Entitlements
STREAM 10 — Credentials & Devices
STREAM 11 — Meetings & Media
STREAM 12 — Analytics
STREAM 13 — Communication
STREAM 14 — Reporting
STREAM 15 — Platform Administration
STREAM 16 — Support
STREAM 17 — Frontend Experience
STREAM 18 — Testing & Quality
STREAM 19 — Infrastructure & Deployment
STREAM 20 — Production Readiness
```

---

# 7. Phase J Dependency Graph

High-level dependency order:

```text id="i7c6qf"
Repository / Tooling
        ↓
Runtime Foundation
        ↓
Tenancy
        ↓
Identity
        ↓
Authentication
        ↓
Authorization
        ↓
Core Domain Infrastructure
        ↓
Education
        ↓
Classroom
        ↓
Assessment
        ↓
Billing
        ↓
Credentials
        ↓
Meetings / Media / Communication
        ↓
Analytics / Reporting
        ↓
Platform Admin / Support
        ↓
Frontend Integration
        ↓
Full Verification
        ↓
Production Hardening
        ↓
Release
```

Some streams can run in parallel after their dependencies are stable.

---

# 8. Critical Dependency Rule

No implementation task may begin if its required dependency is still architecturally undefined.

Example:

```text id="0g4vck"
Credential Login
```

depends on:

```text id="8xsp5q"
Tenant Resolution
+
Identity
+
Authentication
+
Authorization
+
Credential Domain
+
Device Binding
```

The AI must not implement Credential Login as an isolated feature.

---

# 9. Stream 01 — Repository & Tooling Foundation

First implementation stream.

Deliverables:

```text id="3q9j1y"
repository structure
backend project
frontend project
documentation structure
shared configuration
formatting/linting
type checking
basic testing framework
environment templates
Git conventions
CI skeleton
```

No business functionality should be implemented here beyond framework bootstrap.

---

# 10. Stream 01 Definition of Done

```text id="9qs0pb"
Backend boots
Frontend boots
Tests execute
Lint executes
Type check executes
Documentation is accessible
Environment configuration works
CI validates basic build
Repository structure matches architecture
```

---

# 11. Stream 02 — Runtime Foundation

Establish:

```text id="qgbc8l"
Laravel runtime
Next.js runtime
PostgreSQL connectivity
queue foundation
cache foundation
storage foundation
logging foundation
request correlation
error handling
configuration system
```

---

# 12. Runtime Foundation Principle

Before business modules are built, the application should already know how to:

```text id="swh63c"
start
configure
log
connect
handle errors
run tests
run queues
access storage
```

This prevents every domain from inventing its own infrastructure behavior.

---

# 13. Stream 03 — Tenancy Foundation

This is one of the highest-priority implementation streams.

Implement conceptually:

```text id="6vafhr"
Tenant Registry
Tenant Context
Tenant Resolver
Tenant DB Resolver
Tenant Provisioning
Tenant Configuration
Tenant Status
Tenant Domain Mapping
```

---

# 14. Tenant Implementation Order

```text id="9xzv2j"
Tenant Registry
    ↓
Tenant Context
    ↓
Tenant Resolution
    ↓
Tenant DB Allocation
    ↓
Tenant DB Connection
    ↓
Tenant Provisioning
    ↓
Tenant Migration Orchestration
    ↓
Tenant Status / Lifecycle
```

---

# 15. Tenant Gate

Before proceeding to large business domains, the system must demonstrate:

```text id="g4h7wt"
Tenant A request
→ Tenant A data

Tenant B request
→ Tenant B data

Tenant A request for Tenant B resource
→ DENIED
```

This is a mandatory architecture gate.

---

# 16. Stream 04 — Identity

Implement:

```text id="38xj1o"
Global Identity
Tenant User / Account
Student Identity Mapping
Teacher Identity
Assistant Identity
Parent Identity
Platform User Identity
```

Maintain:

```text id="i5rt8o"
User ≠ Student
Student ≠ Parent
Global Identity ≠ Tenant Authorization
```

---

# 17. Identity Gate

Verify:

```text id="j7x46t"
Global student maps to Tenant A
Global student maps to Tenant B
Tenant A access does not automatically grant Tenant B access
Parent relationship remains tenant-local
```

---

# 18. Stream 05 — Authentication

Implement authentication according to the finalized Phase F architecture.

Support tenant-configurable modes:

```text id="izik39"
PASSWORD / CONTACT
CREDENTIAL
COMBINED
```

Required concepts:

```text id="0ma7hl"
session
login
logout
session expiration
session revocation
contact verification where applicable
credential authentication
```

---

# 19. Authentication Gate

Verify:

```text id="vkwd5c"
valid login
invalid login
expired session
revoked session
wrong tenant
credential authentication
rate limiting
session security
```

---

# 20. Stream 06 — Authorization

Implement:

```text id="u1rymy"
Permission Registry
Roles
Custom Roles
Role Assignment
Policy Engine
Scope
Attributes
Allow
Deny
Inheritance
Default Deny
```

The final precedence must match the approved Security Policy.

---

# 21. Authorization Gate

Before continuing to high-value business operations:

```text id="8br5uw"
Teacher access
Assistant access
Student access
Parent access
Platform access
Support access
```

must be demonstrably enforced.

---

# 22. Stream 07 — Core Education

First major business domain.

Implement:

```text id="30g8gy"
Staff
Teachers
Assistants
Students
Parents
Parent Relationships

Courses
Lessons
Enrollments
Packages
```

---

# 23. Education Implementation Dependency

```text id="7v2x3t"
Tenancy
   ↓
Identity
   ↓
Authorization
   ↓
Students / Staff
   ↓
Courses
   ↓
Lessons
   ↓
Enrollments
```

---

# 24. Education Gate

Verify:

```text id="e9r8xl"
teacher creates course
teacher creates lesson
student enrollment
student sees authorized course
student cannot see another tenant course
assistant sees only permitted student data
```

---

# 25. Stream 08 — Classroom & Attendance

Implement:

```text id="wwwl6b"
Branches
Classrooms
Classes
Sessions
Attendance
QR Attendance
Attendance Policies
Attendance Corrections
```

---

# 26. Attendance Dependency

```text id="db3d3o"
Students
+
Classes
+
Sessions
+
Authorization
+
QR/Credential Context
```

---

# 27. Attendance Gate

Verify:

```text id="at0o6x"
valid scan
duplicate scan
invalid QR
wrong tenant
unauthorized assistant
closed session
manual correction
concurrent scans
```

---

# 28. Stream 09 — Assessment

Implement:

```text id="a9eqj4"
Assignments
Submissions
Exams
Questions
Attempts
Answers
Grades
Grade Publication
```

---

# 29. Assessment Dependency

```text id="m1g3w1"
Students
Courses
Lessons
Enrollment
Authorization
Time
```

---

# 30. Assessment Gate

Verify:

```text id="p5am5h"
assignment submission
deadline
late submission
exam start
exam answer
exam submit
duplicate submission
grading
grade publication
authorization
tenant isolation
```

---

# 31. Stream 10 — Billing & Entitlements

This is one of the most sensitive domains.

Implement separately:

```text id="8yf3kt"
Packages
Payment Requests
Payment Proof
Payment Review
Subscriptions
Entitlements
```

Never collapse them into:

```text id="3e5l8g"
Student.is_paid
```

---

# 32. Billing Dependency

```text id="b9kdj0"
Student
+
Package
+
Payment
    ↓
Review
    ↓
Subscription
    ↓
Entitlement
```

---

# 33. Billing Gate

Verify:

```text id="vbkrd7"
submit payment
review
approve
reject
duplicate approval
wrong reviewer
wrong tenant
subscription activation
entitlement grant
notification
audit
```

---

# 34. Critical Billing Invariants

```text id="j4j6h8"
Payment ≠ Subscription
Subscription ≠ Entitlement
Payment Approval ≠ Authentication
```

---

# 35. Stream 11 — Credentials & Devices

Implement after identity/authentication/authorization are stable.

Components:

```text id="co6p1a"
Credential generation
assignment
issuance
activation
state machine
device binding
device replacement
suspension
revocation
expiration
QR representation
```

---

# 36. Credential Dependency

```text id="g4r8q7"
Tenant
+
Student
+
Identity
+
Authentication
+
Authorization
+
Security
```

---

# 37. Credential Gate

Verify:

```text id="c0u9fd"
raw secret hashed
secret not logged
activation works
device binding works
second device policy enforced
replacement works
revoke works
expired credential rejected
cross-tenant credential rejected
```

---

# 38. Stream 12 — Meetings & Media

Implement provider abstractions first.

```text id="p5dy5e"
MeetingProvider
VideoProvider
```

Then adapters:

```text id="j8qa4v"
Google Meet
Google Drive / Vimeo / other approved providers
```

---

# 39. Provider Implementation Rule

The order must be:

```text id="qv3w8f"
Domain Contract
    ↓
Application Interface
    ↓
Provider Adapter
    ↓
External SDK/API
```

Never:

```text id="zqns7v"
Google SDK
    ↓
Domain
```

---

# 40. Media / Meeting Gate

Verify:

```text id="tnc2ou"
provider success
provider timeout
provider failure
duplicate request
external ID mapping
tenant isolation
authorization
```

---

# 41. Stream 13 — Communication

Implement communication abstraction:

```text id="0k0c2r"
Notification
Delivery Channel
Email Adapter
Future WhatsApp Adapter
```

Email is initial.

WhatsApp remains future unless separately activated.

---

# 42. Communication Gate

Verify:

```text id="n3l3po"
notification created
queued
sent
failed
retry
tenant isolation
user targeting
```

---

# 43. Stream 14 — Analytics

Analytics must be implemented after core transactional data exists.

Order:

```text id="8q2y3j"
Metric Definitions
Metric Versions
Raw Events
Measurements
Aggregations
Read Models
Dashboards
```

---

# 44. Analytics Dependency

```text id="n4f4cr"
Education
+
Attendance
+
Assessment
+
Video Events
+
Progress
        ↓
Analytics
```

---

# 45. Analytics Gate

Verify:

```text id="6wgrhf"
correct tenant
correct student
correct metric version
correct calculation
historical stability
no synchronous heavy calculation on dashboard
```

---

# 46. Stream 15 — Reporting

Reporting builds after analytics and domain reporting sources exist.

Implement:

```text id="j9h5g6"
Report Definitions
Report Instances
Report Generation Jobs
Report Storage
Report Delivery
```

Large reports should be asynchronous.

---

# 47. Reporting Gate

Verify:

```text id="qf64zo"
report generation
job tracking
failure handling
tenant isolation
download authorization
```

---

# 48. Stream 16 — Platform Administration

Implement:

```text id="lxqg8x"
Tenant Management
Platform Users
Platform Permissions
Aggregate Usage
Platform Metrics
Platform Configuration
```

---

# 49. Platform Admin Gate

Verify:

```text id="t8r2j2"
global access
tenant privacy
aggregate visibility
administrative authorization
audit
```

---

# 50. Stream 17 — Support

Implement after platform authorization is mature.

Components:

```text id="qth07e"
Support Session
Tenant Entry
Temporary Permissions
Expiration
Audit
Exit
```

---

# 51. Support Gate

Verify:

```text id="ctbtyj"
authorized support
reason required
tenant context
time expiration
manual end
post-expiration denial
audit
```

---

# 52. Stream 18 — Frontend Foundation

Frontend implementation should begin after the core API contracts are stable, but much of the design system can be developed in parallel.

Foundation:

```text id="gsxjdr"
App Shell
Layouts
Routing
Theme
RTL
Typography
Design Tokens
UI Primitives
Error Boundaries
API Client
Authentication Shell
```

---

# 53. Frontend Implementation Order

```text id="ihdjz4"
Design System
    ↓
Application Shell
    ↓
Authentication
    ↓
Tenant Context
    ↓
Role-Based Experience Shells
    ↓
Shared Data Layer
    ↓
Student Experience
    ↓
Teacher Experience
    ↓
Assistant Experience
    ↓
Parent Experience
    ↓
Platform Experience
```

---

# 54. Student Frontend Order

```text id="b0l74b"
Login
↓
Dashboard
↓
Courses
↓
Lessons
↓
Video
↓
Assignments
↓
Exams
↓
Grades
↓
Attendance
↓
Meetings
↓
Notifications
↓
Profile
```

---

# 55. Teacher Frontend Order

```text id="j2w0wk"
Login
↓
Dashboard
↓
Students
↓
Courses
↓
Lessons
↓
Attendance
↓
Assignments
↓
Exams
↓
Payments
↓
Subscriptions
↓
Credentials
↓
Analytics
↓
Reports
↓
Settings
```

---

# 56. Assistant Frontend Order

```text id="74gml0"
Dashboard
↓
Assigned Students
↓
Attendance Scanner
↓
Authorized Payments
↓
Reports / Operations
```

Only features permitted by actual policy should appear.

---

# 57. Parent Frontend Order

```text id="3j20zc"
Dashboard
↓
Children
↓
Attendance
↓
Progress
↓
Grades
↓
Reports
↓
Notifications
```

---

# 58. Platform Frontend Order

```text id="nkhh01"
Platform Dashboard
↓
Tenants
↓
Usage
↓
Metrics
↓
Support
↓
Configuration
```

---

# 59. PWA Implementation Position

PWA should be finalized after:

```text id="byqzwa"
authentication
tenant context
frontend cache model
routing
service worker boundaries
```

have stabilized.

This reduces risk of caching sensitive data incorrectly.

---

# 60. Security Implementation Order

Security controls must not be postponed to the end.

Security must be implemented progressively:

```text id="j1op7a"
Tenant Isolation
    ↓
Authentication
    ↓
Authorization
    ↓
Input Validation
    ↓
Rate Limiting
    ↓
Audit
    ↓
Secure Storage
    ↓
Security Headers
    ↓
Abuse Detection
    ↓
Security Verification
```

---

# 61. Testing Implementation Order

Testing must begin with the first domain rather than after the entire product is built.

For every module:

```text id="ywl8wr"
Implement
→ Unit Tests
→ Integration Tests
→ API Tests
→ Security Tests
→ Documentation
→ Mark Verified
```

---

# 62. Vertical Slice Rule

Where practical, implementation should favor vertical slices.

Example:

```text id="u02dcb"
Student Creation

Domain
↓
Application
↓
Repository
↓
API
↓
Authorization
↓
Frontend
↓
Tests
↓
Documentation
```

rather than implementing every repository in the entire system before exposing any working feature.

---

# 63. Foundation vs Vertical Slice

Use both approaches appropriately.

### Foundation-first

For:

```text id="shmykh"
tenancy
identity
auth
authorization
infrastructure
```

### Vertical Slice

For:

```text id="u8iibn"
student workflow
course workflow
payment workflow
attendance
assessment
```

---

# 64. AI Agent Task Boundaries

An AI agent should receive bounded tasks.

Good:

```text id="6ko82l"
Implement Payment Approval Use Case according to Phase F and Billing specification.
```

Bad:

```text id="03i4c2"
Build the entire payment system.
```

unless the task is explicitly decomposed internally and all boundaries are controlled.

---

# 65. AI Agent Context Package

Every AI task should receive or reference:

```text id="lufq2l"
Relevant Phase Documents
Architecture
Domain Specification
API Contract
Security Rules
Existing Code
Existing Tests
Current Status
Task Definition
Acceptance Criteria
```

---

# 66. AI Agent Required Workflow

Every AI implementation task:

```text id="6t7wlx"
READ
 ↓
UNDERSTAND
 ↓
CHECK DEPENDENCIES
 ↓
PLAN LOCALLY
 ↓
IMPLEMENT
 ↓
TEST
 ↓
REVIEW
 ↓
DOCUMENT
 ↓
UPDATE STATUS
```

---

# 67. AI Forbidden Behavior

An AI agent must not:

```text id="9i10n9"
invent missing requirements
change domain ownership silently
bypass architecture
remove security controls
merge unrelated features
delete tests just to pass CI
mark unverified work as complete
create fake test results
silently alter approved contracts
```

---

# 68. AI Change Scope

Every task should define:

```text id="adq4bc"
Allowed Areas
Expected Files/Modules
Forbidden Areas
Dependencies
Acceptance Criteria
```

This reduces accidental architectural drift.

---

# 69. Architecture Change Rule

If implementation reveals that an approved design does not work:

```text id="vc3n8h"
STOP
↓
document problem
↓
create ADR
↓
propose change
↓
approve
↓
update affected specifications
↓
resume implementation
```

Do not silently work around architecture.

---

# 70. ADR Trigger Conditions

An ADR is required when changing:

```text id="z7epcc"
tenant architecture
database topology
authentication model
authorization model
API versioning
provider abstraction
major frontend architecture
deployment topology
data ownership
critical state machine
```

---

# 71. Documentation Synchronization

After every meaningful implementation step update:

```text id="h1o3d5"
docs/architecture/architecture.md
relevant domain docs
API docs
frontend docs
testing docs
project status
changelog
```

only where applicable.

---

# 72. Implementation Ledger

The project should maintain an implementation ledger.

Example:

```text id="wa5yjg"
TASK-ID
Domain
Description
Dependency
Status
Files
Tests
Docs
Owner/AI Agent
Started
Completed
Verification
```

---

# 73. Milestone Model

Recommended milestones:

```text id="beypml"
M0 — Repository Bootstrap
M1 — Platform Foundation
M2 — Tenancy
M3 — Identity / Auth / Authorization
M4 — Education Core
M5 — Attendance
M6 — Assessment
M7 — Billing / Entitlements
M8 — Credentials / Devices
M9 — Integrations
M10 — Analytics / Reporting
M11 — Full Frontend
M12 — Full Verification
M13 — Production Hardening
M14 — Production Readiness
```

---

# 74. Milestone M0 — Repository Bootstrap

Exit criteria:

```text id="p8e7po"
repository ready
backend boots
frontend boots
docs structure ready
CI skeleton ready
basic tests ready
```

---

# 75. Milestone M1 — Platform Foundation

Exit criteria:

```text id="m6i6jf"
configuration
logging
error handling
queues
cache
storage
database foundation
health checks
```

---

# 76. Milestone M2 — Tenancy

Exit criteria:

```text id="f1wyzr"
tenant registry
tenant resolution
tenant DB resolution
tenant provisioning
tenant migrations
tenant isolation tests
```

---

# 77. Milestone M3 — Identity/Auth/Authz

Exit criteria:

```text id="9p6p5m"
global identity
tenant accounts
authentication
sessions
roles
permissions
policies
scope
security tests
```

---

# 78. Milestone M4 — Education Core

Exit criteria:

```text id="x4d7gy"
students
parents
staff
courses
lessons
enrollment
API
frontend basics
tests
```

---

# 79. Milestone M5 — Attendance

Exit criteria:

```text id="q9krin"
branches
classes
sessions
QR
attendance
correction
concurrency tests
```

---

# 80. Milestone M6 — Assessment

Exit criteria:

```text id="x0m4d4"
assignments
submissions
exams
attempts
answers
grades
publication
concurrency
```

---

# 81. Milestone M7 — Billing

Exit criteria:

```text id="7v4eji"
packages
payment submission
review
approval
rejection
subscriptions
entitlements
idempotency
audit
```

---

# 82. Milestone M8 — Credentials

Exit criteria:

```text id="q3o7h6"
credential lifecycle
device binding
replacement
QR
authentication
security controls
abuse/rate testing
```

---

# 83. Milestone M9 — Integrations

Exit criteria:

```text id="8k6h5q"
Google Meet
Video Providers
Email
integration failure handling
retries
idempotency
webhooks where applicable
```

---

# 84. Milestone M10 — Analytics & Reporting

Exit criteria:

```text id="k2d8br"
metrics
versions
events
aggregations
dashboards
reports
async processing
performance tests
```

---

# 85. Milestone M11 — Full Frontend

Exit criteria:

```text id="er1x8x"
student
teacher
assistant
parent
platform
support
responsive
RTL
dark mode
white-label
PWA where approved
```

---

# 86. Milestone M12 — Full Verification

Exit criteria:

```text id="q6x6g4"
unit
integration
API
contract
security
tenant isolation
E2E
accessibility
performance
resilience
migration
backup/restore verification
```

---

# 87. Milestone M13 — Production Hardening

Exit criteria:

```text id="jeqxy7"
monitoring
alerting
backup
restore
scaling
security hardening
deployment
rollback
runbooks
incident procedures
```

---

# 88. Milestone M14 — Production Readiness

Final gates:

```text id="p33wq7"
all critical requirements verified
critical defects closed
security verified
tenant isolation verified
API stable
frontend stable
backups verified
deployment verified
rollback understood
observability active
documentation complete
```

---

# 89. Parallel Workstreams

After M3, selected streams can run in parallel.

Example:

```text id="v60s9k"
                 ┌── Education
                 │
M3 ──────────────┼── Attendance
                 │
                 ├── Assessment
                 │
                 ├── Billing
                 │
                 └── Frontend Foundation
```

However, each stream maintains its domain boundaries.

---

# 90. Backend/Frontend Parallelism

Frontend can proceed in parallel when:

```text id="5u6fci"
API contract is stable enough
```

The frontend should not wait for the entire backend to finish.

Use:

```text id="h36bgm"
OpenAPI contract
mock/test responses
typed client
```

where appropriate.

---

# 91. Integration Parallelism

Provider adapters may be developed in parallel with domain implementation if their interfaces are already locked.

For example:

```text id="sxy0na"
MeetingProvider interface
```

can be developed before final Google Meet implementation.

---

# 92. Documentation Parallelism

Documentation is continuous, not a final phase.

It must evolve with implementation.

---

# 93. Branch / PR Dependency Rules

High-risk domain changes should not be bundled with unrelated frontend refactors.

Prefer:

```text id="zhui2f"
Tenant change
```

separate from:

```text id="pmm2lf"
UI redesign
```

unless there is a real dependency.

---

# 94. Release Train

Potential release structure:

```text id="3z6qpc"
Foundation Releases
↓
Internal Alpha
↓
Tenant Pilot
↓
Controlled Beta
↓
Production Release
```

Exact release strategy remains an Open Decision.

---

# 95. Internal Alpha

Alpha should validate:

```text id="bx9t1u"
architecture
tenant isolation
authentication
core education
API contracts
```

before expanding to broader workflows.

---

# 96. Tenant Pilot

A controlled small set of representative tenant scenarios should verify:

```text id="1c2rzk"
individual teacher
small center
larger center
student with multiple teachers
online-only
offline-only
combined mode
```

Pilot criteria should be finalized before actual pilot use.

---

# 97. Production Rollout

Production rollout should be controlled.

Potential strategy:

```text id="wmikgk"
limited tenants
→ observe
→ expand
→ broader rollout
```

Exact rollout strategy is an Open Decision.

---

# 98. Feature Flags During Delivery

Feature flags may protect unfinished/experimental functionality.

But:

```text id="2sgz5v"
feature flag ≠ authorization
```

Both product availability and backend authorization remain required.

---

# 99. Database Delivery Strategy

Database changes should follow:

```text id="8z5o9d"
schema
→ migration
→ verification
→ application compatibility
→ deployment
```

Tenant DB migrations must remain centrally orchestrated.

---

# 100. Queue Delivery Strategy

Queue payload compatibility must be maintained during releases.

Workers must be able to safely handle supported prior-version jobs.

---

# 101. API Delivery Strategy

API version `/v1` should remain stable through normal feature additions.

Breaking changes require explicit versioning strategy.

---

# 102. Frontend Delivery Strategy

Frontend deployment must account for:

```text id="dg8jxr"
API compatibility
PWA cache
service worker
static assets
browser cache
```

---

# 103. Security Delivery Strategy

Security-critical code should not be merged purely because functional tests pass.

Required:

```text id="g6nlvl"
functional
negative
security
tenant isolation
concurrency where applicable
```

---

# 104. Performance Delivery Strategy

Performance work should target real bottlenecks.

Sequence:

```text id="4kr3u4"
Implement
→ measure
→ identify bottleneck
→ optimize
→ remeasure
```

Avoid speculative optimization.

---

# 105. Technical Debt

Technical debt should be explicitly recorded.

Each item should have:

```text id="j3q4vw"
description
impact
risk
owner
priority
planned resolution
```

---

# 106. Deferred Features

A feature may be deferred if it is not required for initial production.

But it must be documented as:

```text id="di99m5"
DEFERRED
```

not silently forgotten.

---

# 107. MVP Boundary

The MVP boundary must be established explicitly before implementation expands indefinitely.

Candidate MVP capabilities:

```text id="q54r2s"
Tenant creation
Teacher/center management
Students
Parents
Courses
Lessons
Attendance
Assignments
Exams
Grades
Manual Payments
Subscriptions
Entitlements
Credentials
Basic Meetings
Basic Analytics
Notifications
Core dashboards
```

The exact MVP boundary remains a product decision if not already fixed in Phase B.

---

# 108. Post-MVP Capability

Potential post-MVP capabilities:

```text id="kz4e1q"
automated payments
WhatsApp integration
advanced analytics
advanced abuse detection
additional providers
custom domains
advanced reporting
deeper automation
dedicated infrastructure automation
advanced offline/PWA capabilities
```

These must remain outside MVP unless explicitly promoted.

---

# 109. Implementation Risk Categories

Track:

```text id="qwxouj"
ARCHITECTURAL
SECURITY
DATA
INTEGRATION
PERFORMANCE
UX
OPERATIONAL
DEPENDENCY
```

---

# 110. Risk Escalation

A risk becomes an escalation when it may affect:

```text id="fz3h3c"
tenant isolation
data integrity
authentication
authorization
payment integrity
credential security
production availability
```

---

# 111. Critical Blocker Rule

An implementation task must be marked:

```text id="u7ddqd"
BLOCKED
```

rather than hacked around when its prerequisite is unresolved.

---

# 112. AI Agent Handoff Structure

Each task given to an AI should contain:

```text id="jrl8ey"
TASK ID
Objective
Context
Required Documents
Dependencies
Scope
Non-Scope
Acceptance Criteria
Security Requirements
Test Requirements
Documentation Requirements
Expected Output
```

---

# 113. Example AI Task

```text id="cqm9cw"
TASK:
BILL-APPROVE-001

Objective:
Implement Payment Approval application use case.

Read:
Phase B
Phase D
Phase E
Phase F
Billing documentation

Dependencies:
Payment entity
Subscription
Entitlement
Authorization
Audit
Transaction infrastructure

Must:
- validate state
- authorize reviewer
- maintain tenant scope
- be idempotent
- create expected subscription/entitlement
- emit required event
- audit action

Must Not:
- grant access from payment submission
- bypass policy
- directly access another tenant

Verification:
unit
integration
authorization
tenant isolation
idempotency
concurrency

Documentation:
Billing docs
API docs
status/changelog
```

---

# 114. AI Output Contract

Every completed implementation task should return structured evidence:

```text id="1vcd6x"
TASK ID
Status
Files Changed
Architecture Impact
API Impact
Database Impact
Tests Added
Tests Executed
Tests Passed
Tests Failed
Security Verification
Documentation Updated
Known Limitations
Open Decisions
Next Dependency
```

---

# 115. AI Cannot Self-Certify Without Evidence

The AI may report:

```text id="9u4nj5"
IMPLEMENTED
```

based on code changes.

But:

```text id="m8n4e0"
VERIFIED
```

requires actual verification evidence.

---

# 116. Completion Gate Per Feature

Every feature must pass:

```text id="q4h0bk"
BUSINESS
ARCHITECTURE
SECURITY
TENANCY
API
FRONTEND
TESTING
DOCUMENTATION
```

where applicable.

---

# 117. Production Gate

Production release requires:

```text id="e6dcx6"
all critical milestones complete
critical defects = 0
critical security issues = 0
tenant isolation verified
backup verified
deployment verified
rollback plan validated
observability active
documentation complete
```

---

# 118. Final Project Status Model

The project master tracker should expose:

```text id="e4gqdr"
Phase
Milestone
Feature
Task
Status
Progress
Dependencies
Blockers
Tests
Security
Docs
Release
```

---

# 119. Recommended Documentation Structure After Implementation Starts

```text id="v5x2o4"
docs/
├── architecture/
├── decisions/
├── requirements/
├── api/
├── frontend/
├── backend/
├── database/
├── security/
├── testing/
├── infrastructure/
├── domains/
│   ├── identity/
│   ├── tenancy/
│   ├── education/
│   ├── attendance/
│   ├── assessment/
│   ├── billing/
│   ├── credentials/
│   ├── analytics/
│   ├── meetings/
│   ├── media/
│   ├── communication/
│   ├── reporting/
│   ├── platform/
│   └── support/
└── project-management/
```

---

# 120. Master Project Tracker

Recommended:

```text id="ntnmsx"
docs/project-management/
├── roadmap.md
├── milestones.md
├── backlog.md
├── completed.md
├── pending.md
├── blocked.md
├── deferred.md
├── risks.md
├── implementation-ledger.md
├── changelog.md
└── release-notes.md
```

---

# 121. AI Documentation Rule

At the end of each implementation operation, AI must update:

```text id="c89tmn"
What was completed
What remains
What failed
What is blocked
What was tested
What was not tested
What changed architecturally
What decision remains open
```

---

# 122. No Silent Drift Rule

If actual implementation differs from documentation:

```text id="dd0gnh"
documentation must be updated
```

or:

```text id="eb3l24"
implementation must be corrected
```

depending on which represents the approved architecture.

---

# 123. Architecture Freeze Points

Certain points should be treated as freeze points.

Recommended:

```text id="z1myxf"
Freeze 1 — Tenancy
Freeze 2 — Identity/Auth
Freeze 3 — Authorization
Freeze 4 — API v1
Freeze 5 — Database Core
Freeze 6 — Frontend Shell
Freeze 7 — Production Infrastructure
```

After each freeze, breaking changes require stronger review/ADR.

---

# 124. Freeze 1 — Tenancy

Before large data domains:

```text id="mm7x5a"
Control DB
Tenant DB
Tenant Resolution
Tenant Provisioning
```

must be stable.

---

# 125. Freeze 2 — Identity/Auth

Before business authorization-heavy workflows:

```text id="nrm1hr"
identity
authentication
sessions
credential model
```

must be stable enough.

---

# 126. Freeze 3 — Authorization

Before broad role-specific frontend/API implementation:

```text id="38tl0z"
permissions
policy
scope
precedence
```

must be stable.

---

# 127. Freeze 4 — API v1

Before frontend development becomes extensive:

```text id="ao42jt"
major resource contracts
errors
pagination
authentication
authorization
```

must be stable enough.

---

# 128. Freeze 5 — Database Core

Before high-volume production-like testing:

```text id="2wm0le"
critical entities
relationships
indexes
transaction rules
```

must be reviewed.

---

# 129. Freeze 6 — Frontend Shell

Before building dozens of pages:

```text id="p8xjef"
routing
layout
design system
theme
RTL
API client
auth shell
```

must be stabilized.

---

# 130. Freeze 7 — Production Infrastructure

Before production:

```text id="vw4zdt"
deployment
secrets
database
backup
monitoring
rollback
```

must be verified.

---

# 131. Implementation Order — Compact View

```text id="p3t1dn"
01 Repository
02 Runtime
03 Tenancy
04 Identity
05 Authentication
06 Authorization
07 Education
08 Attendance
09 Assessment
10 Billing
11 Credentials
12 Meetings/Media
13 Communication
14 Analytics
15 Reporting
16 Platform Admin
17 Support
18 Frontend Integration
19 Full Testing
20 Production Hardening
21 Production Release
```

---

# 132. What Must Never Happen

The implementation must not start with:

```text id="1bpg7t"
beautiful dashboard
```

while:

```text id="hvf9vl"
tenancy
auth
authorization
API contract
security
```

remain undefined.

Likewise, it must not begin with:

```text id="9g3k4n"
all database tables
```

without application/domain ownership.

---

# 133. Architecture-First Delivery Rule

The order of work is determined by dependencies, not by what looks visually impressive.

The technically least visible work may be the most important.

Examples:

```text id="x2d1rx"
Tenant resolver
Authorization
Migration orchestration
Idempotency
Audit
```

are foundational even if they have little visible UI.

---

# 134. Business-Visible Delivery Rule

After the foundational platform is stable, delivery should increasingly produce vertical slices that users can actually exercise.

This lets the team validate architecture against real workflows early.

---

# 135. Final Implementation Strategy

The project should therefore follow:

```text id="n4scpr"
FOUNDATION
     ↓
SECURITY BOUNDARY
     ↓
CORE DOMAIN
     ↓
REAL BUSINESS WORKFLOW
     ↓
API
     ↓
FRONTEND
     ↓
VERIFICATION
     ↓
INTEGRATION
     ↓
PRODUCTION HARDENING
```

with documentation updated continuously.

---

# 136. Phase J Acceptance Criteria

## J-AC-001

All implementation streams are explicitly defined.

## J-AC-002

Dependencies between major streams are documented.

## J-AC-003

Milestones have clear exit criteria.

## J-AC-004

AI work is decomposed into bounded tasks.

## J-AC-005

Security-sensitive work has stronger verification requirements.

## J-AC-006

Tenant architecture is implemented before broad tenant business data.

## J-AC-007

Authorization is implemented before sensitive business workflows.

## J-AC-008

API contracts guide frontend implementation.

## J-AC-009

Testing begins with implementation rather than at the end.

## J-AC-010

Infrastructure work is integrated into delivery rather than postponed indefinitely.

## J-AC-011

AI agents cannot silently change approved architecture.

## J-AC-012

Every meaningful implementation task updates documentation.

## J-AC-013

Implementation and verification statuses remain distinct.

## J-AC-014

Production readiness has explicit gates.

## J-AC-015

The project can be executed incrementally without losing architectural coherence.

---

# 137. Open Decisions

### J-OD-001
Final MVP boundary.

### J-OD-002
Exact milestone dates.

### J-OD-003
Team/AI-agent parallelism model.

### J-OD-004
Exact repository strategy.

### J-OD-005
Exact release strategy.

### J-OD-006
Pilot tenant profile.

### J-OD-007
Exact production rollout strategy.

### J-OD-008
Final prioritization of post-MVP features.

These should not be silently invented during implementation.

---

# 138. Explicit Non-Goals

Phase J does not:

```text id="1la8j1"
write application code
create migrations
create infrastructure
create UI
configure providers
deploy production
```

It defines how those activities should be executed.

---

# 139. Relationship to Previous Phases

```text id="1zz4ha"
A — Business Foundation
B — Requirements
C — Architecture
D — Domain / ERD / Database
E — Security / Scalability / Resilience
F — API Contract
G — Frontend Architecture
H — Testing / Quality
I — DevOps / Infrastructure
J — Implementation & Delivery Master Plan
```

Phase J is the execution bridge between architecture and actual implementation.

---

# 140. Phase Status

```text id="t4wz1h"
Phase A — Approved
Phase B — Approved
Phase C — Approved
Phase D — Approved
Phase E — Approved
Phase F — Approved
Phase G — Approved
Phase H — Approved
Phase I — Approved
Phase J — Draft / Pending Approval
```

---

# 141. Next Phase

After approval of Phase J:

# PHASE K — FINAL MASTER SPECIFICATION & AI HANDOFF

Phase K will be the final documentation package.

It will establish:

```text id="6zn3jq"
Single Source of Truth
Master Architecture
Business Requirements
Domain Model
ERD Rules
Security
API
Frontend
Testing
Infrastructure
Implementation Order
AI Rules
Documentation Governance
Status Model
ADR Governance
```

It should also define exactly how an AI agent entering the repository for the first time discovers:

```text What the project is
What has been approved
What has been implemented
What is pending
What is blocked
What it is allowed to modify
What it must read first
What it must update after work
What it must never assume
How it proves completion
```

That final phase is what turns all of these documents into a **single reusable AI-ready project specification**.
:::

**حالة Phase J الآن: `Draft — Pending Approval`.**

وبعد اعتماد J، يبقى فعلًا **Phase K هي آخر مرحلة في دورة الـdocumentation الحالية**: الـMaster Specification & AI Handoff. وبعدها نكون خلصنا مرحلة التخطيط والتوثيق، ونبدأ التنفيذ الفعلي على أساس ثابت.