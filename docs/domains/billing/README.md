# Billing & Entitlements Domain

## Overview

The Billing & Entitlements domain manages commercial packages, student payment requests, review/approval workflows, activated subscriptions, and concrete granular entitlements.

This is one of the most critical and sensitive domains on the platform, governed by strict non-negotiable invariants:
- **`Payment ≠ Subscription`**: A payment request is an exchange of monetary proof; a subscription represents a temporal entitlement agreement.
- **`Subscription ≠ Entitlement`**: A subscription grants a bundle of concrete entitlements; access checks evaluate concrete entitlements, not raw subscription rows.
- **`Payment Approval ≠ Authentication`**: Payment approval does not alter authentication identity or credentials.
- **`Never Collapse into Student.is_paid`**: No shortcut flag or column such as `student.is_paid` shall exist or be used as an access control source of truth.
- **`Failures Default to Deny`** (SEC-INV-009): Missing permissions default strictly to 403 Forbidden.
- **`Cross-Tenant Isolation`** (SEC-INV-001): Payment requests, subscriptions, and entitlements from Tenant A are completely isolated from Tenant B.

---

## Domain Model

### Entities & Relationships (Tenant Database)

```mermaid
erDiagram
    PACKAGES ||--o{ PACKAGE_ENTITLEMENTS : "defines"
    STUDENTS ||--o{ PAYMENT_REQUESTS : "submits"
    PACKAGES ||--o{ PAYMENT_REQUESTS : "for"
    PAYMENT_REQUESTS ||--o{ PAYMENT_REVIEW_LOGS : "audited_by"
    PAYMENT_REQUESTS ||--o| SUBSCRIPTIONS : "activates"
    STUDENTS ||--o{ SUBSCRIPTIONS : "holds"
    PACKAGES ||--o{ SUBSCRIPTIONS : "bound_to"
    SUBSCRIPTIONS ||--o{ ENTITLEMENTS : "grants"
    STUDENTS ||--o{ ENTITLEMENTS : "receives"

    PACKAGES {
        uuid id PK
        string name
        string code
        decimal price
        string currency
        string billing_cycle "monthly, term, yearly"
        string status "active, archived"
        json features
    }

    PACKAGE_ENTITLEMENTS {
        uuid id PK
        uuid package_id FK
        string entitlement_key "ONLINE_ACCESS, EXAM_ACCESS, LIVE_SESSIONS"
        string value
    }

    PAYMENT_REQUESTS {
        uuid id PK
        uuid student_id FK
        uuid package_id FK
        decimal amount
        string currency
        string payment_method "instapay, cash, bank_transfer"
        string sender_phone
        string reference_code
        string proof_url
        string status "pending, approved, rejected, cancelled"
        text rejection_reason
        uuid reviewed_by_user_id FK
        timestamp reviewed_at
        timestamp submitted_at
    }

    PAYMENT_REVIEW_LOGS {
        uuid id PK
        uuid payment_request_id FK
        uuid reviewed_by_user_id FK
        string action "approved, rejected"
        text reason
        timestamp logged_at
    }

    SUBSCRIPTIONS {
        uuid id PK
        uuid student_id FK
        uuid package_id FK
        uuid payment_request_id FK
        string status "pending, active, expired, cancelled"
        timestamp starts_at
        timestamp ends_at
    }

    ENTITLEMENTS {
        uuid id PK
        uuid student_id FK
        uuid subscription_id FK
        string entitlement_key
        boolean is_active
        timestamp expires_at
    }
```

---

## API Endpoints

All endpoints require tenant context (`tenant` middleware) and authentication (`tenant.auth` middleware):

| Method | Endpoint | Description | Permissions Required |
|---|---|---|---|
| `GET` | `/api/v1/packages` | List available packages | Authenticated user |
| `POST` | `/api/v1/packages` | Create a commercial package | `packages.create` |
| `GET` | `/api/v1/packages/{id}` | View package details | Authenticated user |
| `GET` | `/api/v1/payment-requests` | List payment requests | `payments.view` (or self for students) |
| `POST` | `/api/v1/payment-requests` | Submit payment request | Student profile |
| `GET` | `/api/v1/payment-requests/{id}` | View payment request & audit logs | `payments.view` (or self for student owner) |
| `POST` | `/api/v1/payment-requests/{id}/approve` | Approve payment, activate subscription, grant entitlements | `payments.approve` |
| `POST` | `/api/v1/payment-requests/{id}/reject` | Reject payment request with reason | `payments.reject` |
| `GET` | `/api/v1/students/{studentId}/subscriptions` | View student subscriptions | Student self OR `subscriptions.view` |
| `GET` | `/api/v1/students/{studentId}/entitlements` | View student active entitlements | Student self OR `entitlements.view` |

---

## Verification (Billing Gate)

The Billing Gate (`Phase J §33`) is verified in `apps/api/tests/Feature/BillingGateTest.php`:
- `[PASS]` Package creation with granular entitlement keys
- `[PASS]` Student payment request submission (`status: pending`)
- `[PASS]` Verification that student has NO active entitlements prior to approval
- `[PASS]` Payment review list retrieval
- `[PASS]` Wrong reviewer check (staff without `payments.approve` denied with `403 FORBIDDEN`)
- `[PASS]` Payment request approval by authorized billing administrator
- `[PASS]` Subscription activation (`Payment ≠ Subscription`)
- `[PASS]` Entitlement grant (`Subscription ≠ Entitlement`, `hasEntitlement()` returns true)
- `[PASS]` Verification that NO `student.is_paid` shortcut exists
- `[PASS]` Audit log recorded in `payment_review_logs`
- `[PASS]` Duplicate approval prevention (`422 ALREADY_PROCESSED`)
- `[PASS]` Payment request rejection workflow with reason logged
- `[PASS]` Cross-tenant isolation (payment request queries and approvals across tenants return 404 / 401)
