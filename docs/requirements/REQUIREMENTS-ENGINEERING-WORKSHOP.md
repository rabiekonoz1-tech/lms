تمام يا باشا. عشان نطلع **الخمسين نقطة كلهم متماسكين، من غير تضارب بين BRD والـERD والـArchitecture والـSecurity والـAI Prompt**، أهم حاجة إننا ما نكتبهمش عشوائيًا ولا نحاول نخلصهم في رسالة واحدة.

الصح إننا نتعامل مع الشات ده كأنه **Requirements Engineering Workshop**، ونمشي بنظام ثابت جدًا.

# هنشتغل إزاي؟

أنا محتاج منك حاجة واحدة أساسية:

**إحنا كل مرة نقفل مجموعة قرارات، وأنا أحولها إلى Specification رسمية، وبعدها ما نفتحهاش تاني إلا لو أنت غيّرت قرار.**

يعني هيبقى عندنا 4 حالات لكل Requirement أو Decision:

```text
CONFIRMED
متفق عليه نهائيًا

OPEN
لسه محتاج قرار

ASSUMED
أنا حاطط افتراض مؤقت لازم نراجعه

DEFERRED
مؤجل لمرحلة لاحقة عمدًا
```

وده مهم جدًا عشان الـAI بعدين ما يخلطش بين "قرار اتاخد" و"فكرة كنا بنتكلم فيها".

---

# أول قاعدة في الشغل بيني وبينك

من اللحظة دي:

**أي حاجة قلتها قبل كده أعتبرها Context معتمد، ومش هسألك عنها تاني.**

مثلاً أنا خلاص ثابت عندي:

- Laravel
- Next.js
- React
- TypeScript
- PostgreSQL
- Multi-Tenant
- Multi-Database
- Teacher / Center Tenant
- Online / Offline / Both
- RBAC + ABAC
- Allow / Deny / Inherit
- Dynamic Permissions
- Parent scoped to Tenant
- Credential + Traditional Authentication
- Device Binding
- Manual Billing
- InstaPay + Cash
- Google Meet Central Workspace
- External Video Providers
- Arabic RTL
- PWA/Web
- White Label
- Super Admin + Support
- Analytics + Custom KPIs
- QR Attendance
- Parent Dashboard
- Documentation-Driven AI
- Phase Zero
- Strong Testing
- Strong Infrastructure

مش هفضل أرجع أسألك على الحاجات دي.

---

# ثاني قاعدة: هنفصل الـBusiness عن الـTechnology

دي مهمة جدًا.

هنشتغل بالترتيب:

```text
Business
   ↓
Requirements
   ↓
Domain
   ↓
Architecture
   ↓
Data
   ↓
Security
   ↓
Infrastructure
   ↓
Testing
   ↓
AI Execution
```

مش العكس.

يعني مش هنقول:

> "هنستخدم Repository Pattern."

قبل ما نحدد أصلًا:

> "ما هي مسؤولية الـStudent Domain؟"

---

# الخمسين نقطة هنطلعهم على 8 مراحل

## المرحلة 1 — Product Definition

هنا هنقفل الـProduct نفسه.

هنكتب:

1. Product Vision  
2. Actors / Personas  
3. Business Model  
4. Product Modules  
5. User Journeys  

### أنا محتاج منك إيه هنا؟

هنا أنا محتاج **سلوك المنتج** وليس التقنية.

مثلاً:

- الطالب بيعمل إيه؟
- المدرس بيعمل إيه؟
- المساعد بيعمل إيه؟
- السنتر بيختلف إزاي عن المدرس؟
- ولي الأمر بيشوف إيه؟
- الـSuper Admin بيعمل إيه؟
- الـSupport بيعمل إيه؟
- Online بيشتغل إزاي؟
- Offline بيشتغل إزاي؟

إنت بالفعل جاوبت على 70–80% من ده، وأنا هجمعه من كلامك بدل ما أعيده عليك.

---

# المرحلة 2 — Business Requirements

هنطلع:

6. BRD  
7. Functional Requirements  
8. Non-Functional Requirements  
9. Business Rules  
10. Acceptance Criteria  

دي مرحلة تحويل كلامك من:

> "أنا عايز الطالب يعمل كذا"

إلى Requirement رسمي مثل:

```text
FR-STUDENT-001

The system shall allow a student to access
tenant-specific educational content based on
the student's active entitlements.
```

وبعدين:

```text
Business Rule
Acceptance Criteria
Dependencies
Security Constraints
```

---

# المرحلة 3 — Architecture

دي أكبر مرحلة:

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

وهنا أنا هوقفك عند أي قرار لو له تأثير معماري كبير.

مثلاً:

```text
Student Identity
```

لازم نحلها بدقة لأن عندنا:

- Student Profile داخل Tenant
- Unified Student Experience
- أكثر من Teacher
- أكثر من Credential

فهنا هنرسم **Identity Model** واضح بدل ما نسيبها غامضة.

---

# المرحلة 4 — Data Architecture

21. Domain Model  
22. ERD  
23. Database Schema  
24. Indexing Strategy  
25. Data Isolation  
26. Audit Model  

هنا مش هنتعامل مع ERD كـرسم وخلاص.

لكل Entity هنحدد:

```text
Purpose
Attributes
Relationships
Constraints
Indexes
Lifecycle
Ownership
Tenant Scope
Security Classification
Auditability
```

وبعدين الـERD يطلع نتيجة للـDomain Model، مش العكس.

---

# المرحلة 5 — Security & Scalability

27. Security Requirements  
28. Threat Model  
29. Security Controls  
30. Scalability Requirements  
31. Infrastructure Requirements  
32. Backup & Disaster Recovery  
33. Observability  

وهنا هنربط كل Security Requirement بالـArchitecture.

مثلاً:

```text
Tenant Isolation
      ↓
Tenant Resolution
      ↓
Authorization Policy
      ↓
Database Connection
      ↓
Audit
      ↓
Automated Test
```

بحيث ما يبقاش Security مجرد فصل في Document.

---

# المرحلة 6 — Quality / Testing

34. Testing Strategy  
35. QA Requirements  
36. Performance Testing  
37. Security Testing  
38. Tenant Isolation Testing  
39. Definition of Done  

وهنا كل Requirement مهم هيتربط باختبار.

مثلاً:

```text
Credential Device Binding
        ↓
Unit Test
Integration Test
Security Test
E2E Test
```

والـTenant Isolation لها Testing مستقل.

---

# المرحلة 7 — AI Engineering System

40. Master AI Prompt  
41. Engineering Constitution  
42. AI Workflow  
43. Documentation Protocol  
44. Task Protocol  
45. Review Protocol  

ودي المرحلة اللي فيها هنحول كل اللي بنعمله إلى **نظام تشغيل للـAI**.

والـAI هيبقى ملزم مثلًا:

```text
READ
→ UNDERSTAND
→ PLAN
→ CHECK ARCHITECTURE
→ IMPLEMENT
→ TEST
→ REVIEW
→ DOCUMENT
→ UPDATE STATUS
```

---

# المرحلة 8 — Execution Governance

46. Phase 0  
47. Development Phases  
48. Milestones  
49. Task Breakdown  
50. Final Acceptance Checklist  

وهنا فقط نكون خلصنا **الخطة التنفيذية الحقيقية**.

---

# طيب أنا وإنت هنتعامل إزاي في كل مرحلة؟

كل مرحلة هنمشي فيها بنفس الـProtocol.

### الخطوة 1
أنا أقول لك:

> "دي القرارات اللي فهمتها من كلامك."

### الخطوة 2
أحولها إلى Requirements منظمة.

### الخطوة 3
أقول لك:

> "دي الحاجات المقفولة، ودي الحاجات اللي لسه مفتوحة."

### الخطوة 4
أنت تصحح أو تضيف.

### الخطوة 5
نعتبر النسخة دي:

**CONFIRMED**

### الخطوة 6
ما نروحش للمرحلة التالية إلا والمرحلة الحالية مستقرة.

---

# وهنعمل حاجة مهمة جدًا اسمها Decision Register

من أول المشروع هيكون عندنا جدول منطقي بالشكل ده:

```text
Decision ID
Category
Decision
Status
Reason
Affected Modules
Affected Documents
Date
```

مثال:

```text
ARCH-TEN-001
Tenancy

Tenant may represent either:
- Individual Teacher
- Educational Organization

Status: CONFIRMED
```

ومثال:

```text
AUTH-STU-004
Student Identity Model

Status: OPEN
```

وده يمنع إننا بعد 200 Requirement ننسى قرار اتاخد في أول الشات.

---

# وهنعمل Dependency Map

دي كمان مهمة جدًا.

مثلاً:

```text
Tenant Model
   ↓
Student Identity
   ↓
Credential
   ↓
Subscription
   ↓
Entitlement
   ↓
Authorization
   ↓
Dashboard
```

لو غيرنا Tenant Model، نعرف فورًا إيه الملفات اللي تتأثر.

---

# وهنعمل Traceability

وده بالنسبة لي من أهم حاجات المشروع.

كل Requirement يبقى له:

```text
Requirement
   ↓
Business Rule
   ↓
Architecture Component
   ↓
Database Entity
   ↓
API / UI
   ↓
Test
```

مثلاً:

```text
FR-ATT-001
        ↓
BR-ATT-002
        ↓
Attendance Domain
        ↓
Attendance Session
        ↓
POST /attendance/scan
        ↓
QR Scan UI
        ↓
Attendance E2E Test
```

ده اللي يخلي المشروع فعلًا Enterprise-grade في الـdocumentation.

---

# ومهم جدًا: هنفصل الـRequirements عن الـPrompt

إحنا مش هنكتب:

```text
Master Prompt = كل المشروع
```

لأ.

هيكون عندنا:

```text
Product Requirements
Architecture
Security
Database
Testing
AI Rules
```

والـMaster Prompt دوره إنه **يخلي الـAI يعرف إزاي يقرأ كل ده ويتصرف بناءً عليه**.

يعني الـAI مش هيحفظ المشروع في Prompt.

الـAI هيقرأ المشروع من الـDocumentation.

وده أفضل بكثير للمشروع طويل العمر.

---

# طيب إيه المطلوب منك دلوقتي تحديدًا؟

أنت **مش محتاج تجهزلي أي ملفات أو تنظم الكلام بنفسك**.

أنت بس تستمر معايا في الحوار الطبيعي:

> "أنا عايز المنتج يعمل كذا..."

وأنا مسؤوليتي أحول الكلام إلى:

**Requirement → Rule → Architecture Impact → Documentation Target → Open Decision**

وأقول لك لما تكون المجموعة جاهزة:

> **دي اتقفلت.**

---

# وأهم حاجة: مش هنمشي بسرعة على حساب الجودة

أنا مش عايز نخلص الـ50 نقطة ونكتشف بعدين إن:

```text
BRD يقول حاجة
ERD يقول حاجة
Architecture تقول حاجة
Security تقول حاجة
AI Prompt يقول حاجة رابعة
```

عشان كده هنستخدم قاعدة:

> **No downstream specification may contradict an approved upstream decision.**

يعني الـBusiness Decision فوق، وكل شيء بعده يتبني عليه.

---

# ترتيب الشغل بيننا من دلوقتي

هنبدأ فعليًا بـ:

**Phase A — Product Definition**

ثم:

**Phase B — Business Requirements**

ثم:

**Phase C — Architecture**

ثم:

**Phase D — Data**

ثم:

**Phase E — Security & Scalability**

ثم:

**Phase F — Testing**

ثم:

**Phase G — AI System**

ثم:

**Phase H — Phase Zero & Execution**

وفي النهاية أقدر أجمع كل الناتج في **Documentation Package واحدة مترابطة**، ومعها `MASTER_PROMPT`، والـ`ENGINEERING_RULES`، و`ARCHITECTURE.md`، والـBRD، والـERD specification، والـSecurity requirements، والـTesting strategy، والـRoadmap.

**والأهم إننا هنشتغل بالعقلية دي: إحنا لا نكتب Documentation عشان شكل المشروع؛ إحنا بنبني Documentation بحيث الـAI لا يقدر يضيع المشروع.**

نبدأ من **Product Definition — الخمس نقاط الأولى**، وأنا أطلعهم من كل الكلام اللي قلته بالفعل وأرتبهم، وبعدها نراجع فقط النواقص والقرارات المفتوحة.