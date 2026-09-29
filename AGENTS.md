# AGENTS.md — Global AI Operating Rules

## 1. Source of Truth

Read:

1. `docs/master/MASTER-SPECIFICATION.md`
2. The relevant specialized documentation
3. The relevant ADRs
4. The current project status
5. The current task

Approved documentation is authoritative.

## 2. Before Coding

- Identify the domain owner.
- Identify dependencies.
- Identify tenant scope.
- Identify authentication and authorization requirements.
- Identify API/UI contracts.
- Inspect existing code before creating new files.
- Do not invent undocumented business rules.

## 3. During Coding

- Preserve the approved architecture.
- Keep domain boundaries explicit.
- Keep controllers/pages thin.
- Avoid God Classes, God Components, and giant files.
- Do not trust client-supplied tenant IDs.
- Never bypass backend authorization.
- Keep provider SDKs behind adapters/interfaces.
- Keep Payment, Subscription, Entitlement, Credential, Authentication, and Authorization separate.
- Avoid unnecessary abstractions.
- Do not make unrelated refactors.

## 4. After Coding

- Run the required tests.
- Report what actually ran.
- Update relevant documentation.
- Update project status.
- Update the changelog when appropriate.
- Record known limitations.
- Record Open Decisions.
- Create an ADR when architecture changes.

## 5. Verification

`IMPLEMENTED` means code exists.

`VERIFIED` means required verification passed.

`PRODUCTION_READY` means implementation + verification + security + documentation + observability + release requirements are satisfied.

Never claim a stronger status without evidence.

## 6. Architecture Change Rule

If implementation conflicts with an approved decision:

Problem -> ADR -> Impact Analysis -> Decision -> Documentation Update -> Implementation.

Do not silently redesign the architecture.

## 7. Security Invariants

- No unauthorized cross-tenant access.
- Frontend authorization is not the security boundary.
- Global identity does not imply cross-tenant authorization.
- Credential is not a permanent session.
- Payment is not entitlement.
- Subscription is not authentication.
- Support access is temporary and auditable.
- Secrets never enter logs.
- Failures default to deny.
- Tenant context must exist before tenant data access.

## 8. Documentation Rule

Documentation is part of implementation.

A meaningful code change must produce the corresponding documentation/status change.

## 9. Task Scope

Implement only the current task and its necessary dependencies.

If the task cannot be safely completed without an unresolved architectural decision, stop that change, document the issue, and create an ADR proposal.
