ممتاز. بناءً على اعتماد Phase E، دي **Phase F — API & Application Contract Specification**.  
الهدف هنا إن الـAI يبقى عنده عقد واضح جدًا للـbackend/frontend/integrations، قبل ما يبدأ يكتب controllers أو services أو pages.

:::writing{variant="document" id="58321" title="Phase F — API & Application Contract Specification"}
# PHASE F — API & APPLICATION CONTRACT SPECIFICATION

**Project:** Multi-Tenant SaaS LMS & Education Management Platform  
**Architecture Baseline:** Phases A–E Approved  
**Current Phase:** F  
**Status:** Draft — Pending Approval  
**Implementation Status:** Specification Only — No Implementation  
**Primary Backend:** Laravel  
**Primary Frontend:** Next.js + React + TypeScript  
**Database:** PostgreSQL  
**API Style:** Versioned REST API  
**Documentation Target:** OpenAPI 3.1  
**Language / UX:** Arabic RTL  
**Tenant Model:** Control Database + Tenant Database per Tenant

---

# 1. Purpose

Phase F defines the formal contract between:

- Frontend applications
- Backend application layer
- Authentication system
- Authorization system
- Tenant resolution
- Domain modules
- External integrations
- Background jobs
- Platform administration
- Tenant users
- Student and parent applications

This phase defines **what the system exposes and guarantees**, not how the code will be implemented.

The implementation must not begin until these contracts are sufficiently stable.

---

# 2. Architectural Intent

The API layer must remain a transport boundary.

The API layer MUST NOT become the location of business logic.

Expected request flow:

```text
HTTP Request
    ↓
Route
    ↓
Authentication
    ↓
Trusted Tenant Resolution
    ↓
Authorization / Policy Evaluation
    ↓
Request Validation
    ↓
DTO / Command / Query
    ↓
Application Use Case
    ↓
Domain Model / Domain Services
    ↓
Repository / Infrastructure
    ↓
External Provider / Database
    ↓
Application Result
    ↓
API Resource / Serializer
    ↓
HTTP Response
```

The controller or route handler must remain thin.

The implementation MUST NOT create:

```text
Controller → Database → Business Logic
```

as the normal architectural path.

The preferred model is:

```text
Controller
    → Application Use Case
        → Domain
            → Infrastructure
```

---

# 3. API Design Principles

The API must follow these principles:

### API-PR-001 — Explicit Contracts

Every public endpoint must have:

- Authentication requirement
- Authorization requirement
- Tenant scope
- Request schema
- Response schema
- Validation rules
- Error behavior
- Idempotency behavior where applicable
- Audit requirements where applicable

### API-PR-002 — Backend Is Authoritative

Frontend permissions, route guards, button visibility, and UI state are not security boundaries.

Every sensitive operation must be authorized by the backend.

### API-PR-003 — Tenant Context Is Trusted Server-Side

The backend must determine the tenant using trusted context.

The backend must never trust:

```text
tenant_id
teacher_id
student_id
parent_id
assistant_id
```

from the client as proof of ownership.

Submitted IDs are only resource references.

Authorization must establish whether the authenticated actor can access them.

### API-PR-004 — Domain Independence

API contracts must not expose internal persistence structure unnecessarily.

Database table design must not dictate API structure.

### API-PR-005 — Stable External Contracts

Internal implementation may evolve without breaking the API contract.

### API-PR-006 — Explicit Errors

The API must return machine-readable error codes.

Frontend code must not parse arbitrary human-readable strings to determine behavior.

### API-PR-007 — No Hidden Side Effects

An endpoint must clearly define all major side effects.

For example:

```text
POST /payments/{id}/approve
```

must clearly document whether it:

- changes payment state
- creates subscription
- creates entitlement
- activates credential
- sends notification

The implementation must not hide major business behavior from the application contract.

---

# 4. API Versioning

## 4.1 Versioning Strategy

The initial public API version is:

```text
/api/v1
```

Example:

```text
/api/v1/students
/api/v1/courses
/api/v1/payments
```

## 4.2 Versioning Rules

Breaking changes require a new major API version.

Non-breaking changes may include:

- Adding optional response fields
- Adding optional request fields
- Adding new endpoints
- Adding new enum values only when clients are designed to tolerate them

The API must not silently change:

- Meaning of existing fields
- Authentication semantics
- Authorization semantics
- Existing enum behavior
- Existing response types
- Existing state transitions

---

# 5. Identifier Contract

All API resource identifiers must be treated as opaque strings.

Clients must never rely on:

- sequential IDs
- numeric ordering
- database IDs
- tenant-specific ID generation assumptions

Preferred identifier format:

```text
PROPOSED:
UUIDv7 or ULID
```

This remains an architectural decision to finalize before implementation.

Until finalized, API contracts should represent IDs as:

```json
{
  "id": "opaque-resource-id"
}
```

---

# 6. Base API URL

Logical form:

```text
https://{tenant-domain}/api/v1
```

For platform administration:

```text
https://{platform-domain}/api/v1
```

Tenant and platform API contexts must not be mixed accidentally.

A tenant endpoint must execute inside a valid tenant context.

---

# 7. Authentication Contract

The system supports multiple authentication modes according to tenant configuration.

## 7.1 Authentication Modes

```text
PASSWORD_OR_CONTACT
CREDENTIAL_ONLY
COMBINED
```

The actual available login flow is determined from tenant configuration.

---

# 8. Authentication Resources

Core authentication endpoints:

```text
POST /auth/login
POST /auth/credential/verify
POST /auth/credential/activate
POST /auth/refresh
POST /auth/logout
POST /auth/logout-all
GET  /auth/session
POST /auth/revoke-session
```

Where required:

```text
POST /auth/request-verification
POST /auth/verify-contact
```

The exact contact verification mechanism remains configurable.

---

# 9. Credential Authentication

Access Credentials are separate from sessions.

Conceptual flow:

```text
Credential
    ↓
Credential Verification
    ↓
Authentication Decision
    ↓
Session Creation
    ↓
Authorization
```

A valid credential MUST NOT directly equal:

```text
permanent authentication
```

The credential is used to establish authenticated access.

---

# 10. Credential Activation Contract

Example:

```http
POST /api/v1/auth/credential/activate
```

Request:

```json
{
  "credential": "submitted-secret",
  "device": {
    "device_label": "Student iPhone",
    "device_type": "mobile"
  }
}
```

The server validates:

- credential validity
- credential state
- expiration
- suspension/revocation
- tenant context
- activation eligibility
- device-binding policy
- abuse/rate limits

Success may result in an authenticated session.

The plaintext credential must never be returned in a response.

---

# 11. Session Contract

Sessions must be:

- revocable
- expirable
- tenant-aware
- authenticated
- protected against fixation
- independently auditable

Session response should expose safe metadata only:

```json
{
  "id": "session-id",
  "user": {},
  "tenant": {},
  "device": {},
  "created_at": "timestamp",
  "expires_at": "timestamp"
}
```

Sensitive authentication secrets must not be exposed.

---

# 12. Current User Endpoint

Standard endpoint:

```http
GET /api/v1/me
```

The response should provide the authenticated actor's effective application context.

Example:

```json
{
  "data": {
    "id": "user-id",
    "type": "student",
    "tenant_id": "tenant-id",
    "profile": {},
    "authentication": {},
    "roles": [],
    "capabilities": []
  }
}
```

This endpoint is for client initialization.

It is not a replacement for authorization checks on protected mutations.

---

# 13. Permission Discovery

Optional endpoint:

```http
GET /api/v1/me/permissions
```

This returns the actor's currently effective permissions/capabilities for UI purposes.

Example:

```json
{
  "data": {
    "permissions": [
      "students.view",
      "students.create",
      "payments.view",
      "payments.approve"
    ]
  }
}
```

This response must never be treated as the sole security mechanism.

---

# 14. Authorization Contract

Every protected application operation conceptually receives:

```text
Actor
Action
Resource
Tenant
Role
Attributes
Scope
Context
Policy
```

Authorization decision:

```text
ALLOW
DENY
```

Optional internal evaluation result:

```text
ALLOW
EXPLICIT_DENY
INHERITED_ALLOW
DEFAULT_DENY
```

The final precedence follows the Phase E authorization policy once formally locked.

---

# 15. Application Use Case Contract

Each meaningful business action should map to an explicit use case.

Examples:

```text
CreateStudent
UpdateStudent
EnrollStudent
ApprovePayment
RejectPayment
ActivateSubscription
AssignCredential
ActivateCredential
BindDevice
ReplaceDevice
RecordAttendance
SubmitAssignment
StartExamAttempt
SubmitExamAttempt
PublishGrade
CreateMeeting
GenerateReport
CreateSupportSession
```

The use case should define:

- input DTO
- actor
- authorization policy
- business invariants
- transactional boundary
- side effects
- emitted domain events
- output DTO

---

# 16. Command vs Query Contract

The application layer should distinguish between:

### Commands

Operations that change state.

Examples:

```text
CreateCourse
ApprovePayment
ActivateCredential
RecordAttendance
SubmitExam
```

### Queries

Operations that read state.

Examples:

```text
GetStudentDashboard
ListCourses
GetAttendanceReport
GetPaymentDetails
GetStudentProgress
GetTenantUsage
```

Queries must not unexpectedly mutate business state.

Commands should clearly document their state changes.

---

# 17. DTO Contract

DTOs are boundary contracts.

Example:

```text
CreateStudentRequest
UpdateStudentRequest
StudentResponse
StudentListItem
StudentDashboardResponse
ApprovePaymentRequest
PaymentResponse
```

DTOs must not expose persistence models directly.

Avoid returning raw database records.

---

# 18. Request DTO Rules

Every request DTO must explicitly define:

- field name
- data type
- required/optional
- nullable/non-nullable
- validation
- allowed values
- security implications
- authorization scope where relevant

Example:

```json
{
  "name": "Ahmed Ali",
  "phone": "+966XXXXXXXXX",
  "email": "student@example.com"
}
```

The contract must distinguish:

```text
missing
null
empty string
invalid value
valid value
```

These states must not be treated as automatically identical.

---

# 19. Validation Rules

Validation occurs before business execution.

Validation categories:

```text
Syntax Validation
Type Validation
Format Validation
Business Validation
Authorization Validation
State Validation
```

Example:

```text
Payment amount > 0
Payment method ∈ configured methods
Subscription belongs to current tenant
Credential can only activate from allowed states
Attendance requires an active session
```

Business validation must remain distinct from simple request-format validation.

---

# 20. Standard Response Envelope

Recommended successful response:

```json
{
  "data": {},
  "meta": {
    "request_id": "request-id"
  }
}
```

Collection:

```json
{
  "data": [],
  "meta": {
    "request_id": "request-id",
    "pagination": {}
  }
}
```

The exact metadata fields must remain consistent across the API.

---

# 21. Error Contract

Recommended error format:

```json
{
  "error": {
    "code": "PAYMENT_NOT_APPROVABLE",
    "message": "The payment cannot be approved in its current state.",
    "details": {}
  },
  "meta": {
    "request_id": "request-id"
  }
}
```

The `code` is machine-readable.

The `message` is human-readable.

Frontend behavior must be based primarily on `code`, not `message`.

---

# 22. Standard HTTP Semantics

The API should use conventional HTTP status codes.

Examples:

```text
200 OK
201 Created
202 Accepted
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

Recommended interpretation:

### 401

Authentication is absent or invalid.

### 403

Authentication exists but authorization is denied.

### 404

Resource does not exist or is intentionally not disclosed according to security policy.

### 409

Resource/state conflict.

### 422

Request is structurally valid but violates validation/business constraints.

---

# 23. Error Code Naming

Error codes should be stable and domain-specific.

Examples:

```text
AUTH_INVALID_CREDENTIAL
AUTH_SESSION_EXPIRED
AUTH_CREDENTIAL_REVOKED

TENANT_NOT_RESOLVED
TENANT_ACCESS_DENIED

AUTHZ_PERMISSION_DENIED
AUTHZ_SCOPE_DENIED

STUDENT_NOT_FOUND
STUDENT_ALREADY_ENROLLED

PAYMENT_INVALID_STATE
PAYMENT_ALREADY_REVIEWED
PAYMENT_PROOF_REQUIRED

SUBSCRIPTION_INVALID_STATE
ENTITLEMENT_NOT_ACTIVE

CREDENTIAL_INVALID
CREDENTIAL_EXPIRED
CREDENTIAL_ALREADY_BOUND
DEVICE_REPLACEMENT_NOT_ALLOWED

ATTENDANCE_ALREADY_RECORDED
ATTENDANCE_SESSION_CLOSED

EXAM_ATTEMPT_NOT_ACTIVE
EXAM_ALREADY_SUBMITTED

INTEGRATION_UNAVAILABLE
MEETING_PROVIDER_ERROR
VIDEO_PROVIDER_ERROR
```

---

# 24. Resource Naming

Use plural nouns for collections:

```text
/students
/teachers
/assistants
/parents
/courses
/lessons
/assignments
/exams
/payments
/subscriptions
/entitlements
/credentials
/devices
/meetings
/reports
/notifications
```

Actions that represent meaningful domain transitions may use explicit action endpoints.

Example:

```text
POST /payments/{payment_id}/approve
POST /payments/{payment_id}/reject
POST /credentials/{credential_id}/activate
POST /credentials/{credential_id}/revoke
POST /devices/{device_id}/replace
POST /exam-attempts/{attempt_id}/submit
```

This is preferable to pretending every business transition is a simple generic update.

---

# 25. Core Tenant Resources

The initial tenant API resource catalog should include:

```text
Tenant Context
Staff
Teachers
Assistants
Students
Parents
Parent-Student Relationships

Courses
Lessons
Course Enrollments

Branches
Classrooms
Classes
Sessions
Attendance

Assignments
Submissions

Exams
Questions
Exam Attempts
Answers
Grades

Packages
Payments
Payment Proofs
Subscriptions
Entitlements

Credentials
Device Bindings

Meetings
Media / Videos

Analytics Metrics
Analytics Measurements
Progress

Reports
Notifications
Audit Events
```

---

# 26. Platform Resources

The platform API should separately expose:

```text
Tenants
Tenant Registry
Tenant Configuration
Tenant Usage
Platform Users
Platform Roles
Platform Permissions
Global Student Identities
Student Identity Mappings
Support Sessions
Platform Audit
Platform Metrics
Platform Configuration
```

These resources must remain separated from ordinary tenant API access.

---

# 27. Student Identity Contract

Global identity and tenant identity are different concepts.

Conceptual model:

```text
GlobalStudentIdentity
        |
        +------ Tenant Student Account A
        |
        +------ Tenant Student Account B
        |
        +------ Tenant Student Account C
```

The API must never infer:

```text
same global identity
        =
automatic access to another tenant
```

Cross-tenant access requires a valid authorization context.

---

# 28. Student APIs

Example student endpoints:

```text
GET    /students
POST   /students
GET    /students/{student_id}
PATCH  /students/{student_id}
DELETE /students/{student_id}

GET    /students/{student_id}/parents
POST   /students/{student_id}/parents

GET    /students/{student_id}/courses
GET    /students/{student_id}/progress
GET    /students/{student_id}/attendance
GET    /students/{student_id}/submissions
GET    /students/{student_id}/exams
GET    /students/{student_id}/payments
GET    /students/{student_id}/subscriptions
GET    /students/{student_id}/credentials
GET    /students/{student_id}/dashboard
```

---

# 29. Student Dashboard Contract

Because the student dashboard is a primary product surface, it should receive a purpose-built read model.

Example:

```http
GET /api/v1/student/dashboard
```

Response may contain:

```json
{
  "data": {
    "student": {},
    "active_courses": [],
    "upcoming_lessons": [],
    "pending_assignments": [],
    "upcoming_exams": [],
    "attendance_summary": {},
    "learning_progress": {},
    "recent_results": [],
    "active_meetings": [],
    "notifications": []
  }
}
```

The dashboard endpoint must be optimized as a read model.

It must not trigger expensive raw analytics calculations on every request.

---

# 30. Teacher APIs

Core endpoints:

```text
GET  /teachers/me
GET  /teachers/{teacher_id}

GET  /teachers/{teacher_id}/students
GET  /teachers/{teacher_id}/courses
GET  /teachers/{teacher_id}/packages
GET  /teachers/{teacher_id}/reports
GET  /teachers/{teacher_id}/analytics
```

Teacher API access remains tenant-scoped.

A teacher cannot access another tenant's teacher resource simply by changing an ID.

---

# 31. Assistant APIs

Assistant functionality is permission-driven.

Examples:

```text
GET  /students
GET  /attendance/sessions
POST /attendance/scans
GET  /payments
POST /payments/{payment_id}/approve
POST /payments/{payment_id}/reject
```

The endpoint alone does not grant access.

Each operation passes through RBAC + ABAC/policy evaluation.

---

# 32. Parent APIs

Parent access remains tenant-scoped.

Examples:

```text
GET /parent/dashboard
GET /parent/children
GET /parent/children/{student_id}
GET /parent/children/{student_id}/attendance
GET /parent/children/{student_id}/progress
GET /parent/children/{student_id}/grades
GET /parent/children/{student_id}/reports
```

A parent can only access students for whom the tenant has established an authorized parent-student relationship.

---

# 33. Course APIs

```text
GET    /courses
POST   /courses
GET    /courses/{course_id}
PATCH  /courses/{course_id}
DELETE /courses/{course_id}

GET    /courses/{course_id}/lessons
POST   /courses/{course_id}/lessons
GET    /lessons/{lesson_id}
PATCH  /lessons/{lesson_id}
DELETE /lessons/{lesson_id}
```

Course authorization must respect tenant ownership/scope.

---

# 34. Enrollment APIs

Enrollment is a domain operation rather than only a database row update.

Example:

```text
POST /courses/{course_id}/enrollments
POST /enrollments/{enrollment_id}/cancel
GET  /enrollments/{enrollment_id}
```

The application layer must enforce:

- student existence
- tenant scope
- course availability
- subscription/entitlement rules
- enrollment state
- duplicate enrollment rules

---

# 35. Package APIs

Packages may represent:

```text
ONLINE
OFFLINE
ONLINE_AND_OFFLINE
```

Endpoints:

```text
GET    /packages
POST   /packages
GET    /packages/{package_id}
PATCH  /packages/{package_id}
DELETE /packages/{package_id}
```

Package definitions must remain tenant-owned.

---

# 36. Payment APIs

Core:

```text
GET  /payments
POST /payments
GET  /payments/{payment_id}
POST /payments/{payment_id}/approve
POST /payments/{payment_id}/reject
POST /payments/{payment_id}/request-review
```

Payment creation request:

```json
{
  "student_id": "student-id",
  "package_id": "package-id",
  "payment_method": "INSTAPAY",
  "sender_phone": "+966XXXXXXXXX",
  "reference": "optional-reference",
  "proof_file": "secure-file-reference"
}
```

---

# 37. Payment State Contract

The API must expose payment state explicitly.

Conceptual states:

```text
DRAFT
SUBMITTED
UNDER_REVIEW
APPROVED
REJECTED
CANCELLED
```

The final state machine will be formalized in Billing documentation.

Illegal transitions must return a deterministic conflict/business error.

Example:

```text
APPROVED → APPROVED
```

must not create another subscription or duplicate entitlement.

---

# 38. Payment Approval Contract

Example:

```http
POST /api/v1/payments/{payment_id}/approve
```

Request:

```json
{
  "note": "Verified manually"
}
```

The application use case may produce:

```text
Payment Approved
        ↓
Subscription Created / Activated
        ↓
Entitlement Granted
        ↓
Credential Action if configured
        ↓
Notification Event
        ↓
Audit Event
```

These are application-level business effects.

The API contract must define which effects happen synchronously and which happen asynchronously.

---

# 39. Subscription APIs

```text
GET /subscriptions
GET /subscriptions/{subscription_id}
POST /subscriptions/{subscription_id}/activate
POST /subscriptions/{subscription_id}/suspend
POST /subscriptions/{subscription_id}/cancel
```

Subscription is not authentication.

Subscription is not entitlement.

Subscription state must not be used as a substitute for access-control logic.

---

# 40. Entitlement APIs

Entitlements represent granted capabilities.

Example:

```text
GET /entitlements
GET /entitlements/{entitlement_id}
```

Possible capability values:

```text
ONLINE_ACCESS
OFFLINE_ACCESS
COURSE_ACCESS
EXAM_ACCESS
ASSIGNMENT_ACCESS
LIVE_MEETING_ACCESS
```

The final capability catalog is controlled by the product domain specification.

---

# 41. Credential APIs

```text
GET  /credentials
POST /credentials
GET  /credentials/{credential_id}
POST /credentials/{credential_id}/issue
POST /credentials/{credential_id}/activate
POST /credentials/{credential_id}/suspend
POST /credentials/{credential_id}/revoke
POST /credentials/{credential_id}/replace
GET  /credentials/{credential_id}/devices
POST /credentials/{credential_id}/device-bindings
```

Credential secrets must never be returned through ordinary resource endpoints after issuance.

---

# 42. Credential State Contract

Conceptual lifecycle:

```text
GENERATED
    ↓
ASSIGNED
    ↓
ISSUED
    ↓
PENDING_ACTIVATION
    ↓
ACTIVATED
    ↓
DEVICE_BOUND
    ↓
ACTIVE
    ↓
SUSPENDED / REVOKED / EXPIRED
```

Only valid state transitions may be performed.

The final state machine is governed by the Credentials domain specification.

---

# 43. Device APIs

```text
GET  /devices
GET  /devices/{device_id}
POST /devices/{device_id}/replace
POST /devices/{device_id}/revoke
```

Device fingerprinting alone is not considered a perfect identity boundary.

Device records are treated as a security object.

---

# 44. Attendance APIs

Core endpoints:

```text
GET  /attendance
GET  /attendance/sessions
POST /attendance/scans
GET  /attendance/{attendance_id}
PATCH /attendance/{attendance_id}
```

QR scan request:

```json
{
  "qr_token": "opaque-token",
  "session_id": "session-id"
}
```

The backend validates:

- scanner identity
- assistant/teacher authorization
- tenant
- session
- QR validity
- student context
- duplicate attendance
- time constraints

---

# 45. Attendance Idempotency

The same student should not accidentally receive multiple attendance records for the same session.

Logical uniqueness:

```text
(session_id, student_id)
```

Repeated scan behavior should be deterministic.

Recommended result:

```text
first scan → attendance created
duplicate scan → existing state returned or conflict according to contract
```

The final API behavior must be standardized before implementation.

---

# 46. Assignment APIs

```text
GET  /assignments
POST /assignments
GET  /assignments/{assignment_id}
PATCH /assignments/{assignment_id}

GET  /assignments/{assignment_id}/submissions
POST /assignments/{assignment_id}/submissions

GET  /submissions/{submission_id}
PATCH /submissions/{submission_id}
```

Submission APIs must enforce:

- student identity
- enrollment
- assignment availability
- submission deadline
- resubmission policy
- attachment policy

---

# 47. Exam APIs

```text
GET  /exams
POST /exams
GET  /exams/{exam_id}

POST /exams/{exam_id}/attempts
GET  /exam-attempts/{attempt_id}
POST /exam-attempts/{attempt_id}/answers
POST /exam-attempts/{attempt_id}/submit
```

The exam attempt must be treated as a stateful domain object.

---

# 48. Exam Attempt State

Conceptual:

```text
CREATED
↓
STARTED
↓
IN_PROGRESS
↓
SUBMITTED
↓
GRADED
↓
PUBLISHED
```

Illegal state transitions must be rejected.

Exam submission must be idempotent.

Repeated submission must not create multiple final attempts.

---

# 49. Grade APIs

Examples:

```text
GET /grades
GET /students/{student_id}/grades
POST /grades
PATCH /grades/{grade_id}
POST /grades/{grade_id}/publish
```

Grades must preserve history as required by the Assessment domain.

A published grade should not be silently overwritten.

Any correction workflow must be explicitly documented and auditable.

---

# 50. Analytics APIs

Analytics should expose derived information rather than require the frontend to process raw events.

Examples:

```text
GET /analytics/overview
GET /students/{student_id}/analytics
GET /students/{student_id}/progress
GET /courses/{course_id}/analytics
GET /classes/{class_id}/analytics
GET /analytics/metrics
GET /analytics/metrics/{metric_id}
```

Custom metrics require versioned definitions.

---

# 51. Raw Learning Event APIs

Playback events may be submitted separately from progress state.

Example:

```text
POST /learning-events/video-playback
```

Event payload:

```json
{
  "video_id": "video-id",
  "session_id": "playback-session-id",
  "event_type": "PROGRESS",
  "position_seconds": 420,
  "duration_seconds": 1800,
  "occurred_at": "timestamp"
}
```

Raw events should not be treated as the same entity as:

```text
Student Learning Progress
```

---

# 52. Video Contract

Media is provider-neutral.

Conceptual resource:

```json
{
  "id": "video-id",
  "provider": "VIMEO",
  "external_reference": "provider-reference",
  "duration": 1800,
  "access_policy": {},
  "watermark_policy": {}
}
```

The API must not expose provider-specific credentials.

Video provider integration is handled behind provider adapters.

---

# 53. Meeting APIs

```text
GET  /meetings
POST /meetings
GET  /meetings/{meeting_id}
PATCH /meetings/{meeting_id}
POST /meetings/{meeting_id}/cancel
POST /meetings/{meeting_id}/refresh-link
```

The backend uses the provider abstraction.

The domain must not directly depend on Google Meet SDK behavior.

---

# 54. Notification APIs

Notifications and delivery channels are separate concepts.

Example:

```text
GET /notifications
POST /notifications/{notification_id}/read
POST /notifications/read-all
```

Potential delivery strategies:

```text
IN_APP
EMAIL
WHATSAPP
SMS
```

WhatsApp remains a future integration according to the project baseline.

---

# 55. Reporting APIs

Reports should be treated as application resources.

Examples:

```text
GET  /reports
POST /reports
GET  /reports/{report_id}
POST /reports/{report_id}/generate
GET  /reports/{report_id}/status
POST /reports/{report_id}/deliver
```

Heavy report generation should normally be asynchronous.

Recommended model:

```text
POST /reports/{id}/generate
        ↓
202 Accepted
        ↓
Background Job
        ↓
Report Ready
```

---

# 56. Platform Admin API

Platform endpoints must have separate authorization policies.

Examples:

```text
GET /platform/tenants
GET /platform/tenants/{tenant_id}
POST /platform/tenants
PATCH /platform/tenants/{tenant_id}

GET /platform/usage
GET /platform/metrics
GET /platform/students/identity-map

GET /platform/support/sessions
POST /platform/support/sessions
POST /platform/support/sessions/{session_id}/end
```

Platform users must not receive tenant privileges merely because they can authenticate to the platform.

---

# 57. Support Session Contract

Support access must be explicit.

Creation requires:

```text
support actor
target tenant
reason/context
authorization
expiration
audit context
```

Example:

```http
POST /platform/support/sessions
```

Request:

```json
{
  "tenant_id": "tenant-id",
  "reason": "Investigating student payment issue",
  "duration_minutes": 30
}
```

The resulting support session must be:

- temporary
- auditable
- tenant-scoped
- revocable
- time-bound

---

# 58. Tenant Configuration APIs

Examples:

```text
GET   /settings
PATCH /settings

GET   /settings/branding
PATCH /settings/branding

GET   /settings/authentication
PATCH /settings/authentication

GET   /settings/features
PATCH /settings/features
```

Sensitive configuration must require stronger authorization and potentially reauthentication/MFA according to policy.

---

# 59. File Upload Contract

Files must use secure upload workflows.

Example:

```text
POST /files/upload-intent
POST /files/complete
GET  /files/{file_id}
```

The API must not accept arbitrary executable uploads without policy.

Files such as payment proofs require:

- private access
- tenant scope
- authorization
- controlled content type
- size limits
- scanning where appropriate

---

# 60. Pagination Contract

Collections must support pagination.

Recommended default:

```text
cursor-based pagination
```

for potentially large collections.

Example:

```http
GET /students?limit=25&cursor=abc123
```

Response:

```json
{
  "data": [],
  "meta": {
    "pagination": {
      "next_cursor": "xyz456",
      "has_more": true
    }
  }
}
```

Page-number pagination may be used where there is a clear reporting/UI requirement.

Do not return unbounded collections.

---

# 61. Filtering Contract

Filtering must be explicitly defined per endpoint.

Example:

```text
GET /payments?status=UNDER_REVIEW
GET /attendance?session_id=...
GET /students?status=active
```

The API must not dynamically expose arbitrary database columns as filters.

Allowed filter fields must be defined by resource contract.

---

# 62. Sorting Contract

Sorting must use an explicit allow-list.

Example:

```text
?sort=created_at
?sort=-created_at
```

The server must reject unsupported sort fields.

---

# 63. Search Contract

Search behavior must be explicit.

Example:

```text
GET /students?search=Ahmed
```

The API must define:

- searchable fields
- normalization behavior
- tenant scope
- authorization scope
- result limits

Search must never bypass authorization.

---

# 64. Field Selection

Arbitrary field selection should not be enabled by default.

Avoid contracts such as:

```text
?fields=*
```

for sensitive resources.

The API should expose intentionally designed response DTOs.

---

# 65. Idempotency Contract

Critical state-changing operations must support idempotency.

Header:

```http
Idempotency-Key: unique-client-generated-key
```

Recommended mandatory operations:

```text
Payment submission
Payment approval
Payment rejection
Credential activation
Credential device binding
Device replacement
Attendance scan
Exam submission
Meeting creation
Notification dispatch
Report generation where duplicate generation has business impact
```

The exact mandatory list is finalized per domain.

---

# 66. Idempotency Rules

A repeated request with the same valid idempotency key and same logical operation should not create duplicate side effects.

Example:

```text
POST /payments/{id}/approve
Idempotency-Key: abc
```

First request:

```text
payment approved
subscription activated
```

Repeated request:

```text
same logical result
```

not:

```text
second subscription
second entitlement
second notification
```

Idempotency storage itself must be tenant-safe.

---

# 67. Concurrency Control

Where simultaneous updates are possible, optimistic concurrency should be considered.

Potential mechanism:

```text
ETag
If-Match
version field
```

Especially for:

- payment review
- subscription transitions
- credential/device changes
- exam submission
- attendance correction
- configuration changes

The final mechanism is an Open Decision for detailed implementation architecture.

---

# 68. Transactions

A single critical business operation must have a clearly defined transaction boundary.

Examples:

### Payment approval

```text
Validate
→ authorize
→ lock/reconcile state
→ update payment
→ create/activate subscription
→ grant entitlement
→ persist events/outbox
→ commit
```

### Credential activation

```text
Validate credential
→ validate tenant
→ validate student
→ evaluate device policy
→ update credential state
→ create device binding
→ persist security/audit event
→ commit
```

The API layer must not control low-level transaction fragments.

The application/domain layer owns the business transaction.

---

# 69. Domain Events

Meaningful state changes should produce domain events.

Examples:

```text
StudentCreated
StudentEnrolled
PaymentSubmitted
PaymentApproved
PaymentRejected

SubscriptionActivated
EntitlementGranted

CredentialIssued
CredentialActivated
CredentialRevoked
DeviceBound
DeviceReplaced

AttendanceRecorded
AssignmentSubmitted

ExamAttemptStarted
ExamSubmitted
GradePublished

MeetingCreated
ReportGenerated
SupportSessionStarted
SupportSessionEnded
```

Events should represent business facts, not HTTP events.

---

# 70. Outbox Reliability

For events that trigger external/async processing, use an outbox-style reliability mechanism.

Concept:

```text
Business Transaction
        +
Outbox Event
        ↓
Atomic Commit
        ↓
Event Dispatcher
        ↓
Queue / Integration
```

This prevents the situation where database state commits but the corresponding critical event is silently lost.

---

# 71. Async API Contract

Long-running work should return:

```text
202 Accepted
```

when appropriate.

Example:

```http
POST /reports/{id}/generate
```

Response:

```json
{
  "data": {
    "job_id": "job-id",
    "status": "QUEUED"
  },
  "meta": {
    "request_id": "request-id"
  }
}
```

Client can then query job/report status.

---

# 72. Job Status Contract

Example:

```text
QUEUED
RUNNING
SUCCEEDED
FAILED
CANCELLED
```

Errors must be recorded in a safe way without leaking internal infrastructure secrets.

---

# 73. External Integration Contract

All external integrations must sit behind provider abstractions.

Example:

```text
MeetingProvider
├── GoogleMeetAdapter
└── FutureMeetingProvider

VideoProvider
├── GoogleDriveAdapter
├── VimeoAdapter
└── FutureVideoProvider

NotificationChannel
├── EmailAdapter
├── WhatsAppAdapter
└── FutureChannel

PaymentMethod
├── InstaPay
├── Cash
└── FuturePaymentMethod
```

The core application must depend on interfaces/contracts rather than vendor SDKs.

---

# 74. Provider Failure Contract

External integration failures must not corrupt core business state.

Examples:

If Google Meet is unavailable:

```text
Course/session data remains valid
```

If video provider fails:

```text
Course/lesson enrollment remains valid
```

If WhatsApp delivery fails:

```text
notification record remains auditable
```

External failures should return explicit integration errors where the user-facing operation genuinely depends on the provider.

---

# 75. Retry Contract

External calls may use:

```text
timeout
retry with backoff
idempotency
circuit breaker where justified
dead-letter handling
```

Retries must not duplicate business effects.

---

# 76. Webhook Contract

Inbound webhook structure:

```text
POST /api/v1/webhooks/{provider}
```

Webhook processing must validate:

- provider identity
- signature
- timestamp
- replay protection
- event ID
- tenant/provider mapping
- payload schema
- idempotency

Unknown events should be handled safely rather than causing data corruption.

---

# 77. Webhook Processing Model

Recommended:

```text
Webhook Request
    ↓
Authenticate Signature
    ↓
Validate Envelope
    ↓
Check Replay
    ↓
Check Event Idempotency
    ↓
Persist Event
    ↓
Acknowledge
    ↓
Process Asynchronously
```

Do not perform heavy provider logic blindly inside the webhook HTTP request.

---

# 78. Audit Contract

Security-sensitive or business-critical operations must create audit records.

Examples:

```text
Login failures
Credential activation
Credential revocation
Device replacement
Payment approval/rejection
Subscription activation
Permission changes
Role changes
Support session entry
Support session exit
Attendance correction
Grade correction
Sensitive configuration changes
```

Audit records should contain safe metadata such as:

```text
actor
action
resource
tenant
timestamp
request_id
result
reason/context where applicable
```

Secrets must never be logged.

---

# 79. Request Correlation

Every request should have a correlation/request ID.

Example header:

```http
X-Request-ID
```

If absent, the server may generate one.

The request ID should propagate to:

```text
application logs
queue jobs
integration calls
audit records
```

where appropriate.

---

# 80. Rate Limiting Contract

Rate limits should exist at multiple levels as appropriate:

```text
IP
User
Credential
Tenant
Endpoint
Integration
```

Especially important for:

```text
login
credential verification
OTP/contact verification
QR validation
video event ingestion
exam submission
webhooks
file uploads
support access
```

Rate-limit responses should use:

```text
429 Too Many Requests
```

with a documented retry behavior.

---

# 81. Security-Sensitive Endpoint Rules

High-risk operations may require:

```text
fresh authentication
reauthentication
MFA
elevated permission
explicit reason
audit event
idempotency
```

Examples:

```text
Change authentication configuration
Change high-privilege permissions
Support session creation
Device replacement
Credential revocation
Sensitive tenant configuration changes
```

Exact MFA/reauthentication requirements are governed by the Security Policy.

---

# 82. Authorization Matrix

The authorization matrix must be maintained independently from route definitions.

Example structure:

| Resource | Action | Teacher | Assistant | Student | Parent | Platform Support |
|---|---|---|---|---|---|---|
| Student | View | Policy-based | Policy-based | Self | Child only | Support session |
| Student | Create | Allowed by tenant policy | Conditional | Denied | Denied | According to support scope |
| Payment | View | Tenant policy | Conditional | Own | Child-related where allowed | Support session |
| Payment | Approve | Conditional | Conditional | Denied | Denied | Support session if explicitly authorized |
| Attendance | Record | Allowed | Conditional | Denied | Denied | Support session |
| Grade | View | Tenant policy | Conditional | Own | Child only | Support session |
| Credential | Revoke | Conditional | Conditional | Denied | Denied | Explicit support authority |

This table is conceptual.

The actual permission registry is the authoritative source.

---

# 83. Permission Naming

Permissions should be granular and predictable.

Recommended structure:

```text
resource.action
```

Examples:

```text
students.view
students.create
students.update
students.delete

payments.view
payments.create
payments.approve
payments.reject

credentials.view
credentials.issue
credentials.activate
credentials.suspend
credentials.revoke

attendance.view
attendance.record
attendance.correct

reports.view
reports.generate
reports.deliver
```

Additional scope/policy attributes determine what resources are actually accessible.

---

# 84. Scope Contract

Permission is not enough.

Example:

```text
students.view
```

may still mean:

```text
only students assigned to this assistant
```

Possible scopes:

```text
TENANT
BRANCH
CLASSROOM
CLASS
COURSE
TEACHER
ASSIGNED_STUDENTS
SELF
CHILDREN
RESOURCE
```

The scope model remains centralized in authorization policies.

---

# 85. API Security Invariants

The following invariants from Phase E remain mandatory:

```text
SEC-INV-001
No unauthorized cross-tenant access.

SEC-INV-002
Frontend authorization never replaces backend authorization.

SEC-INV-003
Credential is not a permanent session.

SEC-INV-004
Payment is not an entitlement.

SEC-INV-005
Subscription is not authentication.

SEC-INV-006
Global identity does not imply cross-tenant authorization.

SEC-INV-007
Support access is temporary and auditable.

SEC-INV-008
Secrets never appear in logs.

SEC-INV-009
Security failures default to deny.

SEC-INV-010
Tenant context must exist before tenant data access.
```

---

# 86. API Data Leakage Rules

Responses must not expose:

- password hashes
- credential hashes
- session secrets
- provider tokens
- API keys
- internal database credentials
- private infrastructure locations
- unauthorized parent/student relationships
- hidden payment proof metadata
- internal authorization implementation details

Sensitive resources should expose only intentionally designed fields.

---

# 87. Serialization Rules

API serializers/resources should be explicit.

Do not automatically serialize entire models.

Example:

Bad:

```text
return $student;
```

Preferred conceptual behavior:

```text
StudentResponse
    id
    name
    contact
    status
    enrollment_summary
```

This reduces accidental data leakage and coupling.

---

# 88. Resource Ownership Rules

Every tenant resource must be traceable to a tenant context.

Example:

```text
Student → Tenant
Course → Tenant
Payment → Tenant
Subscription → Tenant
Credential → Tenant
Meeting → Tenant
Report → Tenant
```

Any endpoint operating on a tenant resource must validate the tenant relationship through trusted backend context.

---

# 89. Nested Resources

Nested routes may be used when they communicate ownership clearly.

Examples:

```text
GET /courses/{course_id}/lessons
GET /students/{student_id}/attendance
GET /students/{student_id}/subscriptions
```

Avoid deeply nested paths such as:

```text
/tenants/{tenant}/teachers/{teacher}/students/{student}/courses/{course}/lessons/{lesson}
```

Tenant context is already established by the authenticated request.

---

# 90. API Filtering and Authorization Interaction

Filtering must never be executed as:

```text
database query only
```

without authorization scope.

The effective query must conceptually be:

```text
Tenant Scope
+
Authorization Scope
+
User Filters
```

not:

```text
User Filters
```

alone.

---

# 91. Bulk Operations

Bulk actions require explicit design.

Examples:

```text
POST /students/bulk-import
POST /attendance/bulk-correct
POST /notifications/bulk-send
```

Bulk operations must:

- validate authorization
- impose limits
- be auditable
- support idempotency where needed
- return partial-failure semantics explicitly if applicable

---

# 92. Import Operations

Large student/course imports should not block normal HTTP requests.

Recommended:

```text
POST /imports/students
    ↓
202 Accepted
    ↓
background job
    ↓
import status
```

Import errors should be reportable at row/item level.

---

# 93. Dashboard Read Models

Dashboards are high-frequency reads.

They should use purpose-built read models where appropriate.

Examples:

```text
StudentDashboardReadModel
TeacherDashboardReadModel
ParentDashboardReadModel
PlatformOverviewReadModel
TenantAnalyticsReadModel
```

This prevents frontend requests from triggering a large number of expensive joins and raw analytics computations.

---

# 94. API Performance Rules

Normal CRUD API requests should remain synchronous unless there is a clear reason not to.

Operations likely to be asynchronous:

```text
large report generation
large import
large export
bulk notifications
heavy analytics recomputation
large media processing
```

Large analytics datasets must never block critical transactional operations.

---

# 95. Cache Contract

Cache is an optimization and never the source of truth for critical business state.

Cache keys must include tenant context where tenant-scoped.

Conceptually:

```text
tenant:{tenant_id}:students:{query-hash}
```

No cache key may allow one tenant's data to collide with another tenant's data.

Critical authorization decisions must not depend on stale unsafe cache state.

---

# 96. API Authentication vs Authorization

The API must distinguish:

```text
Authentication:
Who are you?

Authorization:
What may you do?

Tenant Resolution:
Which tenant context are you operating inside?

Entitlement:
What product capability has been granted?

Subscription:
What commercial relationship exists?

```

These concepts must not be merged into one generic `access` flag.

---

# 97. API Documentation Standard

The final API contract should be represented in OpenAPI 3.1.

Each endpoint must document:

```text
summary
description
tags
authentication
authorization
tenant scope
parameters
request body
responses
error codes
idempotency
side effects
```

Schemas should be reusable through components.

Example conceptual structure:

```text
components:
  schemas:
    Student
    CreateStudentRequest
    UpdateStudentRequest
    Payment
    Subscription
    Entitlement
    Credential
    Device
    Attendance
    ExamAttempt
    ApiError
    PaginationMeta
```

---

# 98. API Tags

Recommended OpenAPI tags:

```text
Authentication
Students
Teachers
Assistants
Parents
Courses
Lessons
Assignments
Exams
Grades
Attendance
Packages
Payments
Subscriptions
Entitlements
Credentials
Devices
Meetings
Media
Analytics
Reports
Notifications
Settings
Platform
Support
Webhooks
```

---

# 99. API Contract Testing

Every critical endpoint should eventually have contract tests covering:

```text
happy path
validation failure
authentication failure
authorization failure
cross-tenant attempt
invalid state transition
duplicate request
idempotent retry
external provider failure
concurrency conflict
```

Implementation is outside Phase F, but these tests are part of the required future implementation contract.

---

# 100. Cross-Tenant Security Test Contract

For every tenant-sensitive endpoint, the implementation test plan must include:

```text
Actor from Tenant A
attempts to access Tenant B resource
```

Expected behavior:

```text
DENIED
```

This must be tested even when:

```text
resource ID is valid
resource exists
resource ID is guessed/manipulated
frontend hides the resource
```

---

# 101. State Transition Test Contract

Every stateful domain object should have transition tests.

Examples:

```text
Payment
Subscription
Credential
Device Binding
Exam Attempt
Support Session
```

Tests must distinguish:

```text
valid transition
invalid transition
duplicate transition
concurrent transition
replayed request
```

---

# 102. API Observability Contract

Every API request should be traceable using:

```text
request_id
tenant_id where safe
actor_id where safe
endpoint
status_code
duration
error_code where applicable
```

Logs must never expose secrets.

---

# 103. API Rate and Abuse Monitoring

The system should be capable of identifying suspicious patterns such as:

```text
repeated credential failures
rapid device changes
credential reuse patterns
unusual QR scan frequency
abnormal exam submission behavior
abnormal playback-event volume
rapid requests from a single actor/device
```

The API layer may emit security/abuse events.

The actual detection engine is a later domain concern.

---

# 104. API Contract for File References

The API should use file IDs/references rather than accepting arbitrary storage paths.

Bad:

```json
{
  "file_path": "/server/storage/private/foo.jpg"
}
```

Preferred:

```json
{
  "file_id": "file-id"
}
```

Storage locations remain infrastructure details.

---

# 105. API Contract for External Provider References

Provider-specific external IDs may be stored and exposed only when necessary.

Example:

```json
{
  "provider": "GOOGLE_MEET",
  "external_reference": "provider-reference"
}
```

Provider credentials and secrets never belong in ordinary response DTOs.

---

# 106. API Compatibility Rules

Once `/api/v1` is published:

The system must preserve:

```text
field meaning
field type
authentication behavior
authorization expectations
state transition semantics
error code meanings
```

Breaking changes require versioning or an explicitly managed compatibility strategy.

---

# 107. API Deprecation Rules

Deprecated fields/endpoints must be:

```text
documented
marked
monitored
given migration guidance
removed only through an approved versioning process
```

Silent removal is prohibited.

---

# 108. Application Layer Naming

Use-case names should communicate business intent.

Good:

```text
ApprovePayment
ActivateCredential
RecordAttendance
ReplaceCredentialDevice
SubmitExamAttempt
GenerateStudentReport
```

Avoid vague names such as:

```text
ProcessData
HandleUser
ManageThing
UpdateStatus
```

when the operation has a specific business meaning.

---

# 109. Controller Rules

Controllers/routes should mainly:

```text
receive request
authenticate context
invoke validation
construct DTO
invoke use case
map result to response
```

Controllers should NOT:

```text
perform large DB workflows
contain authorization rules directly
contain payment business logic
contain credential state machines
call vendor SDKs directly
perform analytics calculations
```

---

# 110. Frontend Contract

Frontend code should rely on generated/centralized API types once implementation begins.

Preferred future workflow:

```text
OpenAPI
    ↓
Typed API Contract
    ↓
Frontend Client
    ↓
React Query / equivalent data layer
```

Frontend must not manually duplicate server business rules.

For example:

```text
payment approval permission
credential activation eligibility
subscription validity
```

must be obtained from the server.

---

# 111. Frontend Mutation Behavior

For important mutations the UI must handle:

```text
loading
success
validation error
authorization error
conflict
rate limit
temporary integration failure
unexpected server failure
```

The frontend must not assume:

```text
HTTP 200 = business success
```

without validating the documented contract.

---

# 112. Recommended Resource Response Pattern

A resource response should normally look like:

```json
{
  "data": {
    "id": "resource-id",
    "type": "student",
    "attributes": {}
  },
  "meta": {
    "request_id": "request-id"
  }
}
```

The project must make a final decision between this explicit resource format and a flatter DTO format before OpenAPI generation.

This is an **Open Decision**.

---

# 113. OpenAPI Schema Strategy

The OpenAPI specification should define reusable schema components.

Avoid duplicating the same contract in many endpoints.

For example:

```text
StudentSummary
StudentDetail
StudentDashboard
```

may reuse:

```text
StudentBase
ContactInfo
Status
AuditMetadata
```

where appropriate.

However, schemas must not become overly abstract to the point that the contract becomes unreadable.

---

# 114. API Governance Rules

Every new endpoint must answer:

```text
Why does this endpoint exist?
Who can call it?
What tenant does it operate in?
What resource does it operate on?
What business rule does it trigger?
What state does it change?
What side effects happen?
Is it idempotent?
Is it synchronous or asynchronous?
What errors can occur?
What audit event is required?
```

---

# 115. Forbidden API Patterns

The following patterns are prohibited unless explicitly approved:

```text
/v1/doEverything
/v1/process
/v1/manage
```

Generic endpoints hiding many unrelated business actions are discouraged.

Also prohibited:

```text
client-supplied tenant_id as trusted authorization
direct model serialization
controller-heavy business logic
frontend-only authorization
provider SDK usage from domain code
unbounded collection endpoints
non-idempotent critical retries
silent state transitions
```

---

# 116. Core API Use Cases by Actor

## Platform Super Admin

```text
Create Tenant
Suspend Tenant
Configure Tenant
View Aggregate Usage
Manage Platform Configuration
Manage Platform Permissions
Manage Support
View Platform Audit
```

## Platform Support

```text
Start Authorized Support Session
Inspect Tenant Scope
Troubleshoot
End Support Session
```

## Tenant Owner / Teacher

```text
Manage Students
Manage Parents
Manage Staff
Manage Courses
Manage Lessons
Manage Packages
Review Payments
Manage Subscriptions
Manage Credentials
Manage Attendance
Manage Assessments
Manage Meetings
View Analytics
Generate Reports
Configure Tenant
```

## Assistant

```text
View Authorized Students
Record Attendance
Handle Authorized Payments
Assist with Assigned Operations
View Authorized Reports
```

## Student

```text
Authenticate
View Dashboard
View Courses
Watch Lessons
Submit Assignments
Take Exams
View Grades
View Attendance
Join Meetings
View Notifications
Manage Allowed Personal Data
```

## Parent

```text
Authenticate
View Children
View Attendance
View Progress
View Grades
View Reports
View Notifications
```

---

# 117. Critical End-to-End API Flows

## Flow A — Student Payment

```text
POST /payments
      ↓
Payment SUBMITTED
      ↓
reviewer accesses payment
      ↓
POST /payments/{id}/approve
      ↓
Payment APPROVED
      ↓
Subscription ACTIVATED
      ↓
Entitlement GRANTED
      ↓
optional Credential Issuance
      ↓
notification event
```

The API must preserve separation among these concepts.

---

# 118. Flow B — Credential Login

```text
POST /auth/credential/verify
      ↓
Credential validation
      ↓
Device policy evaluation
      ↓
Authentication success
      ↓
Session creation
      ↓
GET /me
      ↓
GET /student/dashboard
```

---

# 119. Flow C — QR Attendance

```text
Assistant authenticated
      ↓
POST /attendance/scans
      ↓
Resolve QR
      ↓
Resolve Student
      ↓
Resolve Session
      ↓
Authorization
      ↓
Validate attendance rules
      ↓
Record attendance
      ↓
Audit/event
```

---

# 120. Flow D — Exam Submission

```text
POST /exam-attempts
      ↓
STARTED
      ↓
answers submitted
      ↓
POST /exam-attempts/{id}/submit
      ↓
validate attempt state
      ↓
validate timing
      ↓
finalize attempt
      ↓
grade workflow
      ↓
publish when authorized
```

---

# 121. Flow E — Google Meet Creation

```text
POST /meetings
      ↓
Authorization
      ↓
Meeting Application Use Case
      ↓
MeetingProvider
      ↓
GoogleMeetAdapter
      ↓
External API
      ↓
Meeting persisted
      ↓
response returned
```

The domain must not know Google-specific implementation details.

---

# 122. Flow F — Support Access

```text
Platform Support
      ↓
POST /platform/support/sessions
      ↓
explicit authorization
      ↓
reason required
      ↓
temporary session
      ↓
tenant-scoped operations
      ↓
all sensitive activity audited
      ↓
session expiration/end
```

---

# 123. API Documentation Deliverables

Before implementation begins, Phase F should ultimately produce:

```text
docs/api/
├── README.md
├── api-overview.md
├── authentication.md
├── authorization.md
├── tenancy.md
├── errors.md
├── pagination.md
├── idempotency.md
├── webhooks.md
├── file-uploads.md
├── integrations.md
├── openapi.yaml
└── resources/
    ├── students.md
    ├── courses.md
    ├── attendance.md
    ├── assessments.md
    ├── payments.md
    ├── subscriptions.md
    ├── credentials.md
    ├── meetings.md
    ├── analytics.md
    ├── reports.md
    └── platform.md
```

The implementation may expand this structure while preserving the architectural boundaries.

---

# 124. AI Development Rules for Phase F

Any AI agent implementing Phase F-derived functionality must:

1. Read Phases A–E before changing API architecture.
2. Read the relevant domain documentation before creating an endpoint.
3. Never invent a new business rule silently.
4. Update API documentation after every implementation step.
5. Update OpenAPI contracts when endpoint behavior changes.
6. Record architecture-impacting decisions as ADRs.
7. Record incomplete work.
8. Record blocked work.
9. Record tests that were not implemented.
10. Never mark a feature complete if only frontend behavior exists without backend enforcement.

---

# 125. Definition of Done for an API Feature

An API feature is considered complete only when all applicable items exist:

```text
Use Case defined
Authorization defined
Tenant scope defined
Request DTO defined
Validation defined
Business rules defined
State transitions defined
Response DTO defined
Error codes defined
Idempotency defined where required
Audit defined where required
Events defined where required
OpenAPI updated
Tests defined/implemented
Documentation updated
```

---

# 126. API Phase F Acceptance Criteria

## F-AC-001

Every public endpoint has an explicit authentication contract.

## F-AC-002

Every protected endpoint has an explicit authorization policy.

## F-AC-003

Every tenant resource is tenant-isolated.

## F-AC-004

Client-provided tenant IDs are never treated as trusted authorization context.

## F-AC-005

Critical state-changing operations support idempotency.

## F-AC-006

Stateful objects reject illegal transitions.

## F-AC-007

API errors expose stable machine-readable error codes.

## F-AC-008

Large/expensive operations can be asynchronous.

## F-AC-009

External providers are abstracted behind application contracts.

## F-AC-010

API contracts are documented in OpenAPI.

## F-AC-011

Frontend authorization never replaces backend authorization.

## F-AC-012

Sensitive operations are auditable.

## F-AC-013

Cross-tenant access tests are required.

## F-AC-014

Business logic is not concentrated in controllers.

## F-AC-015

API contracts preserve the conceptual separation of:

```text
Authentication
Authorization
Identity
Subscription
Entitlement
Credential
Payment
```

---

# 127. Open Decisions

The following items should NOT be silently decided during implementation.

### F-OD-001
Final identifier format:

```text
UUIDv7
or
ULID
```

### F-OD-002
Final response envelope:

```text
flat DTO
or
data/type/attributes format
```

### F-OD-003
Final pagination standard:

```text
cursor only
or
cursor + page
```

### F-OD-004
Final optimistic concurrency strategy:

```text
ETag
version column
both
```

### F-OD-005
Final API authentication transport/session architecture:

```text
cookie-based
token-based
hybrid
```

### F-OD-006
Final webhook exposure model:

```text
internal provider webhooks only
tenant-facing webhooks
both
```

### F-OD-007
Final granular platform support API permissions.

### F-OD-008
Final MFA requirements for high-risk tenant/platform operations.

### F-OD-009
Final OpenAPI generation workflow.

### F-OD-010
Final public API gateway/reverse-proxy architecture.

---

# 128. Phase F Non-Goals

Phase F does NOT implement:

```text
Laravel controllers
Laravel services
database migrations
React components
Next.js pages
provider SDK integration
queue workers
actual authentication implementation
actual payment processing
actual Google Meet integration
```

Those belong to later implementation phases.

---

# 129. Relationship to Previous Phases

Phase F depends on and must respect:

```text
Phase A
Business/Product Foundation

Phase B
Business Requirements & Functional Specification

Phase C
Architecture Specification

Phase D
Domain Model / ERD / Database Specification

Phase E
Security / Scalability / Resilience / Operations
```

Any conflict must be handled through an ADR rather than silently rewriting a previously approved phase.

---

# 130. Final Architectural Rule

The final implementation should conceptually remain:

```text
HTTP/API
   ↓
Authentication
   ↓
Tenant Resolution
   ↓
Authorization / Policy
   ↓
Application Use Case
   ↓
Domain
   ↓
Repository / Infrastructure
   ↓
Database / External Provider
```

and not:

```text
HTTP
   ↓
Controller
   ↓
Huge Service
   ↓
Everything
```

The API is a contract, not the architecture itself.

---

# 131. Phase Status

```text
Phase A — Approved
Phase B — Approved
Phase C — Approved
Phase D — Approved
Phase E — Approved
Phase F — Draft / Pending Approval
```

**Next phase after Phase F approval:**  
Phase G — Frontend Application Architecture & UX/System Contract, covering application shell, routing, layouts, feature modules, state management, data fetching, permissions in UI, responsive behavior, PWA behavior, dashboard architecture, and RTL/UI system rules.

---

# 132. Final Instruction to AI Implementers

Before implementing any API endpoint, the AI must verify:

```text
1. Which domain owns this operation?
2. Which actor can invoke it?
3. Which tenant does it belong to?
4. Which permission/policy controls it?
5. Which state transitions are legal?
6. What request DTO is required?
7. What validation rules apply?
8. What response contract is expected?
9. What errors can occur?
10. Is idempotency required?
11. Is the operation transactional?
12. Does it emit a domain event?
13. Does it require an audit event?
14. Does it call an external provider?
15. Can that provider fail safely?
16. Does OpenAPI need updating?
17. Does the documentation need updating?
18. Does the implementation introduce a new ADR?
```

No endpoint should be created merely because the frontend needs a URL.

Every endpoint must correspond to a defined application capability and domain responsibility.
:::

**حالة المرحلة:** `Phase F — Draft / Pending Approval`

بعد اعتمادك لـPhase F، نقدر نثبتها في الـbaseline ونبدأ **Phase G** على نفس النسق، من غير ما نرجع نعيد تصميم المراحل السابقة.