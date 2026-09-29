# Identity, Authentication & Authorization Domain

## 1. Architectural Overview & Purpose

The **Identity Domain** models users, actors, and authentication across both the Control Plane and individual Tenant Data Planes.

```text
                  Control Plane (GlobalStudentIdentity)
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
     Tenant A Account            Tenant B Account
   (Student STU-MATH-001)      (Student STU-PHYS-999)
```

---

## 2. Invariants & Security Rules

| Rule ID | Invariant | Description & Enforcement |
|---|---|---|
| **SEC-INV-006** | `Global Identity ≠ Tenant Authorization` | Having a global student identity in Tenant A confers zero automatic authorization to Tenant B. |
| **DOM-INV-001** | `User ≠ Student` | `TenantUser` represents the authenticatable security principal; `Student` represents the tenant-owned educational profile. |
| **DOM-INV-002** | `Teacher ≠ Role` | `Staff` represents the employment entity; `Role` represents the RBAC permission assignment. |
| **DOM-INV-003** | `Parent ≠ Student` | Parent accounts are tenant-scoped and linked explicitly via `student_parent` relation mappings. |
| **SEC-INV-009** | Default Deny | Unassigned actions or unauthenticated actors default to deny (`401 UNAUTHENTICATED` or `403 FORBIDDEN`). |
| **SEC-INV-008** | Secrets never in logs | Token secrets are hashed using SHA-256 before persistence and never logged in plain text. |

---

## 3. Data Model

### Control Plane
- **`GlobalIdentity`**: Global student identity mapping across tenants (`id`, `phone`, `email`, `name`, `status`).
- **`StudentIdentityLink`**: Maps a `global_identity_id` to a `(tenant_id, tenant_student_id)` tuple.

### Tenant Data Plane (Database-per-Tenant)
- **`TenantUser`**: Authenticatable security actor (`id`, `name`, `email`, `phone`, `password`, `type`, `status`).
- **`Student`**: Educational profile (`id`, `user_id`, `global_identity_id`, `student_code`, `status`).
- **`Staff`**: Teacher / assistant profile (`id`, `user_id`, `staff_type`, `status`).
- **`ParentProfile`**: Tenant parent account (`id`, `user_id`, `status`).
- **`StudentParent`**: Pivot table connecting parents to children with relationship metadata (`father`, `mother`, `guardian`).
- **`Role`**: RBAC role definition (`name`, `label`, `is_system`, `description`).
- **`Permission`**: Granular permission key (`name`, `module`, `description`).
- **`TenantToken`**: Hashed bearer token records (`token`, `user_id`, `expires_at`, `last_used_at`).

---

## 4. Authentication & Authorization Lifecycle

1. **Authentication (`POST /api/v1/auth/login`)**:
   - Requires tenant context resolution (`X-Tenant-Slug` or host).
   - Validates user credentials against active tenant database.
   - Emits a hashed bearer token (`TenantToken`).
2. **Identity Verification (`GET /api/v1/auth/me`)**:
   - `TenantAuthenticate` middleware resolves user from token.
   - Returns user envelope including role and permission sets.
3. **Authorization Evaluation (`TenantAuthorize` middleware / `tenant.can:<permission>`)**:
   - Evaluates `$user->hasPermissionTo($permission)` based on assigned roles and policies.
   - Enforces default deny on unpermitted actions.
4. **Session Termination (`POST /api/v1/auth/logout`)**:
   - Revokes bearer token.

---

## 5. Verified Gates

- **Identity Gate (`IdentityGateTest.php`)**: Proven that global identity maps across tenants while maintaining tenant-isolated student codes, accounts, and authorizations.
- **Authentication Gate (`AuthenticationGateTest.php`)**: Proven that login succeeds, invalid credentials fail (401), cross-tenant login is rejected (401), and logout revokes tokens.
- **Authorization Gate (`AuthorizationGateTest.php`)**: Proven that teachers with `courses.create` succeed, while assistants/students lacking the permission receive `403 FORBIDDEN`.
