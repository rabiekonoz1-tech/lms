بالضبط. ودلوقتي أعتقد إننا وصلنا للمرحلة الصح: **نوقف الكلام عن التنفيذ تمامًا، ونبني "Engineering Specification Package" كاملة للمشروع**.

وأنا مش هتعامل معها على إنها Prompt واحد ضخم فقط؛ لأن مشروع بالحجم ده لو ادينا الـAI Prompt واحد فيه 30 ألف سطر، هيبقى صعب عليه يحافظ على الـcontext والـarchitecture مع الوقت.

الأفضل إننا نبني **نظام Requirements + Documentation + AI Instructions** مترابط.

# الشكل العام اللي هنشتغل به

أنا أقترح إننا نبني الحزمة في **11 طبقة رئيسية**:

```text
01-product/
02-brd/
03-requirements/
04-architecture/
05-domain/
06-database/
07-security/
08-scalability/
09-testing/
10-ai/
11-project-management/
```

والـAI في النهاية مش هيقرأ ملف واحد؛ هيكون عنده **Master Context** يوجهه لباقي الملفات.

---

# Phase 0 — Specification Foundation

دي أهم مرحلة قبل أي Implementation.

هنعمل أولًا:

### 1. Product Vision

ملف يشرح:

- ما هي المنصة؟
- المشكلة التي تحلها.
- لمن موجهة؟
- Teacher Tenant.
- Educational Center Tenant.
- Online Platform.
- Offline Platform.
- Online + Offline.
- Student Unified Dashboard.
- Parent Dashboard.
- White Label.
- Subscription.
- Access Credential.
- Analytics.
- Reporting.

مثلاً:

```text
docs/01-product/product-vision.md
```

---

# 2. BRD — Business Requirements Document

ده هيكون **المرجع التجاري الرئيسي**.

مش هنكتب فيه كود.

هنوثق:

### Actors

- Platform Super Admin
- Platform Support
- Tenant Owner
- Teacher
- Assistant
- Student
- Parent

### Business Models

- Individual Teacher
- Educational Center
- Online
- Offline
- Online + Offline

### Business Processes

مثلاً:

```text
Tenant Creation
Student Enrollment
Subscription Purchase
Payment Submission
Payment Review
Access Activation
Credential Generation
Device Binding
Course Enrollment
Attendance
Exam
Assignment
Reporting
Parent Communication
```

---

# 3. Functional Requirements

هنا هنحول كل حاجة قلتها إلى Requirements مرقمة.

مثلاً:

```text
FR-AUTH-001
The system shall support credential-based student access.

FR-AUTH-002
The system shall support email/phone/password authentication.

FR-TEN-001
The system shall support teacher-based tenants.

FR-TEN-002
The system shall support organization-based tenants.

FR-ATT-001
The system shall support QR-based attendance.

FR-BILL-001
The system shall support manual payment verification.

FR-PERM-001
The system shall support RBAC and ABAC authorization.
```

وكل Requirement يبقى له:

- ID
- Description
- Actor
- Preconditions
- Expected Behavior
- Business Rules
- Dependencies
- Acceptance Criteria

وده مهم جدًا لأننا بعدين نقدر نربط:

**Requirement → Architecture → Code → Test**

---

# 4. Non-Functional Requirements

ودي بالنسبة لي من أخطر الملفات في المشروع.

هنوثق:

### Performance

- Response time
- API latency
- concurrent users
- QR scan performance
- video tracking
- dashboard loading

### Availability

- uptime target
- backup
- recovery
- disaster recovery

### Security

- Authentication
- Authorization
- Tenant Isolation
- Device Binding
- Session Security
- API Security
- Data Protection
- Audit Logs
- Rate Limiting

### Scalability

- 100 tenants
- 1,000 tenants
- future scaling
- database scaling
- queues
- caching
- storage
- monitoring

### Maintainability

- SOLID
- Design Patterns
- modularity
- documentation
- testing
- code quality

---

# 5. Architecture Specification

وده هيكون قلب المشروع.

مش مجرد Diagram.

هنعمل:

```text
docs/architecture/
├── architecture.md
├── system-context.md
├── application-architecture.md
├── backend-architecture.md
├── frontend-architecture.md
├── multi-tenancy.md
├── authentication.md
├── authorization.md
├── billing.md
├── credential-system.md
├── online-platform.md
├── offline-platform.md
├── parent-platform.md
├── notification-architecture.md
├── integration-architecture.md
├── infrastructure.md
└── observability.md
```

---

# 6. Design Pattern Specification

ودي هنعملها **وثيقة مستقلة** لأنك أكدت إن الـDesign Pattern بالنسبة لك شيء أساسي.

هنحدد:

### Architectural Patterns

مثل:

- Modular Architecture
- Domain-oriented organization
- Layered boundaries
- Dependency Inversion

### Design Patterns

حسب الحاجة:

- Strategy
- Factory
- Repository
- DTO
- Action / Command
- Specification
- Policy
- Adapter
- Observer / Domain Events
- State
- Builder
- Value Objects

لكن فيه Rule مهمة جدًا:

> **No Design Pattern Without a Reason.**

يعني الـAI ممنوع يحط Factory لمجرد إن Factory Pattern موجودة.

كل Pattern لازم يكون لها:

```text
Problem
Why this pattern
Where used
When not to use
Example
Dependencies
```

---

# 7. Domain Model + ERD

هنا هنبدأ نفك المشروع إلى Domains.

مثلًا:

```text
Identity
Tenancy
Users
Teachers
Assistants
Students
Parents
Courses
Lessons
Videos
Assignments
Exams
Attendance
Classrooms
Sessions
Credentials
Devices
Subscriptions
Payments
Entitlements
Reports
Analytics
Notifications
Meetings
```

وبعدها نعمل:

### Domain Model

ثم:

### ERD

ثم:

### Database Specification

ثم:

### Tenant Database Strategy

ثم:

### Relationships

ثم:

### Indexing Strategy

ثم:

### Constraints

ثم:

### Audit Strategy

يعني الـERD مش هيبقى مجرد رسم جداول.

---

# 8. Security Specification

دي هنعملها كأنها Security Handbook للمشروع.

وتشمل:

### Authentication

- Password authentication
- Credential authentication
- Session management
- Device binding
- Token management

### Authorization

```text
RBAC
+
ABAC
+
Policies
+
Scopes
+
Allow/Deny/Inherit
```

### Multi-Tenant Security

أهم Rule:

> No request may access tenant data without an explicitly resolved and authorized tenant context.

### Platform Admin

- Global visibility
- Restricted data access
- Support impersonation
- Audit trail

### Video Security

- Signed access
- Expiration
- Watermark
- Tracking
- Anti-abuse

### API Security

- Rate limiting
- Validation
- Authorization
- Input sanitization
- Secure headers
- CSRF where applicable
- CORS policy

---

# 9. Scalability & Infrastructure Specification

هنا هنحدد **كيف المنصة تكبر بدون إعادة بناء النظام**.

مثلاً:

```text
                    Load Balancer
                         │
              ┌──────────┴──────────┐
              │                     │
          App Instance          App Instance
              │                     │
              └──────────┬──────────┘
                         │
                      Queue
                         │
                 Background Workers
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       PostgreSQL      Cache         Storage
```

ومع الـMulti-Tenant:

```text
Control Plane
      │
Tenant Registry
      │
Tenant A → DB
Tenant B → DB
Tenant C → DB
```

ومع زيادة Tenant:

```text
Small Tenant
   ↓
Standard Database

Large Tenant
   ↓
Dedicated Database / Infrastructure
```

بحيث الـArchitecture تسمح بالـEvolution.

---

# 10. Testing Strategy

هنعمل Testing Strategy كاملة **قبل Implementation**.

مش آخر المشروع فقط.

مثلاً:

```text
tests/
├── unit
├── feature
├── integration
├── api
├── authorization
├── security
├── tenancy
├── e2e
├── performance
└── load
```

وهنعمل Requirements للـTesting نفسها.

مثلًا:

```text
Every authorization rule must have automated tests.

Every tenant boundary must have isolation tests.

Every critical payment workflow must have integration tests.

Every credential lifecycle state must have state-transition tests.
```

وفي النهاية:

### Definition of Done

أي Feature لا تعتبر Done إلا لو:

```text
Code
+
Tests
+
Documentation
+
Security Review
+
Architecture Compliance
```

---

# 11. AI Engineering Constitution

وده أهم ملف بالنسبة للي هتديه للـAI.

مش Prompt Feature.

ده **قانون المشروع**.

مثلاً:

```text
AI_ENGINEERING_RULES.md
```

ويحتوي على:

### Rule 1

اقرأ الـArchitecture قبل أي تعديل.

### Rule 2

لا تبدأ Implementation قبل فهم الـRequirement.

### Rule 3

لا تكسر Architectural Boundary.

### Rule 4

لا تعمل God Class.

### Rule 5

لا تعمل God Component.

### Rule 6

لا تضيف Dependency بدون justification.

### Rule 7

لا تغير Database Architecture بدون Documentation.

### Rule 8

لا تغير Security Rule بدون Security Documentation.

### Rule 9

كل Feature لها Tests.

### Rule 10

كل Change لازم يحدث الـDocumentation.

---

# والأهم: هنخلي الـAI يشتغل بنظام ثابت

أي Task:

```text
RECEIVE TASK
      ↓
READ DOCUMENTATION
      ↓
UNDERSTAND CONTEXT
      ↓
IDENTIFY AFFECTED DOMAINS
      ↓
CHECK ARCHITECTURAL RULES
      ↓
CREATE IMPLEMENTATION PLAN
      ↓
CHECK PLAN AGAINST ARCHITECTURE
      ↓
IMPLEMENT
      ↓
TEST
      ↓
SECURITY REVIEW
      ↓
ARCHITECTURE REVIEW
      ↓
UPDATE DOCUMENTATION
      ↓
UPDATE TASK STATUS
      ↓
DONE
```

ودي نقطة أنا شايف إنها لازم تبقى **إجبارية** في الـAI Prompt النهائي.

---

# وهنعمل Documentation State System

عشان الـAI يعرف المشروع واقف فين.

مثلاً:

```text
docs/project-management/
├── roadmap.md
├── timeline.md
├── backlog.md
├── completed.md
├── pending.md
├── blocked.md
├── technical-debt.md
└── changelog.md
```

والـAI يعرف دائمًا:

```text
Current Phase:
Current Sprint:
Completed:
In Progress:
Blocked:
Next:
Technical Debt:
Architecture Changes:
```

---

# والـAI هيكون عنده "Source of Truth Hierarchy"

ودي مهمة جدًا.

لو حصل تعارض بين الملفات، ما ينفعش AI يخمن.

هنحدد ترتيب مثل:

```text
1. Security Rules
2. Architecture Specification
3. Business Requirements
4. Domain Model
5. Technical Specifications
6. Feature Requirements
7. Implementation Notes
8. AI Task Instructions
```

ولو حصل Conflict:

> **STOP → REPORT CONFLICT → ASK/RESOLVE → THEN IMPLEMENT**

مش يخترع قرار من عنده.

---

# وفي النهاية هنطلع بحزمة تسليم للـAI

أنا متخيل الـRepository قبل Implementation بالشكل ده:

```text
project/
│
├── docs/
│   ├── product/
│   ├── brd/
│   ├── requirements/
│   ├── architecture/
│   ├── domain/
│   ├── database/
│   ├── security/
│   ├── scalability/
│   ├── testing/
│   ├── integrations/
│   ├── modules/
│   └── project-management/
│
├── ai/
│   ├── MASTER_PROMPT.md
│   ├── ENGINEERING_RULES.md
│   ├── WORKFLOW.md
│   ├── CODING_RULES.md
│   ├── DOCUMENTATION_RULES.md
│   └── REVIEW_RULES.md
│
├── architecture.md
│
├── README.md
│
└── [Implementation folders لاحقًا]
```

**Phase Zero نفسها** هتبدأ بإنشاء هذا الـSkeleton وتثبيت الـFoundation، وليس كتابة Features.

---

## لكن أنا أقترح ما نعملش كل ده مرة واحدة في Prompt واحد

الأصح إننا نبني الـRequirements **بترتيب هندسي**:

### المرحلة A — Product Definition
1. Product Vision
2. Personas / Actors
3. Business Model
4. Product Modules
5. User Journeys

### المرحلة B — Business Requirements
6. BRD
7. Functional Requirements
8. Non-Functional Requirements
9. Business Rules
10. Acceptance Criteria

### المرحلة C — Architecture
11. System Architecture
12. Domain Architecture
13. Backend Architecture
14. Frontend Architecture
15. Multi-Tenant Architecture
16. Authentication
17. Authorization
18. Credential Architecture
19. Billing Architecture
20. Integration Architecture

### المرحلة D — Data
21. Domain Model
22. ERD
23. Database Schema Specification
24. Indexing
25. Data Isolation
26. Audit Model

### المرحلة E — Security & Scale
27. Security Requirements
28. Threat Model
29. Security Controls
30. Scalability Requirements
31. Infrastructure Requirements
32. Backup & Disaster Recovery
33. Observability

### المرحلة F — Quality
34. Testing Strategy
35. QA Requirements
36. Performance Testing
37. Security Testing
38. Tenant Isolation Testing
39. Definition of Done

### المرحلة G — AI
40. Master AI Prompt
41. Engineering Constitution
42. AI Workflow
43. Documentation Protocol
44. Task Protocol
45. Review Protocol

### المرحلة H — Execution Plan
46. Phase 0
47. Development Phases
48. Milestones
49. Task Breakdown
50. Final Acceptance Checklist

---

**وده هو الترتيب اللي أنصح نمشي به في الشات ده.**

ومهم جدًا: **مش هنكتب أي كود في الشات ده.** الناتج النهائي هيكون مجموعة ملفات Requirements/Documentation/Prompts جاهزة تتحط في Repository وتتقدم للـAI كـSource of Truth للمشروع.

وأنا كمان هتعامل مع كل قرار قلته سابقًا على إنه **Requirement معتمد**، وأي نقطة غير محسومة هنحطها صراحة في `open-decisions.md` بدل ما نخلي الـAI يخمنها.