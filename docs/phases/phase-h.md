# PHASE H — TESTING, QUALITY ENGINEERING & VERIFICATION ARCHITECTURE

**Project:** Multi-Tenant SaaS LMS & Education Management Platform  
**Architecture Baseline:** Phases A–G Approved  
**Current Phase:** H  
**Status:** Draft — Pending Approval  
**Implementation Status:** Specification Only — No Implementation  
**Backend:** Laravel  
**Frontend:** Next.js + React + TypeScript  
**Database:** PostgreSQL  
**API:** Versioned REST API + OpenAPI  
**Architecture:** Modular Monolith + Control Plane / Tenant Data Plane  
**Tenant Model:** Control Database + Tenant Database per Tenant

---

# 1. Purpose

Phase H defines the complete quality engineering and verification strategy for the platform.

The objective is not simply to create automated tests.

The objective is to establish a system where the project can continuously prove that:

- business requirements are implemented correctly
- domain rules are preserved
- tenant isolation works
- authorization cannot be bypassed
- APIs conform to their contracts
- frontend behavior matches the API
- state machines reject illegal transitions
- payments cannot accidentally create duplicate access
- credentials cannot bypass security rules
- analytics remain correct
- external integrations fail safely
- large workloads do not break core transactions
- regressions are detected before release
- AI-generated code is verified rather than trusted
- production releases meet explicit quality gates

---

# 2. Core Quality Principle

The project must follow:

```text
Specification
      ↓
Implementation
      ↓
Verification
      ↓
Evidence
      ↓
Release
```

A feature is not complete because:

```text
the code exists
```

or:

```text
the UI looks correct
```

or:

```text
the AI says it is complete
```

A feature is complete when its required behavior has sufficient verification evidence.

---

# 3. Quality Engineering Principles

## QE-PR-001 — Test the Contract

Tests should verify documented behavior, not implementation details unnecessarily.

## QE-PR-002 — Test Security as a First-Class Requirement

Security tests are not optional enhancements.

## QE-PR-003 — Test Tenant Isolation Explicitly

Every tenant-sensitive capability requires cross-tenant verification.

## QE-PR-004 — Test Business State Transitions

State machines must be tested for both valid and invalid transitions.

## QE-PR-005 — Test Failure Paths

A system is not sufficiently tested if only successful operations work.

## QE-PR-006 — Prefer Deterministic Tests

Tests should minimize:

- uncontrolled time
- random data without seeds
- external network dependency
- shared mutable state

## QE-PR-007 — Avoid Test Theater

A test that simply executes code without asserting meaningful behavior provides little value.

## QE-PR-008 — Production-Like Verification

Critical workflows must be tested in conditions representative of real tenant usage.

## QE-PR-009 — AI Code Requires Independent Verification

AI-generated code must pass the same quality gates as human-written code.

## QE-PR-010 — Quality Is Layered

No single testing layer is sufficient.

---

# 4. Quality Pyramid

The platform should use multiple levels:

```text
                 E2E / Critical Journeys
                         ▲
                         │
                Integration / Contract
                         ▲
                         │
                Feature / Component
                         ▲
                         │
                     Unit Tests
                         ▲
                         │
                 Static Verification
```

Additional dimensions:

```text
Security
Performance
Accessibility
Reliability
Resilience
Data Integrity
Tenant Isolation
```

These dimensions cut across the entire pyramid.

---

# 5. Verification Layers

The complete verification architecture consists of:

```text
1. Static Analysis
2. Unit Testing
3. Domain Testing
4. Application/Use-Case Testing
5. Database Integration Testing
6. API Testing
7. API Contract Testing
8. Frontend Component Testing
9. Frontend Feature Testing
10. End-to-End Testing
11. Security Testing
12. Tenant Isolation Testing
13. Performance Testing
14. Load Testing
15. Resilience Testing
16. Accessibility Testing
17. Migration Testing
18. Backup/Restore Verification
19. Observability Verification
20. Release Verification
```

Not every change requires every layer.

The risk classification determines the required depth.

---

# 6. Test Ownership

Quality responsibilities are distributed.

```text
Domain Layer
→ business invariants

Application Layer
→ use cases / transactions

Infrastructure
→ persistence / integrations

API
→ contracts / authorization / validation

Frontend
→ presentation / interaction / UX

E2E
→ critical user journeys

Security
→ attack resistance / isolation

Performance
→ scalability / response behavior

Operations
→ deployment / recovery / observability
```

---

# 7. Test Environment Strategy

Recommended environments:

```text
LOCAL
    ↓
DEVELOPMENT
    ↓
STAGING
    ↓
PRODUCTION
```

Potential additional isolated environments:

```text
EPHEMERAL TEST ENVIRONMENT
SECURITY TEST ENVIRONMENT
PERFORMANCE TEST ENVIRONMENT
```

The exact environment topology is an Open Decision.

---

# 8. Test Data Principles

Test data must be:

- deterministic where appropriate
- isolated
- disposable
- reproducible
- tenant-aware

Tests must never depend on production data.

Production data must not be copied into ordinary development/test environments without an approved anonymization/security process.

---

# 9. Multi-Tenant Test Dataset

The standard automated test environment should contain multiple tenants.

Minimum conceptual dataset:

```text
Tenant A
├── Teacher A
├── Assistant A
├── Students A1/A2
├── Parent A
├── Courses
└── Payments

Tenant B
├── Teacher B
├── Assistant B
├── Students B1/B2
├── Parent B
├── Courses
└── Payments
```

This is critical because many isolation bugs cannot be discovered with only one tenant.

---

# 10. Cross-Tenant Test Principle

Every tenant-scoped resource category must have at least one explicit test proving:

```text
Tenant A actor
      ↓
attempts Tenant B resource
      ↓
DENIED
```

This applies to:

```text
students
parents
courses
lessons
attendance
assignments
submissions
exams
grades
payments
subscriptions
entitlements
credentials
devices
meetings
reports
notifications
analytics
files
```

The exact list may expand as new resources are introduced.

---

# 11. Unit Testing

Unit tests should cover deterministic business logic.

Examples:

```text
permission evaluation
state transition rules
metric calculations
formatting
validation rules
policy decisions
domain services
pure utility functions
```

Unit tests should avoid unnecessary framework coupling.

---

# 12. Domain Unit Tests

Domain models and services should be tested around business invariants.

Example:

```text
Payment
```

Tests:

```text
SUBMITTED → UNDER_REVIEW
UNDER_REVIEW → APPROVED
UNDER_REVIEW → REJECTED
```

and invalid:

```text
APPROVED → SUBMITTED
APPROVED → REJECTED
REJECTED → APPROVED
```

unless the approved domain specification explicitly allows them.

---

# 13. State Machine Testing

Every stateful domain object should have transition coverage.

Initial list:

```text
Payment
Subscription
Credential
Device Binding
Exam Attempt
Support Session
Meeting
Report Job
Notification
```

Each state machine requires:

```text
valid transitions
invalid transitions
duplicate transitions
replayed transitions
concurrent transitions
terminal states
```

---

# 14. State Machine Test Matrix

Example:

| Object | From | Action | Expected |
|---|---|---|---|
| Payment | Submitted | Approve | Allowed |
| Payment | Approved | Approve | Rejected / idempotent |
| Credential | Active | Revoke | Allowed |
| Credential | Revoked | Activate | Rejected |
| Exam Attempt | In Progress | Submit | Allowed |
| Exam Attempt | Submitted | Submit | Rejected / idempotent |
| Support Session | Active | End | Allowed |
| Support Session | Expired | Operate | Rejected |

The authoritative state definitions come from the relevant domain documents.

---

# 15. Application / Use-Case Testing

Every critical application use case should have integration-level tests.

Examples:

```text
ApprovePayment
ActivateCredential
BindDevice
ReplaceDevice
RecordAttendance
SubmitAssignment
SubmitExamAttempt
PublishGrade
CreateMeeting
GenerateReport
CreateSupportSession
```

Tests must verify business side effects, not merely HTTP responses.

---

# 16. Payment Use-Case Tests

The payment workflow must test:

```text
payment submission
review
approval
rejection
duplicate approval
duplicate rejection
wrong tenant
unauthorized reviewer
invalid state
subscription creation
entitlement creation
notification event
audit event
```

Critical invariant:

```text
One successful approval
≠
multiple subscriptions
```

---

# 17. Payment Idempotency Tests

Example:

```text
Request A
Idempotency-Key = X

Request A repeated
Idempotency-Key = X
```

Expected:

```text
same logical result
no duplicate side effects
```

Then:

```text
Idempotency-Key = Y
```

must be evaluated as a separate operation according to the business state.

---

# 18. Credential Testing

Credential tests must cover:

```text
generation
assignment
issuance
activation
device binding
successful login
invalid credential
expired credential
revoked credential
suspended credential
wrong tenant
rate limiting
replay attempts
device replacement
```

---

# 19. Credential Security Tests

The system must verify:

```text
raw credential secret is not stored
raw credential secret is not logged
credential cannot directly become a permanent session
credential cannot access another tenant
credential brute force is rate-limited
revoked credentials cannot authenticate
expired credentials cannot authenticate
```

---

# 20. Device Binding Tests

Test:

```text
first device binding
same-device reuse
second-device attempt
approved replacement
unauthorized replacement
revoked device
credential suspension
device-binding race condition
```

The final allowed device policy is governed by the Credentials/Security specifications.

---

# 21. Attendance Tests

Test:

```text
valid QR
invalid QR
expired QR
wrong tenant QR
unauthorized scanner
valid session
closed session
outside allowed time
duplicate scan
concurrent duplicate scan
manual correction
```

Critical invariant:

```text
(session_id, student_id)
```

must not produce unintended duplicate attendance.

---

# 22. Exam Tests

Test:

```text
attempt creation
start
answer save
autosave where applicable
timeout
submission
duplicate submission
late submission
invalid attempt
wrong student
wrong tenant
grade calculation
grade publication
```

---

# 23. Exam Concurrency Tests

Important scenario:

```text
Two requests
same exam attempt
same submission
nearly simultaneously
```

Expected:

```text
one valid finalization
no corrupted attempt
no duplicate final submission
```

---

# 24. Assignment Tests

Test:

```text
student eligibility
submission
deadline
late submission
resubmission
attachment validation
unauthorized submission
teacher grading
grade publication
```

---

# 25. Subscription Tests

Test:

```text
creation
activation
suspension
cancellation
duplicate activation
invalid transition
wrong tenant
authorization
relationship to payment
relationship to entitlement
```

Critical invariant:

```text
Subscription ≠ Authentication
```

---

# 26. Entitlement Tests

Test that entitlement is correctly granted/revoked based on the defined business flow.

Example:

```text
Payment Approved
        ↓
Subscription Active
        ↓
Entitlement Granted
```

The system must not accidentally grant paid access merely because:

```text
payment submitted
```

---

# 27. Analytics Testing

Analytics require two levels of testing.

## Raw Event Tests

Verify:

```text
event ingestion
schema
tenant
student
timestamps
deduplication
ordering behavior
```

## Derived Metric Tests

Verify:

```text
attendance %
completion %
homework completion
delay
exam performance
progress
custom metrics
```

---

# 28. Analytics Historical Integrity

Versioned custom metrics must preserve historical meaning.

Example:

```text
Metric Version 1
Accuracy calculation A

Metric Version 2
Accuracy calculation B
```

Historical records created under Version 1 must not silently become Version 2 calculations.

This requires explicit analytics tests.

---

# 29. API Testing

API tests must verify:

```text
authentication
authorization
tenant resolution
validation
responses
errors
pagination
filtering
sorting
idempotency
state transitions
rate limiting
```

---

# 30. API Contract Testing

The implementation must be verified against the OpenAPI contract.

Test categories:

```text
request schema
response schema
status codes
required fields
types
enum values
error structures
pagination
```

The OpenAPI document and actual API behavior must not drift silently.

---

# 31. API Negative Testing

Every important endpoint should test malformed and malicious inputs.

Examples:

```text
missing fields
wrong types
invalid IDs
invalid enum
oversized input
unexpected fields
unauthorized IDs
cross-tenant IDs
expired session
invalid state
duplicate request
```

---

# 32. IDOR / BOLA Testing

For each resource endpoint:

```text
Actor owns Resource A
Actor attempts Resource B
```

Expected:

```text
DENIED
```

Tests must not rely solely on frontend navigation.

This is one of the highest-priority security test categories.

---

# 33. Authorization Matrix Testing

The authorization matrix should be converted into automated test scenarios.

For each:

```text
Actor
Role
Permission
Scope
Resource
Action
Tenant
```

verify the expected decision.

Example:

```text
Assistant
+ payments.approve
+ assigned scope
+ assigned student payment
→ ALLOW
```

versus:

```text
Assistant
+ payments.approve
+ different branch/scope
→ DENY
```

---

# 34. RBAC + ABAC Tests

Test:

```text
role-based allow
role-based deny
attribute-based allow
attribute-based deny
scope restriction
explicit deny
explicit allow
inheritance
default deny
```

The final precedence is determined by the approved Security Policy.

---

# 35. Platform Support Tests

Support functionality must test:

```text
support session creation
reason required
target tenant required
expiration
authorization
tenant isolation
session expiration
session termination
audit creation
post-session access denial
```

Critical invariant:

```text
Support session ends
        ↓
tenant access ends
```

---

# 36. Global Identity Tests

Test:

```text
global student identity exists
tenant mapping exists
tenant mapping A accessible
tenant mapping B accessible when authorized
tenant mapping B not accessible merely because identity is shared
```

Critical invariant:

```text
Global Identity ≠ Cross-Tenant Authorization
```

---

# 37. Parent Access Tests

Test:

```text
parent → own child
parent → unrelated student
parent → another tenant child
parent → unauthorized tenant
```

Expected unauthorized cases:

```text
DENY
```

---

# 38. API Rate-Limit Testing

Security-sensitive endpoints must be tested for:

```text
repeated login attempts
credential verification attempts
QR scan abuse
exam submission abuse
file upload abuse
webhook replay
```

Verify:

```text
429 behavior
lockout/throttling policy
recovery behavior
audit/security event
```

---

# 39. Input Security Testing

Test defenses against common classes of malicious input:

```text
SQL injection
XSS
command injection
path traversal
SSRF
malicious file upload
header manipulation
JSON abuse
oversized payloads
```

The exact security tooling is an implementation decision.

---

# 40. File Upload Security Tests

Payment proof and other file uploads require tests for:

```text
allowed type
invalid type
oversized file
malicious file
wrong tenant
unauthorized download
path traversal
content-type spoofing
private storage enforcement
```

---

# 41. Webhook Security Tests

For each supported webhook:

```text
valid signature
invalid signature
expired timestamp
replayed event
duplicate event ID
unknown event
malformed payload
wrong provider
wrong tenant mapping
```

---

# 42. External Integration Tests

External providers should be tested at multiple levels.

## Unit

Provider adapter behavior.

## Contract / Mock

Expected provider request/response.

## Integration

Real provider sandbox/test environment where available.

## Failure

Timeout / error / malformed response / rate limit.

---

# 43. Google Meet Integration Tests

Test:

```text
meeting creation
meeting persistence
external ID mapping
duplicate creation
provider timeout
provider failure
invalid credentials
cancel
refresh/recovery where supported
```

Core tenant data must remain consistent if Google API fails.

---

# 44. Video Provider Tests

Provider abstraction must be tested so that:

```text
Provider A
```

can be replaced or complemented by:

```text
Provider B
```

without changing core course/lesson domain logic.

---

# 45. Notification Tests

Test:

```text
notification creation
delivery channel selection
delivery failure
retry
duplicate prevention
read state
tenant isolation
user isolation
```

---

# 46. Frontend Unit Tests

Frontend unit tests should cover:

```text
formatters
selectors
pure utilities
permission presentation helpers
form validation
state mapping
display transformations
```

---

# 47. Frontend Component Tests

Important components should be tested across:

```text
default
loading
empty
error
success
disabled
permission denied
mobile
RTL
dark mode
```

where applicable.

---

# 48. Frontend Feature Tests

Critical feature workflows:

```text
student login
student dashboard
course learning
video playback
assignment submission
exam
payment submission
teacher payment review
attendance scanner
parent dashboard
support session
```

---

# 49. End-to-End Testing

E2E tests should represent actual user journeys.

Minimum critical journeys:

```text
E2E-001 Student Authentication
E2E-002 Student Learning
E2E-003 Payment Submission
E2E-004 Payment Approval
E2E-005 Credential Activation
E2E-006 Attendance Scan
E2E-007 Assignment Submission
E2E-008 Exam Submission
E2E-009 Parent View
E2E-010 Teacher Management
E2E-011 Support Session
```

---

# 50. E2E Tenant Isolation

At least one full E2E scenario should prove:

```text
Tenant A user
cannot navigate/API-call/UI-load
Tenant B private data
```

This should be repeated across the highest-risk flows.

---

# 51. Browser Matrix

The exact supported browser matrix is an Open Decision.

The implementation should eventually define supported:

```text
desktop browsers
mobile browsers
tablet browsers
iOS Safari
Android Chrome
```

The testing matrix must be based on actual product support commitments.

---

# 52. Responsive Testing

Major screens must be verified at:

```text
mobile
tablet
desktop
large desktop
```

Particular focus:

```text
student dashboard
video learning
exam
QR scanner
payment upload
teacher tables
analytics
platform dashboard
```

---

# 53. RTL Testing

RTL testing must verify:

```text
navigation
forms
tables
dialogs
icons
breadcrumbs
charts
pagination
notifications
video controls
mobile navigation
```

No critical feature is complete without RTL verification.

---

# 54. Dark Mode Testing

Verify:

```text
contrast
text
borders
icons
charts
forms
dialogs
tables
status colors
tenant branding
```

Dark mode must not simply invert colors.

---

# 55. Accessibility Testing

Accessibility testing should cover:

```text
keyboard-only navigation
focus order
focus visibility
ARIA semantics where needed
form labels
error messages
dialogs
tables
color contrast
screen-reader behavior
reduced motion
```

---

# 56. Performance Testing

Performance testing is divided into:

```text
Frontend performance
API performance
Database performance
Queue performance
Integration performance
```

---

# 57. Frontend Performance Tests

Measure where useful:

```text
initial load
navigation
dashboard rendering
large tables
analytics screens
video page
mobile performance
JavaScript bundle size
```

The project should establish quantitative budgets before release.

Exact budgets remain an Open Decision.

---

# 58. API Performance Testing

Test representative endpoints:

```text
GET student dashboard
GET student courses
GET teacher dashboard
GET attendance
GET payments
GET analytics
POST attendance scan
POST exam submission
POST payment approval
```

Test both:

```text
normal load
peak load
```

---

# 59. Tenant Size Profiles

Performance tests must not model all tenants as identical.

At minimum, define profiles such as:

```text
Small Tenant
Medium Tenant
Large Tenant
Very Large Tenant
```

Exact numerical thresholds should be finalized from capacity planning.

---

# 60. Realistic Workload Model

Performance tests should simulate realistic behavior.

Examples:

```text
many students logging in
morning attendance burst
exam submission burst
teacher opening dashboard
large report generation
video event ingestion
notification burst
payment review activity
```

---

# 61. Concurrent Attendance Test

Scenario:

```text
Hundreds of students
within a short interval
same classroom/session
```

Verify:

```text
no duplicate attendance
acceptable response time
no database corruption
no queue collapse
```

---

# 62. Concurrent Exam Submission Test

Scenario:

```text
Large number of students
submitting exams simultaneously
```

Verify:

```text
no duplicate attempts
no lost answers
no inconsistent final state
acceptable database load
queue stability
```

---

# 63. Database Performance Testing

Test:

```text
query latency
connection usage
indexes
large tenant behavior
transaction contention
analytics workloads
```

Avoid optimizing purely based on theoretical assumptions.

Use realistic query patterns.

---

# 64. Queue Performance Testing

Test:

```text
queue depth
worker throughput
retry behavior
failed jobs
dead-letter behavior where applicable
tenant fairness
```

Heavy asynchronous work must not starve critical jobs.

---

# 65. Tenant Fairness

A large tenant must not consume all shared worker/database capacity such that small tenants become unusable.

The infrastructure should eventually support:

```text
queue isolation
priority
rate limits
dedicated infrastructure
```

where justified.

---

# 66. Scalability Tests

Verify the invariants:

```text
SCALE-INV-001
Application can scale horizontally.

SCALE-INV-002
Business logic does not depend on physical DB location.

SCALE-INV-003
Large tenants can move to dedicated infrastructure.

SCALE-INV-004
Async workloads scale independently.

SCALE-INV-005
Analytics do not block transactional workloads.

SCALE-INV-006
Provider failures do not corrupt core state.
```

---

# 67. Resilience Testing

Test failures such as:

```text
database temporary failure
Redis/cache failure where used
queue worker failure
email provider failure
WhatsApp provider failure
Google Meet failure
video provider failure
network interruption
storage failure
```

Expected behavior must be defined per dependency.

---

# 68. Graceful Degradation

Examples:

If email fails:

```text
core transaction remains successful
notification delivery marked failed/retryable
```

If Google Meet fails:

```text
core lesson/session record remains consistent
```

If analytics processing fails:

```text
transactional learning data remains intact
```

---

# 69. Database Failure Tests

The system must verify behavior under:

```text
connection timeout
transaction rollback
deadlock
temporary unavailability
```

Critical business operations must not leave partial state.

---

# 70. Transaction Rollback Tests

Example:

```text
Payment approval
    ↓
Payment updated
    ↓
Subscription creation fails
```

The system must follow the defined transaction policy.

It must not leave:

```text
Payment = APPROVED
Subscription = missing
```

unless the architecture explicitly defines an intermediate recoverable state.

---

# 71. Idempotency Failure Testing

Simulate:

```text
request succeeds
response is lost
client retries
```

The second request must not duplicate side effects for idempotent operations.

This is particularly important for:

```text
payment approval
credential activation
attendance scan
exam submission
meeting creation
```

---

# 72. Concurrency Testing

Critical resources require race-condition tests.

Examples:

```text
two payment reviewers
two attendance scans
two exam submissions
two device replacement requests
two credential activations
```

Expected outcomes must be deterministic.

---

# 73. Deadlock / Lock Contention

Database operations involving:

```text
payments
subscriptions
credentials
attendance
exam attempts
```

should be tested under concurrency.

The implementation must avoid unnecessarily broad transactions.

---

# 74. Backup and Restore Verification

Backups are not considered valid merely because:

```text
backup job succeeded
```

The system must periodically verify restoration.

Test:

```text
backup
restore
schema integrity
data integrity
application connectivity
tenant database recovery
```

---

# 75. Tenant Database Recovery

Because each tenant may have a separate database, recovery procedures must support:

```text
individual tenant restoration
```

without unnecessarily restoring the entire platform.

The exact operational implementation belongs to infrastructure planning.

---

# 76. Migration Testing

Every database migration should be tested for:

```text
fresh installation
upgrade from previous version
rollback where supported
existing production-like data
large tenant
```

---

# 77. Migration Safety

Migrations must not unexpectedly:

```text
delete business data
break existing API behavior
destroy indexes required for critical queries
lock large tables excessively
invalidate tenant DBs
```

Large migrations require an explicit rollout strategy.

---

# 78. Backward Compatibility Testing

When API/database changes occur, verify:

```text
existing clients
existing records
existing tenant databases
existing integrations
```

remain compatible according to the supported compatibility policy.

---

# 79. Data Integrity Testing

Important invariants:

```text
Payment references valid tenant/student context
Subscription belongs to correct tenant
Entitlement belongs to correct subscription/product context
Credential belongs to correct student/tenant
Attendance belongs to valid session/student
Exam attempt belongs to correct student/exam
Parent relationship belongs to correct tenant
```

---

# 80. Referential Integrity

Where native database foreign keys exist, verify them.

Where relationships cross database boundaries and cannot use native foreign keys, application-level integrity tests are required.

---

# 81. Soft Delete Testing

Where soft delete is used, verify that:

```text
active queries
historical reports
audit
relationships
unique constraints
```

behave correctly.

Financial/academic historical records must not disappear accidentally.

---

# 82. Audit Testing

Verify audit events are generated for required actions.

Test:

```text
payment approval
credential revocation
device replacement
permission change
support access
grade correction
attendance correction
```

Audit logs should be immutable according to the audit architecture.

---

# 83. Audit Security

Tests must verify that:

```text
secrets not logged
passwords not logged
credential plaintext not logged
provider tokens not logged
payment secrets not logged
```

---

# 84. Observability Testing

Verify that failures can be traced.

A critical request should allow correlation across:

```text
HTTP request
application logs
database operation where observable
queue job
external provider call
audit event
```

using the request/correlation identifier.

---

# 85. Health Check Testing

Health checks should distinguish:

```text
application alive
database available
queue operational
critical dependency available
```

A health check must not expose sensitive infrastructure information publicly.

---

# 86. Alert Verification

Important alerts should be tested.

Examples:

```text
high error rate
queue backlog
database saturation
integration failures
authentication abuse
storage growth
backup failure
tenant provisioning failure
```

The exact thresholds are operational decisions.

---

# 87. Security Testing Strategy

Security verification should include:

```text
SAST
dependency scanning
secret scanning
DAST where appropriate
API security testing
authorization testing
tenant isolation testing
file upload testing
webhook testing
rate-limit testing
session testing
```

Exact tooling remains an implementation decision.

---

# 88. Dependency Security

Every release should verify dependencies for known vulnerabilities according to the project's security process.

Dependencies should be:

```text
version controlled
reviewed
audited
updated through controlled changes
```

---

# 89. Secret Scanning

CI should prevent accidental commits of:

```text
API keys
database passwords
provider tokens
private keys
credentials
```

Secrets must be injected through appropriate environment/secret-management mechanisms.

---

# 90. Static Analysis

Backend:

```text
PHP type checking
linting
code quality
architecture checks
```

Frontend:

```text
TypeScript
ESLint
formatting
dependency checks
```

The exact tooling is an Open Decision.

---

# 91. Architecture Tests

The codebase should eventually include automated checks for architectural rules.

Examples:

```text
Domain must not depend on HTTP
Domain must not depend on vendor SDK
Feature A must not import internal implementation of Feature B
Tenant business logic must not select DB connection from client input
Frontend feature must not bypass API layer
```

---

# 92. Dependency Direction Tests

Expected backend direction:

```text
Presentation
    ↓
Application
    ↓
Domain
    ↓
Infrastructure
```

Infrastructure may implement interfaces required by inner layers.

The domain must not directly depend on infrastructure vendor implementations.

---

# 93. Frontend Dependency Tests

Expected conceptual direction:

```text
App / Page
    ↓
Feature
    ↓
Data Layer
    ↓
API Contract
```

Shared UI should not import feature-specific business logic.

---

# 94. Contract Drift Detection

CI should detect when:

```text
OpenAPI
```

and actual implementation diverge.

Similarly, generated frontend types should remain synchronized with the approved API contract.

---

# 95. Test Naming

Test names should describe behavior.

Good:

```text
approving_a_reviewed_payment_grants_the_expected_entitlement
```

Bad:

```text
test_payment_1
```

Tests should be understandable without reading implementation.

---

# 96. Test Isolation

Each automated test should cleanly control:

```text
database state
tenant state
authentication state
time
external providers
queues
cache
```

Tests must not rely on execution order unless the test suite explicitly defines a controlled scenario.

---

# 97. Time Control

Time-sensitive domains require controllable clocks.

Examples:

```text
credential expiration
assignment deadlines
exam timing
session expiration
support session expiry
notification schedules
```

Tests should not rely on the actual current system time.

---

# 98. Randomness Control

Where random IDs or data are used:

```text
tests should remain reproducible
```

Use deterministic fixtures/seeds where useful.

---

# 99. Test Fixtures

Fixtures should represent meaningful domain states.

Examples:

```text
ActiveStudent
PendingPayment
ApprovedPayment
ActiveSubscription
ActiveCredential
BoundDevice
OpenSession
InProgressExam
SubmittedExam
```

Avoid giant generic fixtures that create unnecessary unrelated records.

---

# 100. Test Factories

Factories should allow concise construction of valid domain scenarios.

Example:

```text
StudentFactory
TenantFactory
PaymentFactory
CourseFactory
ExamFactory
CredentialFactory
```

Factories should preserve domain invariants.

---

# 101. Test Database Strategy

Tests may use:

```text
transaction rollback
database refresh
isolated test databases
ephemeral databases
```

depending on test layer.

Cross-tenant tests must create actual distinct tenant contexts.

---

# 102. Queue Testing

Test:

```text
job dispatch
job payload
tenant context propagation
retry
failure
duplicate delivery
idempotency
```

Critical jobs must not accidentally execute under another tenant.

---

# 103. Queue Tenant Isolation

Critical invariant:

```text
Job created for Tenant A
        ↓
worker resolves Tenant A
        ↓
job cannot operate on Tenant B
```

The queue payload must not be blindly trusted as authorization, but it must carry enough trusted context to resolve the correct tenant.

---

# 104. Cache Isolation Tests

Verify:

```text
Tenant A cache key
≠
Tenant B cache key
```

and:

```text
Tenant A request
cannot receive Tenant B cached response
```

This is a critical multi-tenant security test.

---

# 105. Storage Isolation Tests

Verify:

```text
Tenant A file
cannot be downloaded by Tenant B
```

even if:

```text
file ID is known
URL is guessed
resource is referenced directly
```

---

# 106. CDN / Browser Cache Isolation

If CDN/browser caching is introduced, test that private tenant/user responses cannot become publicly/shared cached responses.

---

# 107. Frontend Cache Isolation

Verify that switching:

```text
Tenant A
→
Tenant B
```

does not leave Tenant A private data visible through:

```text
React Query/cache
global store
local state
browser storage
prefetched data
```

---

# 108. PWA Testing

If PWA is implemented, test:

```text
installation
launch
update
service-worker lifecycle
offline shell
cache invalidation
logout
tenant switching
sensitive data exclusion
```

---

# 109. Service Worker Security Tests

Verify that service worker caching does not retain sensitive:

```text
payment proofs
credentials
private reports
support session data
tenant-private API responses
```

unless explicitly approved and secured.

---

# 110. Accessibility Quality Gate

Critical workflows should meet the project's accessibility target before release.

At minimum:

```text
keyboard navigation
focus
labels
contrast
errors
dialogs
```

must pass defined checks.

---

# 111. Visual Regression Strategy

Visual snapshots may cover:

```text
design system
student dashboard
teacher dashboard
parent dashboard
payment workflow
exam UI
RTL
dark mode
mobile
```

Visual snapshots should not become so broad that harmless changes make the suite unusable.

---

# 112. Performance Regression

Performance-sensitive pages/endpoints should have baseline measurements.

A release should be reviewed if:

```text
response latency materially regresses
bundle size materially increases
database load materially increases
queue throughput materially decreases
```

Exact thresholds require later capacity decisions.

---

# 113. Quality Gates

A production release should require at least:

```text
type checks pass
lint pass
unit tests pass
critical integration tests pass
API contract tests pass
critical E2E tests pass
security checks pass
migration validation pass
build succeeds
no unresolved critical defects
```

Additional gates apply to high-risk changes.

---

# 114. Risk-Based Testing

Not every change needs the same test depth.

Suggested risk levels:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

---

# 115. Low-Risk Changes

Examples:

```text
visual copy
non-critical styling
safe UI spacing
```

Expected:

```text
type/lint
component verification where applicable
visual review
```

---

# 116. Medium-Risk Changes

Examples:

```text
CRUD feature
new filter
dashboard widget
non-critical API
```

Expected:

```text
unit
integration
API/component
appropriate E2E
```

---

# 117. High-Risk Changes

Examples:

```text
payment
credential
authentication
authorization
tenant resolution
exam submission
grades
support access
```

Expected:

```text
unit
integration
API
security
tenant isolation
concurrency where relevant
E2E
```

---

# 118. Critical Changes

Critical changes include:

```text
tenant isolation
authentication
authorization engine
payment state
credential security
database architecture
migration of critical data
```

Required:

```text
full relevant test pyramid
security verification
negative testing
cross-tenant testing
concurrency testing
rollback/recovery consideration
manual review
```

---

# 119. Definition of Done

A feature cannot be marked complete until:

```text
business behavior verified
security behavior verified
tenant behavior verified
API contract verified
frontend behavior verified where applicable
failure behavior verified
documentation updated
required tests pass
no critical known defect remains
```

---

# 120. Definition of Ready

Before implementation begins, a feature should have:

```text
business requirement
domain ownership
API contract where applicable
authorization rules
tenant scope
acceptance criteria
error behavior
state transitions where applicable
test scenarios
```

If these are missing, implementation should not silently invent them.

---

# 121. Bug Classification

Defects should be classified at least as:

```text
BLOCKER
CRITICAL
HIGH
MEDIUM
LOW
```

Classification should be based on impact, not developer preference.

---

# 122. Security Defect Priority

Any issue involving:

```text
cross-tenant data exposure
authentication bypass
authorization bypass
credential compromise
payment integrity
private file exposure
secret leakage
```

must receive immediate high-priority treatment according to incident policy.

---

# 123. Regression Testing

Every fixed defect should receive a regression test when practical.

Example:

```text
Bug:
Assistant could access another branch's student.

Fix:
Authorization scope corrected.

Required:
Regression test proving cross-branch access remains denied.
```

---

# 124. AI-Generated Code Verification

AI-generated code must be treated as untrusted implementation output until verified.

The AI must:

```text
read relevant specifications
implement
run tests
inspect failures
fix
rerun
document result
```

The AI must not claim:

```text
implemented successfully
```

without evidence.

---

# 125. AI Verification Report

Each meaningful AI implementation task should produce internally:

```text
Changed Files
Tests Added
Tests Run
Tests Passed
Tests Failed
Known Limitations
Security Considerations
Documentation Updated
Open Issues
```

---

# 126. AI Anti-Hallucination Rule

If the AI cannot verify:

```text
API exists
dependency exists
test passes
migration succeeded
provider works
feature is deployed
```

it must state that verification is pending.

It must never fabricate test output.

---

# 127. AI Documentation Update Rule

After every meaningful implementation step:

```text
architecture.md
relevant domain documentation
API documentation
frontend documentation
project status
```

must be updated as applicable.

---

# 128. AI Completion Evidence

A feature may be marked:

```text
IMPLEMENTED
```

only if the required implementation exists.

It may be marked:

```text
VERIFIED
```

only if required verification passed.

It may be marked:

```text
PRODUCTION READY
```

only after release gates pass.

These statuses must not be conflated.

---

# 129. Recommended Status Model

Project status should distinguish:

```text
PLANNED
IN PROGRESS
IMPLEMENTED
PARTIALLY VERIFIED
VERIFIED
BLOCKED
DEFERRED
REJECTED
PRODUCTION READY
```

---

# 130. Test Evidence

For important features, evidence should be traceable.

Example:

```text
Requirement:
SEC-INV-001

Tests:
SEC-TENANT-001
SEC-TENANT-002
API-TENANT-004

Result:
PASS
```

This creates a traceability chain.

---

# 131. Requirements Traceability Matrix

The project should maintain:

```text
Requirement
    ↓
Use Case
    ↓
API
    ↓
Implementation
    ↓
Test
    ↓
Evidence
```

Example:

```text
BR-PAY-001
    ↓
ApprovePayment
    ↓
POST /payments/{id}/approve
    ↓
PaymentApprovalService
    ↓
PAY-TEST-014
    ↓
PASS
```

---

# 132. Security Traceability

Security requirements should similarly map to tests.

Example:

```text
SEC-INV-001
    ↓
Tenant Authorization Policy
    ↓
Student API
    ↓
Cross-Tenant Test
    ↓
PASS
```

---

# 133. Quality Documentation

Recommended structure:

```text
docs/testing/
├── testing-strategy.md
├── test-pyramid.md
├── environments.md
├── test-data.md
├── unit-testing.md
├── integration-testing.md
├── api-testing.md
├── contract-testing.md
├── e2e-testing.md
├── security-testing.md
├── tenant-isolation.md
├── performance-testing.md
├── resilience-testing.md
├── accessibility-testing.md
├── migration-testing.md
├── backup-restore-testing.md
├── release-gates.md
└── traceability.md
```

---

# 134. CI Pipeline Concept

The eventual CI pipeline should conceptually be:

```text
Code Change
    ↓
Install / Dependency Validation
    ↓
Formatting / Lint
    ↓
Type Check
    ↓
Static Analysis
    ↓
Unit Tests
    ↓
Integration Tests
    ↓
API Contract Tests
    ↓
Security Checks
    ↓
Build
    ↓
E2E / Critical Verification
    ↓
Release Candidate
```

Performance and heavier security testing may run on separate pipelines according to cost and frequency.

---

# 135. Pull Request Quality Gate

Every significant code change should answer:

```text
What changed?
Why?
Which requirement does it implement?
Which domain owns it?
What tests were added?
What tests were run?
What security implications exist?
Does tenant isolation change?
Does API contract change?
Does documentation change?
```

---

# 136. Database Change Gate

Any migration affecting important tables should include:

```text
migration test
upgrade test
rollback/recovery consideration
performance consideration
large-tenant consideration
```

---

# 137. API Change Gate

Any API change must verify:

```text
OpenAPI updated
frontend impact
backward compatibility
authorization
validation
error codes
idempotency
tests
```

---

# 138. Frontend Change Gate

Any major frontend feature must verify:

```text
responsive
RTL
dark mode
loading
empty
error
authorization
accessibility
API failure
```

where applicable.

---

# 139. Security Change Gate

Any security-sensitive change requires:

```text
negative tests
authorization tests
tenant isolation tests
audit verification
logging review
```

and potentially manual security review.

---

# 140. Release Candidate Verification

Before production:

```text
Build succeeds
Database migrations validated
Critical tests pass
Security checks pass
E2E passes
Smoke tests pass
Observability verified
Rollback plan known
Backup/recovery posture verified
```

---

# 141. Production Smoke Tests

After deployment, verify a minimal set of critical functions:

```text
authentication
tenant resolution
student dashboard
course access
payment visibility
authorization
critical API health
queue processing
```

Do not use real financial actions for smoke tests unless explicitly designed for safe production testing.

---

# 142. Rollback Verification

Each significant release should have a known rollback/recovery strategy.

The team should know:

```text
what can be rolled back
what cannot
how database changes are handled
how queued jobs are handled
how frontend versions interact with API versions
```

---

# 143. Deployment Compatibility

During rolling deployments, old and new application versions may coexist.

Therefore APIs and database changes must be compatible during the transition when the deployment model requires it.

This is particularly important for:

```text
API contracts
database migrations
queue payloads
frontend/backend version mismatch
```

---

# 144. Incident Verification

When a production incident occurs:

```text
detect
→ classify
→ contain
→ investigate
→ recover
→ verify
→ document
→ create regression test
```

The regression test should prevent recurrence when technically feasible.

---

# 145. Chaos / Failure Testing

Chaos testing should be introduced selectively.

Examples:

```text
kill worker
delay provider
drop network
simulate DB latency
fail notification provider
```

Do not perform uncontrolled chaos experiments in production without an approved operational process.

---

# 146. Reliability Objectives

The platform eventually needs explicit:

```text
SLO
SLI
RPO
RTO
```

These values are not finalized in Phase H.

They remain an Open Decision for the operational/reliability phase.

---

# 147. Quality Metrics

The project should eventually track:

```text
test pass rate
critical test coverage
escaped defects
regression rate
deployment failure rate
mean time to detect
mean time to recover
security findings
API error rate
performance regression
```

Metrics must be used to improve engineering quality, not to create meaningless targets.

---

# 148. Coverage Policy

Code coverage should be treated as an indicator, not the sole quality measure.

100% line coverage does not prove:

```text
authorization correctness
tenant isolation
business correctness
concurrency safety
security
```

Critical domain logic should have strong behavioral coverage regardless of raw coverage percentage.

---

# 149. Mutation Testing

Mutation testing may be introduced for especially critical logic such as:

```text
authorization
payment state transitions
credential security
entitlement calculation
```

This is an optional future quality technique, not an initial mandatory gate.

---

# 150. Property-Based Testing

Property-based testing may be appropriate for:

```text
permissions
state transitions
analytics calculations
pagination
validation
```

where defining invariant properties is more useful than manually enumerating every input.

This remains optional.

---

# 151. Contract Testing Between Modules

Internal application module boundaries should be tested where meaningful.

Examples:

```text
Billing → Entitlements
Credentials → Authentication
Education → Analytics
Meetings → Provider
Notifications → Delivery Provider
```

The purpose is to prevent module contracts from silently changing.

---

# 152. Testing External Providers Without Lock-In

Provider adapter tests should verify a common contract.

Conceptually:

```text
MeetingProviderContractTest
       ↓
GoogleMeetAdapter
       ↓
FutureProviderAdapter
```

Each adapter should satisfy the same essential contract.

---

# 153. Data Migration Verification

When transforming existing data:

```text
source
→ transformation
→ destination
```

verify:

```text
record count
relationships
critical values
tenant ownership
historical integrity
```

---

# 154. Analytics Data Verification

For analytics pipelines, verify:

```text
raw event count
aggregation
deduplication
tenant boundaries
student boundaries
metric version
time boundaries
```

---

# 155. Notification Delivery Verification

Do not assume:

```text
notification record created
```

means:

```text
message delivered
```

The system should distinguish:

```text
created
queued
sent
delivered where provider supports it
failed
```

Tests must respect the actual provider capabilities.

---

# 156. Test Security and Privacy

Test data should minimize sensitive personal data.

Use synthetic values wherever possible.

Test reports/screenshots/logs must not accidentally contain real secrets or unnecessary personal data.

---

# 157. Test Environment Access Control

Production-like test environments must have controlled access.

Sensitive integrations should use:

```text
sandbox credentials
test accounts
isolated tenants
```

where available.

---

# 158. Quality Anti-Patterns

The following are prohibited or strongly discouraged:

```text
test only happy paths
test only frontend
test only HTTP status codes
mock everything
one giant E2E test suite
tests dependent on execution order
hardcoded production IDs
shared mutable test state
ignore flaky tests indefinitely
claim tests passed without running them
```

---

# 159. Flaky Test Policy

A flaky test must not simply be ignored.

It should be:

```text
identified
tracked
diagnosed
fixed
or explicitly quarantined with ownership
```

Quarantine must not become permanent neglect.

---

# 160. Test Failure Policy

A failed critical test blocks release unless an explicitly approved exception exists.

The exception must document:

```text
test
reason
risk
owner
expiration
mitigation
```

---

# 161. Quality Exception Policy

Exceptions must never silently disappear.

Example:

```text
EXCEPTION-001
Performance test deferred
Reason: provider sandbox unavailable
Risk: external integration performance unverified
Owner: ...
Expires: ...
```

---

# 162. Definition of Production Ready

A feature is **Production Ready** only when:

```text
implementation complete
required tests pass
security verified
tenant isolation verified
API contract verified
frontend verified
documentation complete
observability available
known risks accepted
release gate passed
```

---

# 163. Phase H Acceptance Criteria

## H-AC-001

A layered testing strategy exists.

## H-AC-002

Critical business workflows have automated verification.

## H-AC-003

Cross-tenant isolation is explicitly tested.

## H-AC-004

RBAC + ABAC authorization is tested.

## H-AC-005

Critical state machines are tested.

## H-AC-006

Idempotency is tested for critical operations.

## H-AC-007

Concurrency is tested for high-risk workflows.

## H-AC-008

API contracts are verified against OpenAPI.

## H-AC-009

Frontend critical journeys have E2E coverage.

## H-AC-010

Security testing is part of release quality.

## H-AC-011

Performance testing uses realistic tenant profiles.

## H-AC-012

Failure and resilience behavior is tested.

## H-AC-013

Database migrations are tested.

## H-AC-014

Backup/restore verification is defined.

## H-AC-015

AI-generated code is subject to independent verification.

## H-AC-016

Requirements can be traced to implementation and tests.

## H-AC-017

Production releases have explicit quality gates.

---

# 164. Open Decisions

The following remain intentionally unresolved:

### H-OD-001
Exact backend testing framework/tooling configuration.

### H-OD-002
Exact frontend testing framework/tooling configuration.

### H-OD-003
Exact E2E browser automation framework.

### H-OD-004
Exact API contract-testing tooling.

### H-OD-005
Exact security testing tooling.

### H-OD-006
Exact performance/load-testing tooling.

### H-OD-007
Exact accessibility testing tooling.

### H-OD-008
Browser support matrix.

### H-OD-009
Performance budgets and SLO targets.

### H-OD-010
Coverage thresholds.

### H-OD-011
CI/CD platform and pipeline implementation.

### H-OD-012
RPO/RTO targets.

### H-OD-013
Exact staging/performance environment topology.

### H-OD-014
Mutation/property-based testing adoption.

---

# 165. Explicit Non-Goals

Phase H does not implement:

```text
test files
CI pipelines
load-test scripts
security scanners
E2E scripts
monitoring infrastructure
deployment infrastructure
```

It defines the required quality architecture that those implementations must follow.

---

# 166. Relationship to Previous Phases

```text
Phase A
Business/Product Foundation
        ↓
Phase B
Business Requirements
        ↓
Phase C
Architecture
        ↓
Phase D
Domain / ERD / Database
        ↓
Phase E
Security / Scalability / Resilience
        ↓
Phase F
API & Application Contract
        ↓
Phase G
Frontend Architecture & UX
        ↓
Phase H
Testing / Quality / Verification
```

Phase H verifies the contracts established by Phases A–G.

It must not weaken or silently redefine them.

---

# 167. Final Quality Architecture

The complete verification model is:

```text
                    ┌───────────────────────┐
                    │   Business Requirements│
                    └───────────┬───────────┘
                                ↓
                    ┌───────────────────────┐
                    │ Architecture / Domain │
                    └───────────┬───────────┘
                                ↓
                    ┌───────────────────────┐
                    │ API / Frontend Contract│
                    └───────────┬───────────┘
                                ↓
                       IMPLEMENTATION
                                ↓
        ┌───────────────────────┼───────────────────────┐
        ↓                       ↓                       ↓
   Unit / Domain          API / Integration         Frontend
        ↓                       ↓                       ↓
        └───────────────────────┼───────────────────────┘
                                ↓
                         E2E / Critical Flows
                                ↓
             ┌──────────────────┼──────────────────┐
             ↓                  ↓                  ↓
          Security          Performance        Resilience
             ↓                  ↓                  ↓
             └──────────────────┼──────────────────┘
                                ↓
                       RELEASE QUALITY GATE
                                ↓
                           PRODUCTION
                                ↓
                      Smoke / Monitoring
                                ↓
                         Feedback / Bugs
                                ↓
                        Regression Tests
                                ↓
                         Continuous Quality
```

---

# 168. Final AI Verification Rule

Before an AI agent says:

> "The feature is complete."

it must verify:

```text
1. What requirement does this implement?
2. Which domain owns it?
3. What are the business invariants?
4. What authorization rules apply?
5. What tenant boundaries apply?
6. What API contract applies?
7. What frontend behavior applies?
8. What failure cases exist?
9. What state transitions exist?
10. Is idempotency required?
11. Is concurrency relevant?
12. What security tests are required?
13. What cross-tenant tests are required?
14. What automated tests were added?
15. Which tests were actually executed?
16. Did they pass?
17. What remains unverified?
18. What documentation was updated?
19. Are there open decisions?
20. Is the feature merely IMPLEMENTED, or actually VERIFIED?
```

The AI must never convert:

```text
"I wrote the code"
```

into:

```text
"The feature is verified"
```

without evidence.

---

# 169. Phase Status

```text
Phase A — Approved
Phase B — Approved
Phase C — Approved
Phase D — Approved
Phase E — Approved
Phase F — Approved
Phase G — Approved
Phase H — Draft / Pending Approval
```

**Next planned phase after Phase H approval:**

# Phase I — DevOps, CI/CD, Infrastructure & Deployment Architecture

This phase will define:

```text
Repository strategy
Branching
CI/CD
Environments
Docker/containerization
Infrastructure
Tenant database provisioning
Secrets
Deployment
Migrations
Queues
Caching
Storage
CDN
Backups
Monitoring
Logging
Tracing
Alerting
Rollback
Disaster Recovery
Infrastructure as Code
Production topology
Scaling
```

It will connect the architecture we've already defined to an actual production-grade operating environment.