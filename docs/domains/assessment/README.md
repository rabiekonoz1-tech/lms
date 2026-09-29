# Assessment Domain

## Overview

The Assessment domain manages student evaluations through assignments and exams, preserving submission timelines, late arrival tracking, attempt lifecycles, grading, and controlled grade publication.

The domain strictly follows platform invariants:
- **`Assessment Ownership belongs to Tenant`**: All assessments, questions, submissions, and grades are strictly tenant-scoped (`connection = 'tenant'`).
- **`Grade Model Independence`**: Grades are modeled independently (`Grade` entity) and support polymorphic references (`gradable_type`, `gradable_id`).
- **`Controlled Grade Publication`**: Grades remain hidden from students until explicitly published by instructors or automated policies.
- **`Duplicate Prevention`**: Students cannot create multiple active attempts or duplicate submissions unless explicitly configured.
- **`Failures Default to Deny`** (SEC-INV-009): Missing permissions default strictly to 403 Forbidden.
- **`Cross-Tenant Isolation`** (SEC-INV-001): Submissions, attempts, and grades from Tenant A are strictly inaccessible to Tenant B.

---

## Domain Model

### Entities & Relationships (Tenant Database)

```mermaid
erDiagram
    COURSES ||--o{ ASSIGNMENTS : "contains"
    LESSONS ||--o{ ASSIGNMENTS : "may_contain"
    ASSIGNMENTS ||--o{ ASSIGNMENT_SUBMISSIONS : "receives"
    STUDENTS ||--o{ ASSIGNMENT_SUBMISSIONS : "submits"
    COURSES ||--o{ EXAMS : "contains"
    EXAMS ||--o{ QUESTIONS : "contains"
    EXAMS ||--o{ EXAM_ATTEMPTS : "receives"
    STUDENTS ||--o{ EXAM_ATTEMPTS : "attempts"
    EXAM_ATTEMPTS ||--o{ EXAM_ANSWERS : "contains"
    QUESTIONS ||--o{ EXAM_ANSWERS : "answered_by"
    STUDENTS ||--o{ GRADES : "earns"

    ASSIGNMENTS {
        uuid id PK
        uuid course_id FK
        uuid lesson_id FK
        string title
        decimal points_possible
        timestamp due_at
        string status
    }

    ASSIGNMENT_SUBMISSIONS {
        uuid id PK
        uuid assignment_id FK
        uuid student_id FK
        text content
        timestamp submitted_at
        boolean is_late
        decimal score
        text feedback
        boolean is_grade_published
        string status
    }

    EXAMS {
        uuid id PK
        uuid course_id FK
        string title
        int duration_minutes
        decimal total_points
        boolean is_published
        boolean is_grades_published
        string status
    }

    QUESTIONS {
        uuid id PK
        uuid exam_id FK
        text question_text
        string question_type
        decimal points
        json options
        string correct_answer
        int sort_order
    }

    EXAM_ATTEMPTS {
        uuid id PK
        uuid exam_id FK
        uuid student_id FK
        timestamp started_at
        timestamp submitted_at
        decimal score
        string status
    }

    EXAM_ANSWERS {
        uuid id PK
        uuid attempt_id FK
        uuid question_id FK
        text answer_text
        boolean is_correct
        decimal awarded_points
    }

    GRADES {
        uuid id PK
        uuid student_id FK
        string gradable_type
        uuid gradable_id
        decimal score
        decimal max_score
        decimal percentage
        boolean is_published
        timestamp graded_at
    }
```

---

## API Endpoints

All endpoints require tenant context (`tenant` middleware) and authentication (`tenant.auth` middleware):

| Method | Endpoint | Description | Permissions Required |
|---|---|---|---|
| `GET` | `/api/v1/courses/{courseId}/assignments` | List assignments | Authenticated user |
| `POST` | `/api/v1/courses/{courseId}/assignments` | Create assignment | `assignments.create` |
| `GET` | `/api/v1/courses/{courseId}/assignments/{id}` | View assignment | Authenticated user |
| `POST` | `/api/v1/courses/{courseId}/assignments/{id}/submit` | Submit assignment | Student profile |
| `POST` | `/api/v1/courses/{courseId}/assignments/{id}/submissions/{subId}/grade` | Grade submission | `assignments.grade` |
| `POST` | `/api/v1/courses/{courseId}/assignments/{id}/publish-grades` | Publish assignment grades | `assignments.grade` |
| `GET` | `/api/v1/courses/{courseId}/exams` | List exams | Authenticated user |
| `POST` | `/api/v1/courses/{courseId}/exams` | Create exam | `exams.create` |
| `POST` | `/api/v1/courses/{courseId}/exams/{id}/questions` | Add question | `exams.create` |
| `POST` | `/api/v1/courses/{courseId}/exams/{id}/start` | Start exam attempt | Student profile |
| `POST` | `/api/v1/courses/{courseId}/exams/{id}/attempts/{attemptId}/answers` | Save question answer | Attempt owner |
| `POST` | `/api/v1/courses/{courseId}/exams/{id}/attempts/{attemptId}/submit` | Submit exam attempt | Attempt owner |
| `POST` | `/api/v1/courses/{courseId}/exams/{id}/attempts/{attemptId}/grade` | Grade attempt | `exams.grade` |
| `POST` | `/api/v1/courses/{courseId}/exams/{id}/publish-grades` | Publish exam grades | `exams.grade` |
| `GET` | `/api/v1/students/{studentId}/grades` | View student grades | Student (self, published) OR `grades.view` |

---

## Verification (Assessment Gate)

The Assessment Gate (`Phase J §30`) is verified in `apps/api/tests/Feature/AssessmentGateTest.php`:
- `[PASS]` Assignment creation with deadline
- `[PASS]` Student assignment submission within deadline (`is_late = false`)
- `[PASS]` Late assignment submission after deadline (`is_late = true`)
- `[PASS]` Duplicate assignment submission blocked (`422 DUPLICATE_SUBMISSION`)
- `[PASS]` Teacher grading of assignment
- `[PASS]` Grade publication control (grades hidden before publication, visible after)
- `[PASS]` Exam creation and question configuration
- `[PASS]` Student exam start (`status: in_progress`)
- `[PASS]` Duplicate exam attempt blocked (`422 DUPLICATE_ATTEMPT`)
- `[PASS]` Student exam answer recording and scoring
- `[PASS]` Student exam submit (`status: submitted`)
- `[PASS]` Teacher grading and publication of exam grades
- `[PASS]` Authorization enforcement (student cannot grade: `403 FORBIDDEN`)
- `[PASS]` Tenant isolation (cross-tenant assignment/exam submission returns 404 / 401)
