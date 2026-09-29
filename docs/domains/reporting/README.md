# Reporting Domain

## 1. Overview
The Reporting Domain provides structured export, compilation, and delivery of academic transcripts, attendance logs, and student performance summaries.
Per Phase J §46–§47 and `MASTER-SPECIFICATION.md`:
- Reports are processed asynchronously or queued to avoid blocking web workers on large datasets.
- Download access is restricted strictly to authorized staff, or to the specific student/parent owner of the data.
- Tenant isolation is strictly enforced.

## 2. Invariants
- `Data Scope Authorization`: Reports must never expose data beyond the explicit authorization boundary of the requesting user.
- `Job Lifecycle Tracking`: Every report generation request produces a `ReportInstance` tracking state (`queued`, `processing`, `completed`, `failed`).
- `Graceful Failure Handling`: Unhandled upstream errors or data source timeouts must update instance status to `failed` with descriptive errors rather than leaving orphaned jobs.
- `Tenant Isolation (SEC-INV-001)`: Report files and records are strictly segregated within tenant storage. Cross-tenant access attempts return 404.

## 3. Data Model
- **`report_definitions`**:
  - `id` (UUID, primary key)
  - `key` (string, unique)
  - `name` (string)
  - `type` (string: `student_transcript`, `attendance_summary`, `academic`, etc.)
  - `supported_formats` (JSON: `json`, `csv`, `pdf`)
- **`report_instances`**:
  - `id` (UUID, primary key)
  - `report_definition_id` (UUID, nullable, FK to `report_definitions`)
  - `title` (string)
  - `requested_by_user_id` (UUID, FK to `tenant_users`)
  - `status` (string: `queued`, `processing`, `completed`, `failed`)
  - `format` (string, default `json`)
  - `parameters` (JSON)
  - `data_payload` (JSON, nullable)
  - `file_path` (string, nullable)
  - `error_message` (text, nullable)
  - `completed_at` (timestamp, nullable)

## 4. Endpoints
- `GET /api/v1/reports`: List requested report instances (filtered by owner unless staff)
- `POST /api/v1/reports`: Request a new report generation job [`tenant.can:reports.generate`]
- `GET /api/v1/reports/{id}`: Inspect report instance status and metadata
- `GET /api/v1/reports/{id}/download`: Download completed report payload (requires `reports.download` or requester ownership)

## 5. Verification Status
- **Status**: `VERIFIED`
- **Gate Test**: `Tests\Feature\AnalyticsAndReportingGateTest::test_reporting_gate` (Phase J §47 Gate)
