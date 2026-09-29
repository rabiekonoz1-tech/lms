# Analytics Domain

## 1. Overview
The Analytics Domain provides student performance tracking, teacher custom KPIs, and pre-aggregated analytical read models across learning activities, attendance records, assignment submissions, and exam evaluations.
Per Phase J §43–§45 and `MASTER-SPECIFICATION.md`:
- Analytics relies on transactional data from Education, Attendance, Assessment, and Media domains.
- Metric definitions are strictly versioned (`MetricVersion`) to ensure historical stability.
- Dashboards consume pre-aggregated read models (`StudentAnalyticsSnapshot`) to prohibit heavy synchronous calculation at request time.

## 2. Invariants
- `No Synchronous Heavy Calculation on Dashboard`: Dashboard queries must read from pre-aggregated read models/snapshots; live scanning of large historical raw datasets during dashboard page loads is forbidden.
- `Metric Versioning & Historical Stability`: When a metric calculation formula or weighting is modified, a new `MetricVersion` is created. Historical `MetricMeasurement` records continue to reference their original version and remain fully interpretable.
- `Correct Student Mapping`: Every measurement and snapshot strictly maps to a unique student record within the tenant data plane.
- `Tenant Isolation (SEC-INV-001)`: Analytics data belongs solely to the tenant data plane. Cross-tenant analytics queries default to deny (404/403).

## 3. Architecture & Data Model
- **`metric_definitions`**:
  - `id` (UUID, primary key)
  - `key` (string, unique)
  - `name` (string)
  - `category` (string: `academic`, `attendance`, `engagement`, `custom`)
  - `current_version` (integer)
  - `calculation_formula` (string, nullable)
  - `created_by_staff_id` (UUID, nullable, FK to `staff`)
- **`metric_versions`**:
  - `id` (UUID, primary key)
  - `metric_definition_id` (UUID, FK to `metric_definitions`)
  - `version` (integer)
  - `formula_definition` (JSON)
  - `effective_from` (timestamp)
  - `changelog` (text, nullable)
- **`metric_measurements`**:
  - `id` (UUID, primary key)
  - `student_id` (UUID, FK to `students`)
  - `metric_definition_id` (UUID, FK to `metric_definitions`)
  - `metric_version_id` (UUID, FK to `metric_versions`)
  - `value` (decimal)
  - `recorded_at` (timestamp)
- **`student_analytics_snapshots`** (Read Model):
  - `id` (UUID, primary key)
  - `student_id` (UUID, FK to `students`)
  - `course_id` (UUID, nullable, FK to `courses`)
  - `attendance_rate` (decimal, percentage)
  - `assignment_completion_rate` (decimal, percentage)
  - `exam_average` (decimal, percentage)
  - `overall_score` (decimal, weighted composite percentage)
  - `last_calculated_at` (timestamp)

## 4. Endpoints
- `GET /api/v1/metrics`: List metric definitions with version history [`tenant.can:analytics.view`]
- `POST /api/v1/metrics`: Define custom or standard KPI [`tenant.can:analytics.manage`]
- `GET /api/v1/metrics/{id}`: View metric definition, versions, and historical measurements [`tenant.can:analytics.view`]
- `POST /api/v1/metrics/{id}/versions`: Upgrade metric version with updated formula [`tenant.can:analytics.manage`]
- `GET /api/v1/students/{studentId}/dashboard`: Fast student analytics dashboard (read model query)
- `POST /api/v1/students/{studentId}/dashboard/refresh`: Background / on-demand re-computation [`tenant.can:analytics.manage`]

## 5. Verification Status
- **Status**: `VERIFIED`
- **Gate Test**: `Tests\Feature\AnalyticsAndReportingGateTest::test_analytics_gate` (Phase J §45 Gate)
