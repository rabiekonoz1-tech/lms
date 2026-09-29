تمام يا باشا. دي **Phase A — Product Definition**، وهي أول طبقة رسمية في الـRequirements Package. أنا بنيتها من كل اللي قلته من بداية الشات، من غير ما أعيد عليك أي قرار أنت حسمته.

النسخة دي تعتبر **Draft Pending Review**؛ بعد مراجعتك وتثبيتها هنعتبرها Baseline ونبني عليها الـBRD والـFunctional Requirements.

:::writing{variant="document" id="58321" title="Phase A — Product Definition"}
# Phase A — Product Definition
## Educational Multi-Tenant SaaS Platform

**Document Status:** Draft — Pending Review  
**Document Type:** Product Definition  
**Source of Truth Level:** Product Layer  
**Implementation Status:** Not Started  
**Primary Language:** Arabic RTL  
**Target Market:** Gulf Market, with primary Saudi-oriented UX and branding

---

# 1. Product Vision

## 1.1 Product Overview

The product is a multi-tenant, white-label educational SaaS platform designed to provide teachers and educational organizations with a complete digital operating environment for managing teaching, students, attendance, assessments, subscriptions, access, analytics, communication, and reporting.

The platform is not limited to traditional Learning Management System functionality.

It combines:

- Learning Management
- Offline Education Management
- Student Management
- Attendance Management
- Assessment Management
- Student Performance Analytics
- Parent Communication
- Subscription and Billing Workflows
- Access Credential Management
- Device Binding
- Role-Based and Attribute-Based Authorization
- White-Label Tenant Management
- Platform-Level Administration
- External Video Integrations
- Google Meet Integration
- Notifications and future WhatsApp integration

The system must support both individual teachers and large educational centers using the same core platform.

---

## 1.2 Core Product Concept

The platform provides a ready-to-use educational environment to teachers without requiring each teacher to build, host, maintain, or purchase a standalone educational platform.

Each teacher or educational organization receives an isolated tenant environment that can be branded and configured independently.

A tenant may operate as:

1. Individual Teacher
2. Educational Center / Organization

The platform must support both models without requiring separate products or codebases.

---

## 1.3 Product Philosophy

The product must be built around the following principles:

- Architecture-first development
- Strong modularity
- Strong OOP
- SOLID principles
- Clear domain boundaries
- RBAC + ABAC authorization
- Strong tenant isolation
- Security by design
- Scalable infrastructure
- Documentation-driven development
- AI-assisted engineering with persistent project context
- Test-driven quality controls
- Extensible integrations
- White-label tenant experience
- Feature modularity
- Reusable domain capabilities

The platform must be designed so that future developers and AI agents can understand and extend it without introducing architectural degradation.

---

# 2. Actors and Personas

## 2.1 Platform Super Admin

The highest-level platform operator.

Responsibilities include:

- Managing platform-level configuration
- Managing tenants
- Monitoring overall platform usage
- Monitoring tenant-level usage metrics
- Managing tenant-level product availability
- Configuring authentication modes for tenants
- Managing platform-level rules
- Managing system-level roles and permissions
- Accessing global operational metrics
- Performing administrative actions
- Managing platform-level support policies

The Super Admin operates outside individual tenant boundaries.

The Super Admin must not automatically gain unrestricted access to private tenant content merely because global operational visibility exists.

---

## 2.2 Platform Support

A platform support operator responsible for technical or operational assistance.

Responsibilities may include:

- Supporting tenants
- Troubleshooting tenant issues
- Performing authorized tenant access
- Assisting with account/device issues
- Investigating operational issues

Support access to a tenant must be:

- Explicitly authorized
- Limited in scope
- Time bounded where appropriate
- Fully auditable

---

## 2.3 Tenant Owner

The owner of a tenant.

The tenant may represent:

- An individual teacher
- An educational center
- An educational organization

The Tenant Owner has broad control over tenant operations according to platform-defined capabilities.

The Tenant Owner may:

- Manage teachers
- Manage assistants
- Manage students
- Manage parents
- Manage classes
- Manage courses
- Manage attendance
- Manage exams
- Manage assignments
- Manage reports
- Manage subscriptions
- Approve or reject payment requests
- Manage student access
- Manage device bindings
- Configure tenant settings
- Configure tenant branding

The exact permission model must remain governed by RBAC + ABAC, while the owner receives the highest tenant-level authority.

---

## 2.4 Teacher

A teaching user operating inside a tenant.

A teacher may:

- Manage courses
- Manage lessons
- Manage content
- Manage students
- Manage assignments
- Manage exams
- Grade assessments
- Conduct online sessions
- Manage offline classes
- Review attendance
- Review student performance
- Configure KPIs
- Generate reports
- Manage student access according to permissions
- Approve payment requests
- Manage device changes according to permissions

Teachers inside an educational center must remain logically independent from one another while operating under the same tenant.

---

## 2.5 Assistant

A staff member working for a teacher or educational organization.

Assistants operate according to dynamic permissions and scopes.

Examples:

- Attendance-only assistant
- Payment-review assistant
- Student-management assistant
- Exam assistant
- Reporting assistant
- General administrative assistant

The system must not assume that every assistant has the same capabilities.

Assistant access is governed by:

- Roles
- Permissions
- Allow / Deny / Inherit
- Attribute-based rules
- Resource scopes
- Tenant context

---

## 2.6 Student

The end learner.

A student may use:

- Online educational content
- Courses
- Lessons
- Video content
- Assignments
- Exams
- Results
- Attendance records
- Performance analytics
- Schedules
- Files
- Live sessions
- Reports

A student may be associated with multiple teachers and multiple tenants.

The student experience must provide a unified platform-level student experience while preserving tenant-specific boundaries.

A student's data and access under each teacher/tenant remain logically separate.

---

## 2.7 Parent / Guardian

A parent or guardian is associated with one or more students inside a specific tenant.

A parent account is **tenant-scoped**, not platform-global.

A parent may have multiple students under the same tenant.

A parent may view authorized information such as:

- Attendance
- Exam results
- Assignment status
- Learning progress
- Performance metrics
- Reports
- Relevant notifications

Parent visibility is subject to tenant policies and authorization rules.

---

# 3. Business Model

## 3.1 Tenant Models

The platform supports two primary tenant models.

### Individual Teacher Tenant

A teacher operates the tenant independently.

Typical structure:

```text
Tenant
└── Teacher
    ├── Assistants
    ├── Students
    └── Parents
```

### Educational Organization / Center Tenant

A larger organization operates a tenant containing multiple independent teachers.

Typical structure:

```text
Tenant / Organization
├── Teachers
│   ├── Teacher A
│   ├── Teacher B
│   └── Teacher C
├── Assistants
├── Students
└── Parents
```

The architecture must support both without creating separate application architectures.

---

# 4. Product Modules

The platform consists of modular capabilities.

## 4.1 Identity and Access

Provides:

- User identities
- Authentication
- Access Credentials
- Traditional authentication
- Device binding
- Session management
- Tenant resolution
- Access validation

Each tenant may use one of the supported authentication models according to platform configuration.

---

## 4.2 Tenant Management

Provides:

- Tenant creation
- Tenant configuration
- Tenant branding
- Tenant subdomain
- Tenant settings
- Tenant users
- Tenant modules
- Tenant-level policies

---

## 4.3 Online Platform

Provides:

- Courses
- Lessons
- Video content
- External video integrations
- Assignments
- Exams
- Grades
- Live sessions
- Google Meet integration
- Video progress tracking
- Learning progress
- Student dashboards
- Online performance analytics

---

## 4.4 Offline Platform

Provides:

- Branch
- Classroom
- Class
- Session
- Attendance
- QR-based student identification
- Assistant mobile workflow
- Practical performance tracking
- Offline student analytics
- Offline reports

Attendance must support configurable operating modes such as:

- Open attendance
- Scheduled attendance
- Session-based attendance

---

## 4.5 Student Unified Dashboard

A student may belong to multiple teachers/tenants.

The platform must allow the student to access a unified student experience while maintaining tenant isolation.

Example:

```text
Student
├── Teacher A
│   ├── Course 1
│   └── Course 2
│
├── Teacher B
│   ├── Course 3
│   └── Course 4
│
└── Teacher C
    └── Course 5
```

The student should not need completely separate platform experiences for each teacher.

The dashboard must organize content by tenant/teacher while presenting one coherent student experience.

---

## 4.6 Parent Platform

Provides:

- Parent authentication
- Student association
- Multi-child view
- Progress overview
- Attendance
- Exam results
- Assignment tracking
- Reports
- Notifications
- Future WhatsApp communication

Parent accounts remain tenant-scoped.

---

## 4.7 Access Credential System

The product uses a dedicated Access Credential system.

The credential may be presented commercially as a coupon, but architecturally it represents a controlled access credential.

The credential:

- Belongs to a tenant context
- Is associated with a student
- Can grant access to the tenant
- Can be converted into a QR representation
- Can be bound to a device
- Has a lifecycle
- Can be activated, suspended, revoked, or expired
- Is subject to authorization rules

The credential is not the same concept as authentication session credentials.

---

## 4.8 Subscription and Billing

The platform currently supports manual payment workflows.

Payment methods include:

- InstaPay
- Cash

The student submits payment information and proof.

The payment process includes:

1. Payment request creation
2. Student account creation
3. Payment proof submission
4. Review
5. Approval / rejection
6. Subscription activation
7. Entitlement activation
8. Access activation

Payment, subscription, entitlement, and access must remain separate business concepts.

---

## 4.9 Authorization System

The platform uses:

- RBAC
- ABAC
- System Rules
- Custom Rules
- Allow
- Deny
- Inherit
- Resource Scopes

Authorization applies across:

- Modules
- Models
- Features
- Actions
- Data
- Tenant resources
- Staff resources
- Administrative operations

---

## 4.10 Analytics and Performance

The system provides a comprehensive student performance framework.

Standard KPIs may include:

- Attendance
- Exam performance
- Assignment completion
- Assignment delay
- Video completion
- Course progress
- Learning activity
- Performance improvement

The platform must also support teacher-defined custom performance metrics.

Examples:

```text
Mathematics
- Accuracy
- Speed
- Homework
- Attendance
- Exam

Languages
- Speaking
- Writing
- Reading
- Listening
```

The analytics system must be metadata/configuration driven rather than based on arbitrary hardcoded metrics.

---

## 4.11 Reporting

Reports may be generated for:

- Students
- Parents
- Teachers
- Tenant management

Reports may include:

- Attendance
- Grades
- Assignments
- Learning progress
- Performance metrics
- Practical performance
- General student status

Future reporting channels may include WhatsApp.

---

## 4.12 Notification System

Initial notification infrastructure:

- In-app notifications
- Email via SMTP

Planned future integration:

- Official WhatsApp API

The notification architecture must remain provider-independent so that providers can be introduced or replaced without changing core business logic.

---

## 4.13 White-Label System

Each tenant may have independent:

- Name
- Logo
- Colors
- Branding
- Subdomain
- User-facing identity

The platform must render the tenant's branding while maintaining a shared underlying application architecture.

---

# 5. User Journeys

## 5.1 Teacher / Tenant Onboarding

```text
Platform Admin
    ↓
Create Tenant
    ↓
Select Tenant Type
    ├── Individual Teacher
    └── Educational Organization
    ↓
Configure Tenant
    ↓
Configure Branding
    ↓
Configure Enabled Modules
    ↓
Configure Authentication Mode
    ↓
Tenant Ready
```

---

## 5.2 Student Enrollment via Payment

```text
Student
    ↓
Select Teacher/Tenant
    ↓
Select Subscription
    ↓
Choose Payment Method
    ├── InstaPay
    └── Cash
    ↓
Submit Identity Information
    ↓
Submit Payment Information
    ↓
Upload Proof
    ↓
Create Student User
    ↓
Request = Pending Review
    ↓
Authorized Reviewer
    ├── Approve
    │     ↓
    │  Subscription
    │     ↓
    │  Entitlement
    │     ↓
    │  Access
    │
    └── Reject
```

---

## 5.3 Student Credential Login

```text
Student
   ↓
Enter Access Credential
   ↓
Validate Credential
   ↓
Resolve Tenant
   ↓
Resolve Student
   ↓
Validate Subscription / Entitlement
   ↓
Validate Device
   ↓
Create Secure Session
   ↓
Student Dashboard
```

Alternative authentication may use:

```text
Phone/Email
+
Password
+
Access Credential
```

depending on tenant configuration.

---

## 5.4 Student Online Learning Journey

```text
Student
   ↓
Dashboard
   ↓
Tenant / Teacher
   ↓
Course
   ↓
Lesson
   ↓
Video
   ↓
Track Progress
   ↓
Assignment
   ↓
Submit Assignment
   ↓
Exam
   ↓
Result
   ↓
Performance Analytics
```

---

## 5.5 Offline Attendance Journey

```text
Assistant
   ↓
Open Attendance Scanner
   ↓
Select / Resolve Session
   ↓
Scan Student QR
   ↓
Validate Student Credential / Identity
   ↓
Validate Tenant / Session / Permissions
   ↓
Record Attendance
   ↓
Update Student Attendance
   ↓
Update Analytics
```

---

## 5.6 Payment Review Journey

```text
Student
   ↓
Submit Payment Request
   ↓
Review Queue
   ↓
Authorized Reviewer
   ↓
Review Payment
   ├── Approve
   └── Reject
        ↓
   Record Reason / Audit
```

---

## 5.7 Parent Journey

```text
Parent
   ↓
Tenant-specific Authentication
   ↓
Parent Dashboard
   ↓
Select Student
   ↓
View:
- Attendance
- Assignments
- Exams
- Performance
- Reports
- Progress
```

A parent may switch between multiple children belonging to the same tenant.

---

## 5.8 Device Change Journey

```text
Student
   ↓
Device Change Required
   ↓
Teacher or Platform Admin
   ↓
Authorize Device Change
   ↓
Unbind Previous Device
   ↓
Bind New Device
   ↓
Audit Event
```

---

# 6. Product-Level Business Principles

The following principles are mandatory at product level.

### BP-001 — Tenant Flexibility

A tenant may represent either an individual teacher or a full educational organization.

### BP-002 — Tenant Isolation

Tenant data must remain isolated by design.

### BP-003 — Student Multi-Tenant Participation

A student may participate in multiple tenants while preserving tenant-specific relationships and permissions.

### BP-004 — Unified Student Experience

The student may access multiple teacher relationships through one coherent platform experience.

### BP-005 — Parent Tenant Scope

Parent accounts are tenant-scoped and are not globally shared across the platform.

### BP-006 — Credential as Access Mechanism

Commercial coupons are architecturally treated as access credentials.

### BP-007 — Credential Tenant Scope

A credential grants access to a tenant according to its configured lifecycle and authorization conditions.

### BP-008 — Device Restriction

Access credentials may be restricted to one bound device according to tenant/platform rules.

### BP-009 — Manual Billing

The current billing process is based on manually submitted payment proof and human review.

### BP-010 — Dynamic Authorization

Authorization must be configurable through RBAC + ABAC rather than hardcoded roles.

### BP-011 — White Label

Each tenant can operate under its own branding and subdomain.

### BP-012 — Modular Online/Offline Products

Online and Offline capabilities are independently enableable and may be combined.

### BP-013 — Configurable Analytics

Teachers may define custom performance metrics in addition to standard KPIs.

### BP-014 — Provider Independence

External integrations must be abstracted so providers can be changed without rewriting core business logic.

### BP-015 — Documentation-Driven Development

Project documentation is part of the system engineering process and must remain synchronized with implementation.

---

# 7. Product Success Definition

At the product-definition level, the system is successful when a teacher or educational organization can use the platform as its primary educational management environment without needing to build an independent LMS or attendance/reporting system.

The platform must simultaneously support:

- Individual teachers
- Large educational centers
- Online education
- Offline education
- Hybrid education
- Students with multiple teachers
- Parents with multiple students within a tenant
- Dynamic staff permissions
- Secure access credentials
- Manual subscriptions
- White-label branding
- Analytics and performance management

without requiring separate products or fragmented codebases.

---

# 8. Product-Level Open Decisions

The following items are intentionally not finalized at this stage because they belong to later specifications:

1. Exact subscription plan structure
2. Exact entitlement model
3. Complete credential state machine
4. Exact device replacement rules and limits
5. Exact parent authentication mechanism
6. Exact tenant organization hierarchy
7. Exact branch structure within educational centers
8. Exact video provider implementation
9. Exact infrastructure provider
10. Exact scalability thresholds
11. Exact notification event catalog
12. Exact KPI formulas and calculation definitions

These items must be resolved in downstream requirements before implementation begins.

---

# 9. Product Definition Completion Criteria

Phase A can be considered approved when:

- Product scope is agreed
- Supported tenant models are agreed
- User roles are agreed
- Product modules are agreed
- Major user journeys are agreed
- Online/Offline scope is agreed
- Student multi-tenant behavior is agreed
- Parent tenant scope is agreed
- Credential concept is agreed
- Product-level open decisions are explicitly tracked

No downstream document may contradict an approved Phase A decision.
:::

دي كده **الخمس نقاط الأولى رسميًا**: Product Vision، Actors، Business Model، Product Modules، User Journeys، ومعاهم Business Principles وOpen Decisions عشان المرحلة اللي بعدها تبقى مبنية على مرجع ثابت.

بعد ما تراجع المرحلة دي، هنحوّلها للمرحلة **B — BRD + Functional Requirements + Non-Functional Requirements + Business Rules + Acceptance Criteria**، وهنبنيها Requirement IDs مترابطة من البداية.

memcite