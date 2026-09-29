أيوه، وفي نقطة مهمة: **Phase I مش الأخيرة**.

بعد Phase I، ما زال الأفضل أن نعمل **Phase J** كـ **Implementation & Delivery Master Plan**، وبعدها **Phase K** كـ **Final Master Specification / AI Handoff** تجمع كل المراحل في مرجع واحد جاهز للتسليم لأي AI Agent. يعني إحنا قربنا جدًا من نهاية مرحلة الـdocumentation، لكن مش خلصنا بالكامل.

وده **Phase I**:

:::writing{variant="document" id="52847" title="Phase I — DevOps, CI/CD, Infrastructure & Deployment Architecture"}
# PHASE I — DEVOPS, CI/CD, INFRASTRUCTURE & DEPLOYMENT ARCHITECTURE

**Project:** Multi-Tenant SaaS LMS & Education Management Platform  
**Architecture Baseline:** Phases A–H Approved  
**Current Phase:** I  
**Status:** Draft — Pending Approval  
**Implementation Status:** Specification Only — No Implementation  

**Backend:** Laravel  
**Frontend:** Next.js + React + TypeScript  
**Database:** PostgreSQL  
**Architecture:** Modular Monolith  
**Tenant Model:** Control Database + Tenant Database per Tenant  
**Deployment Model:** Containerized / Cloud-Ready  
**Primary Runtime:** Web + API + Background Workers  
**Target:** Production-Grade SaaS

---

# 1. Purpose

Phase I defines the infrastructure and operational foundation required to run the platform reliably in:

```text
Development
Staging
Production
```

It defines:

- source control
- repository structure
- branching
- CI/CD
- build pipeline
- environments
- containers
- networking
- databases
- tenant provisioning
- queues
- cache
- storage
- secrets
- backups
- observability
- deployment
- migrations
- rollback
- disaster recovery
- scaling
- infrastructure-as-code
- operational security

This phase does not implement infrastructure.

It defines the target architecture that implementation must follow.

---

# 2. Infrastructure Principles

## INF-PR-001 — Infrastructure Must Support the Architecture

Infrastructure must respect:

```text
Modular Monolith
Control Plane
Tenant Data Plane
Database-per-Tenant
Provider Abstraction
Async Processing
Horizontal Scaling
```

## INF-PR-002 — Stateless Application

Application nodes should be stateless wherever practical.

Do not depend on local application-node state for correctness.

## INF-PR-003 — Infrastructure Is Replaceable

The architecture should minimize business-code dependency on:

```text
specific cloud provider
specific database host
specific cache host
specific storage vendor
specific email provider
```

## INF-PR-004 — Security by Default

Production infrastructure must follow least privilege and deny-by-default principles.

## INF-PR-005 — Automation First

Repeatable operations should be automated rather than performed manually.

---

# 3. Repository Strategy

Recommended repository model:

```text
One primary monorepo
```

Conceptually:

```text
/
├── apps/
│   ├── api/
│   └── web/
│
├── packages/
│   ├── shared-types/
│   ├── api-contract/
│   └── shared-config/
│
├── infrastructure/
├── docs/
├── scripts/
└── tests/
```

The exact monorepo structure remains an implementation decision.

The architecture must avoid unnecessary repository fragmentation.

---

# 4. Repository Responsibilities

The repository must contain or reference:

```text
Application Source
Infrastructure Definitions
Database Migration Definitions
API Contracts
Tests
Documentation
CI/CD Configuration
Operational Scripts
Architecture Decisions
```

Production secrets must never be committed.

---

# 5. Branching Strategy

The project should adopt a controlled branching model.

Conceptually:

```text
main
  ↓
release / deployment
```

Development work may use:

```text
feature/*
fix/*
security/*
refactor/*
```

The exact branching strategy remains an Open Decision.

The important rule is:

```text
Production
← controlled merge
← verified change
```

not direct uncontrolled modification.

---

# 6. Pull Request Requirements

Significant changes should pass through code review.

A PR should contain:

```text
Description
Requirement / Issue
Architecture impact
Security impact
Tests
Migration impact
API impact
Documentation impact
```

AI-generated changes follow the same process.

---

# 7. Commit Strategy

Commits should be:

```text
small enough to understand
logically cohesive
reversible where practical
```

Avoid massive commits containing unrelated features.

---

# 8. Environment Architecture

The initial environment model:

```text
LOCAL
   ↓
DEVELOPMENT
   ↓
STAGING
   ↓
PRODUCTION
```

Potential:

```text
PERFORMANCE
SECURITY
EPHEMERAL
```

environments may be added as needed.

---

# 9. Environment Isolation

Each environment should isolate:

```text
database
cache
queues
storage
secrets
external providers
domains
monitoring
```

Development must never accidentally point to production resources.

---

# 10. Environment Configuration

Configuration categories:

```text
Application
Database
Cache
Queue
Storage
Authentication
Email
External Providers
Observability
Feature Flags
Tenant Provisioning
```

must be centrally defined.

Avoid environment-specific values scattered throughout source code.

---

# 11. Secrets Management

Secrets must not be stored in:

```text
source code
Git
Docker images
frontend bundle
logs
public configuration
```

Potential secret types:

```text
database credentials
API keys
provider secrets
OAuth credentials
signing keys
encryption keys
SMTP credentials
```

must use an appropriate secret-management mechanism.

Exact provider remains an Open Decision.

---

# 12. Secret Rotation

The architecture must support secret rotation.

At minimum:

```text
provider credentials
database credentials
application secrets
signing keys where applicable
```

Rotation must not require rewriting business logic.

---

# 13. Containerization

The application should be container-ready.

Conceptual runtime units:

```text
Web / Next.js
API / Laravel
Queue Worker
Scheduler
Database
Cache
Object Storage / external storage
Reverse Proxy / Gateway
```

Not every unit must initially be deployed independently.

---

# 14. Container Principle

Containers should be:

```text
immutable
versioned
reproducible
minimal
non-secret-bearing
```

Application images should be built once and promoted between environments where practical.

---

# 15. Container Image Versioning

Production deployments should identify exactly which image/version is running.

Example:

```text
application:
release-2026.09.28
```

or immutable digest.

The exact tagging strategy is an Open Decision.

---

# 16. Frontend Deployment

Next.js deployment must support the product's requirements for:

```text
SSR / rendering
static assets
runtime configuration
tenant branding
API communication
PWA assets
```

The final hosting architecture depends on the selected infrastructure platform.

---

# 17. Backend Deployment

Laravel runtime requires support for:

```text
HTTP application
queue workers
scheduled tasks
migrations
```

These processes must be independently manageable.

---

# 18. Process Separation

Do not treat:

```text
HTTP
Queue
Scheduler
```

as one inseparable runtime concern.

Conceptually:

```text
API Workers
Queue Workers
Scheduler
```

may scale independently.

---

# 19. Reverse Proxy / Gateway

A controlled ingress layer should provide where appropriate:

```text
TLS termination
routing
rate limiting
request size controls
security headers
health routing
```

It must not become a replacement for application authorization.

---

# 20. TLS

Production traffic must use TLS.

The architecture should enforce:

```text
HTTPS
secure cookies where used
HSTS where appropriate
```

HTTP-to-HTTPS behavior must be explicit.

---

# 21. Domain Architecture

The platform has at least:

```text
Platform Domain
Tenant Domains / Subdomains
```

Example:

```text
platform.example.com

teacher-a.example.com
center-b.example.com
```

Custom domains may be added later.

---

# 22. Tenant Domain Resolution

Conceptual:

```text
Request
   ↓
Domain Resolver
   ↓
Tenant Registry
   ↓
Trusted Tenant Context
   ↓
Application
```

Domain resolution must not directly become authorization.

The server must resolve the tenant from trusted infrastructure/registry data.

---

# 23. Tenant Provisioning

Tenant creation flow:

```text
Create Tenant
      ↓
Create Tenant Registry Record
      ↓
Allocate Tenant Database
      ↓
Initialize Schema
      ↓
Run Tenant Migrations
      ↓
Create Initial Tenant Configuration
      ↓
Create Tenant Branding
      ↓
Create Initial Tenant Admin/Owner
      ↓
Validate Tenant
      ↓
Mark Tenant READY
```

---

# 24. Tenant Provisioning State

Recommended states:

```text
PROVISIONING
INITIALIZING
MIGRATING
READY
SUSPENDED
FAILED
DECOMMISSIONING
DECOMMISSIONED
```

The final lifecycle belongs to the Tenancy domain.

---

# 25. Tenant Provisioning Idempotency

Repeated provisioning requests must not produce:

```text
duplicate tenant databases
duplicate tenant registry entries
duplicate initial administrators
```

Provisioning operations should be idempotent/recoverable.

---

# 26. Tenant Database Allocation

Business logic must never determine:

```text
database hostname
database password
database server
```

directly.

Instead:

```text
Tenant ID
   ↓
Tenant Registry
   ↓
Database Allocation
   ↓
Infrastructure Adapter
```

---

# 27. Tenant Database Scaling

Tenant infrastructure should evolve according to size.

Conceptual:

```text
Small
→ shared infrastructure

Growing
→ dedicated database

Large
→ isolated database server / cluster

Very Large
→ dedicated infrastructure
```

The exact thresholds are operational decisions.

---

# 28. Control Database

Control DB infrastructure must prioritize:

```text
availability
consistency
backup
low latency
```

because it contains the tenant registry and global identity/mapping data.

---

# 29. Tenant Database Infrastructure

Each tenant database must support:

```text
migration versioning
backup
monitoring
connection management
health checks
recovery
```

---

# 30. Database Connection Strategy

Applications should use a connection abstraction such as:

```text
TenantContext
        ↓
Tenant Database Resolver
        ↓
Database Connection
```

rather than:

```text
client input
   ↓
database connection
```

---

# 31. Connection Pooling

Database connections are limited infrastructure resources.

The deployment architecture must account for:

```text
API workers
queue workers
admin operations
reporting
migrations
```

to avoid exhausting database capacity.

---

# 32. Migration Architecture

Migrations are part of deployment.

Required conceptual flow:

```text
Release
 ↓
Pre-migration validation
 ↓
Migration execution
 ↓
Application compatibility check
 ↓
Release verification
```

Tenant databases require coordinated migration orchestration.

---

# 33. Tenant Migration Orchestration

For a release:

```text
Read Tenant Registry
       ↓
Identify target tenant DBs
       ↓
Apply approved migration
       ↓
Record migration status
       ↓
Continue / retry failed tenant
```

One failed tenant migration should not silently mark all tenant databases successful.

---

# 34. Migration Failure Handling

The system must distinguish:

```text
migrated
failed
pending
retryable
blocked
```

Migration execution must be observable.

---

# 35. Zero-Downtime Migration Principle

Where production availability requires it, migrations should be designed for compatibility with both:

```text
current application
new application
```

during rolling deployment.

---

# 36. Destructive Migrations

Destructive changes require special handling.

Prefer:

```text
expand
→ migrate data
→ switch application
→ verify
→ contract
```

rather than immediate destructive modification.

---

# 37. Cache Architecture

A cache system may be used for:

```text
frequently accessed configuration
sessions where applicable
read-heavy reference data
dashboard optimization
rate limiting
temporary computed data
```

Cache is not the source of truth for critical business state.

---

# 38. Cache Isolation

Keys must be namespaced by:

```text
tenant
user
resource
version
```

where applicable.

Example:

```text
tenant:{tenant_id}:dashboard:{user_id}
```

---

# 39. Cache Failure

If cache becomes unavailable:

```text
core transactions should remain correct
```

where the cache is non-essential.

The application should degrade appropriately.

---

# 40. Queue Architecture

Background processing should use queues for workloads such as:

```text
notifications
reports
analytics
imports
external integrations
large exports
media processing
```

---

# 41. Queue Classes

The architecture may define different queues for:

```text
critical
normal
heavy
integration
analytics
notifications
```

to prevent low-priority workloads from blocking critical operations.

---

# 42. Queue Priority

Critical operations should receive appropriate priority.

Example:

```text
exam submission finalization
```

must not be delayed behind:

```text
large historical analytics rebuild
```

merely because both use the same generic queue.

---

# 43. Queue Retry Strategy

Jobs should define:

```text
attempt limit
backoff
retryable conditions
non-retryable conditions
dead-letter behavior
idempotency
```

---

# 44. Failed Jobs

Failed jobs must be observable.

A failed job should not disappear silently.

Operational visibility should include:

```text
job
tenant
attempts
last error
time
next retry
final failure
```

without exposing secrets.

---

# 45. Scheduler Architecture

Scheduled jobs may handle:

```text
credential expiration
subscription lifecycle processing
notifications
report scheduling
cleanup
analytics aggregation
maintenance
```

The scheduler itself must be protected against duplicate execution.

---

# 46. Scheduled Job Idempotency

Scheduled tasks must be safe if accidentally triggered more than once.

---

# 47. Object/File Storage

Files should be stored outside the relational database by default.

Examples:

```text
payment proofs
report exports
course files
safe uploaded assets
```

---

# 48. Tenant Storage Isolation

Storage must use tenant-aware namespaces.

Conceptual:

```text
tenant/{tenant_id}/payments/...
tenant/{tenant_id}/reports/...
tenant/{tenant_id}/courses/...
```

The exact physical path should remain infrastructure-controlled.

---

# 49. File Access

Private files should use controlled access.

Possible model:

```text
authorized API request
        ↓
permission check
        ↓
short-lived signed access
```

where appropriate.

---

# 50. File Lifecycle

Files should support:

```text
created
active
archived
deleted
```

where applicable.

Historical/payment evidence may require retention policies.

---

# 51. CDN

A CDN may be used for:

```text
public static assets
images
safe cacheable resources
```

Private tenant/user data must not become publicly cacheable accidentally.

---

# 52. Video CDN / Provider

The LMS should not assume that internal infrastructure serves all video content.

Video remains provider-driven:

```text
VideoProvider
   ↓
Google Drive / Vimeo / future provider
```

The platform remains the authorization/control layer.

---

# 53. Email Infrastructure

Email should use an abstraction:

```text
EmailProvider
```

The application should not be tightly coupled to one SMTP/vendor implementation.

---

# 54. WhatsApp Infrastructure

WhatsApp remains a future integration.

When implemented, it should use the same provider abstraction principles.

---

# 55. External Integration Network Rules

Outbound connections should follow:

```text
timeout
TLS
credential protection
rate limits
retry
idempotency
logging without secrets
```

---

# 56. Observability Architecture

The system should have three major observability categories:

```text
Logs
Metrics
Traces
```

plus:

```text
Audit
```

as a separate business/security record.

---

# 57. Logging

Application logs should include appropriate metadata:

```text
timestamp
severity
service
environment
request_id
tenant_id where safe
actor_id where safe
event
duration
error code
```

Logs must never contain secrets.

---

# 58. Structured Logging

Logs should preferably be machine-readable structured records.

Avoid relying only on unstructured strings.

---

# 59. Metrics

Important metrics include:

```text
request rate
error rate
latency
database connections
queue depth
job failures
cache performance
storage consumption
tenant usage
provider failures
authentication failures
```

---

# 60. Tenant Usage Metrics

The platform should track aggregate tenant usage such as:

```text
active users
students
storage consumption
video events
API usage
notifications
reports
```

according to the approved privacy model.

---

# 61. Distributed Tracing

Tracing may connect:

```text
HTTP request
→ application use case
→ DB
→ queue
→ provider
```

where technically supported.

Tracing must not expose sensitive values.

---

# 62. Correlation ID

A correlation/request ID should follow:

```text
HTTP
 ↓
Application
 ↓
Queue
 ↓
Integration
```

where applicable.

---

# 63. Monitoring

Monitoring must cover at least:

```text
application health
database health
queue health
storage
external providers
tenant provisioning
backup jobs
migration status
```

---

# 64. Alerting

Potential alerts:

```text
high API error rate
database saturation
queue backlog
provider failure
backup failure
tenant provisioning failure
high authentication abuse
storage threshold
migration failure
certificate expiry
```

Exact thresholds are Open Decisions.

---

# 65. Health Endpoints

Separate health concepts:

```text
Liveness
Readiness
Dependency Health
```

A liveness failure does not necessarily mean a dependency failure.

---

# 66. Deployment Architecture

Preferred deployment flow:

```text
Developer
   ↓
Git
   ↓
CI
   ↓
Build
   ↓
Test
   ↓
Security
   ↓
Artifact
   ↓
Staging
   ↓
Verification
   ↓
Production
```

---

# 67. Continuous Integration

CI should execute applicable gates:

```text
format
lint
type check
static analysis
unit tests
integration tests
contract tests
security checks
build
```

---

# 68. Continuous Delivery

CD should handle:

```text
artifact promotion
environment configuration
database migrations
deployment
health checks
smoke tests
rollback
```

---

# 69. Deployment Strategies

Possible strategies:

```text
rolling
blue/green
canary
```

The initial strategy is an Open Decision.

The architecture must support controlled release.

---

# 70. Release Artifact

A release must be traceable to:

```text
Git commit
build
artifact/image
migration version
configuration version
```

---

# 71. Release Metadata

Every production deployment should identify:

```text
version
commit
deployment time
environment
operator/automation source
migration state
```

---

# 72. Rollout Validation

After deployment:

```text
health checks
API smoke tests
frontend smoke tests
queue checks
database checks
critical workflow checks
```

should run.

---

# 73. Automatic Rollback

Automatic rollback may be used where safe.

Potential triggers:

```text
health failure
severe error-rate increase
failed migration precondition
application startup failure
```

Not all database changes can safely be automatically rolled back.

---

# 74. Database Rollback Principle

Application rollback and database rollback are different.

Never assume:

```text
application rollback
=
database rollback
```

Database changes require explicit compatibility/recovery strategy.

---

# 75. Disaster Recovery

Disaster recovery must address:

```text
control database
tenant databases
file storage
configuration
secrets
application artifacts
```

---

# 76. Backup Strategy

Backups should cover:

```text
Control DB
Tenant DBs
Critical file metadata/data
Configuration
```

where appropriate.

---

# 77. Backup Layers

Potential:

```text
database snapshots
point-in-time recovery
object-storage versioning
off-system backup
```

Exact mechanism depends on infrastructure provider.

---

# 78. Backup Monitoring

A backup is not trusted solely because a job reports success.

The platform should monitor:

```text
last successful backup
backup age
backup size anomaly
failure
restore test status
```

---

# 79. Restore Testing

Periodic restore tests must verify:

```text
database recovery
schema
critical records
tenant mapping
application connectivity
```

---

# 80. Tenant-Level Restore

The architecture should support restoring a single tenant database where technically feasible.

This is a major advantage of the database-per-tenant architecture and should be preserved.

---

# 81. Recovery Objectives

The final infrastructure plan must establish:

```text
RPO
RTO
```

for:

```text
Control Plane
Tenant Data Plane
```

These remain Open Decisions.

---

# 82. Scaling Architecture

The application tier should scale horizontally:

```text
API instance 1
API instance 2
API instance 3
...
```

without requiring tenant-specific application code.

---

# 83. Worker Scaling

Workers should scale independently according to workload:

```text
critical jobs
normal jobs
analytics
notifications
```

where the queue design justifies it.

---

# 84. Database Scaling

The architecture should support:

```text
tenant distribution
read replicas where justified
dedicated tenant DBs
database server migration
```

without rewriting domain logic.

---

# 85. No Premature Sharding

The architecture does not require generic sharding in Phase I.

Database-per-tenant already provides:

```text
distribution
isolation
migration flexibility
tenant-level recovery
```

Sharding can be introduced later only when justified.

---

# 86. Large Tenant Migration

Moving a large tenant from shared to dedicated infrastructure should conceptually be:

```text
Provision Target
      ↓
Replicate / Copy
      ↓
Validate
      ↓
Cutover
      ↓
Verify
      ↓
Retire Source
```

The business application must see this as infrastructure evolution, not a different domain model.

---

# 87. Zero-Downtime Tenant Migration

Where required, large tenant migration should minimize:

```text
downtime
data loss
request failures
```

Exact mechanism is a future operational design.

---

# 88. Infrastructure as Code

Infrastructure should be defined as code where practical.

Potential:

```text
network
databases
storage
queues
compute
DNS
monitoring
secrets references
```

must be reproducible.

Exact IaC tool remains an Open Decision.

---

# 89. Infrastructure Versioning

Infrastructure definitions must be version controlled.

Infrastructure changes must go through the same review discipline as application changes.

---

# 90. Environment Provisioning

A new environment should be reproducible from configuration and infrastructure code.

Avoid "snowflake" servers manually configured differently over time.

---

# 91. Production Access

Production access must be:

```text
least privilege
auditable
restricted
strongly authenticated
```

High-privilege operations should require stronger controls.

---

# 92. Break-Glass Access

Emergency administrative access may exist under a controlled process.

It must be:

```text
temporary
audited
justified
revoked after use
```

---

# 93. SSH / Direct Server Access

Direct access should be minimized.

Application administration should preferably happen through:

```text
deployment pipeline
managed operational interfaces
controlled admin tooling
```

rather than manual server edits.

---

# 94. Production Data Access

Production data access must follow:

```text
authorization
least privilege
purpose limitation
audit
```

Support sessions remain subject to Phase E rules.

---

# 95. Tenant Privacy Infrastructure

Infrastructure must preserve the tenant boundary across:

```text
database
cache
storage
queues
logs
analytics
backups
exports
```

---

# 96. Queue Tenant Boundary

Every tenant-aware background operation must carry/resolve trusted tenant context.

Workers must never infer tenant from untrusted arbitrary job fields without registry validation.

---

# 97. Cache Tenant Boundary

Cache namespace must prevent collisions:

```text
Tenant A
≠
Tenant B
```

---

# 98. Storage Tenant Boundary

Private storage paths and authorization must enforce:

```text
Tenant A
≠
Tenant B
```

---

# 99. Logging Tenant Boundary

Tenant IDs may be included for tracing where safe.

But logs must not become an uncontrolled store of tenant-private content.

---

# 100. Disaster Scenario — Control Plane Failure

The system must define behavior if:

```text
Control DB unavailable
```

Potential result:

```text
tenant resolution unavailable
new tenant provisioning unavailable
some administrative functions unavailable
```

The exact graceful-degradation behavior must be explicitly defined.

---

# 101. Disaster Scenario — Single Tenant DB Failure

The architecture should isolate the impact.

Expected principle:

```text
Tenant A DB failure
```

should not automatically cause:

```text
all tenant databases
```

to fail.

---

# 102. Disaster Scenario — External Provider Failure

External provider outage must not corrupt core data.

Examples:

```text
Google Meet unavailable
Email unavailable
Video provider unavailable
WhatsApp unavailable
```

---

# 103. Disaster Scenario — Queue Failure

Core transactional operations should remain correct where queues are non-critical.

Queued work should be recoverable.

---

# 104. Deployment Security

CI/CD credentials must follow least privilege.

Production deployment permissions should be restricted.

Pipeline logs must not expose secrets.

---

# 105. Supply Chain Security

Build pipeline should eventually verify:

```text
dependencies
packages
containers
build artifacts
```

against the project's security policy.

---

# 106. Artifact Integrity

Production should deploy only approved artifacts.

The runtime should not depend on random package installation at deployment time.

---

# 107. Dependency Pinning

Important production dependencies should be version-controlled/pinned according to project policy.

---

# 108. Time Synchronization

Distributed systems depend on consistent time behavior.

Infrastructure should provide reliable system time synchronization.

This is particularly important for:

```text
sessions
credentials
exam timing
webhooks
audit
support expiration
```

---

# 109. DNS / Domain Management

DNS changes should be versioned/documented where possible.

Tenant domain onboarding must include:

```text
verification
ownership control
TLS
tenant mapping
```

---

# 110. Custom Domain Support

Custom domains are future-capable but not required for the first implementation.

Architecture must avoid making them impossible later.

---

# 111. PWA Infrastructure

Production hosting must serve:

```text
manifest
icons
service worker
static assets
```

with correct cache/update semantics.

---

# 112. Static Asset Caching

Static assets should use immutable/versioned URLs where practical.

This prevents old assets from remaining indefinitely after deployment.

---

# 113. Deployment and PWA Compatibility

A frontend release must consider:

```text
new frontend
old API
old service worker
cached assets
```

during rolling deployment.

---

# 114. Database and Queue Compatibility

Deployment must consider queued jobs from a previous release.

Queue payloads should remain compatible during supported rolling-release windows.

---

# 115. Scheduler Duplication

If multiple application instances run the scheduler, only one logical execution of a scheduled task should occur when required.

---

# 116. Operational Runbooks

The project should eventually maintain runbooks for:

```text
deployment
rollback
tenant provisioning
tenant migration
database failure
queue failure
provider failure
backup restore
credential incident
security incident
support access
```

---

# 117. Incident Response

Infrastructure incidents should follow:

```text
Detect
→ Classify
→ Contain
→ Investigate
→ Recover
→ Verify
→ Document
→ Improve
```

This inherits Phase E's resilience model.

---

# 118. Maintenance Windows

Operations that may affect availability should have:

```text
planned window
impact assessment
rollback/recovery strategy
verification
```

---

# 119. Capacity Planning

The platform must monitor:

```text
tenants
students
concurrent users
requests/sec
database connections
storage
queue depth
video events
notification volume
reporting volume
```

Capacity planning must use real observed patterns over time.

---

# 120. Scaling Trigger Concept

Scaling decisions may use signals such as:

```text
CPU
memory
request latency
concurrency
queue depth
DB connections
storage
```

The exact thresholds remain Open Decisions.

---

# 121. Cost Awareness

Infrastructure architecture should track cost drivers:

```text
compute
database
storage
bandwidth
video
email
WhatsApp
observability
backups
```

Large tenants should be measurable separately.

---

# 122. Tenant Consumption

Platform administration should expose aggregate consumption sufficient for:

```text
capacity planning
cost awareness
tenant usage
resource allocation
```

without exposing private tenant content unnecessarily.

---

# 123. Infrastructure Security Invariants

```text
INF-SEC-INV-001
Production secrets are never committed to source control.

INF-SEC-INV-002
Tenant databases are resolved through trusted tenant context.

INF-SEC-INV-003
Tenant A infrastructure cannot be accessed by Tenant B through application identifiers alone.

INF-SEC-INV-004
Private tenant storage is not publicly accessible.

INF-SEC-INV-005
Queue workers preserve tenant boundaries.

INF-SEC-INV-006
Cache keys cannot collide across tenants.

INF-SEC-INV-007
Production access is least-privilege and auditable.

INF-SEC-INV-008
Infrastructure logs do not contain secrets.

INF-SEC-INV-009
Backups are protected like production data.

INF-SEC-INV-010
External provider failure cannot corrupt core transactional state.
```

---

# 124. Infrastructure Scalability Invariants

```text
INF-SCALE-INV-001
Application instances can scale horizontally.

INF-SCALE-INV-002
Workers can scale independently.

INF-SCALE-INV-003
Large tenants can move to dedicated infrastructure.

INF-SCALE-INV-004
Business logic is independent of physical tenant DB location.

INF-SCALE-INV-005
Analytics/reporting workloads cannot monopolize transactional infrastructure.

INF-SCALE-INV-006
A single tenant failure should have bounded blast radius.
```

---

# 125. Infrastructure Acceptance Criteria

## I-AC-001

Application can be built reproducibly.

## I-AC-002

Environments are isolated.

## I-AC-003

Secrets are externally managed.

## I-AC-004

Production deployment is automated and traceable.

## I-AC-005

Tenant databases can be provisioned through controlled automation.

## I-AC-006

Tenant migration can evolve from shared to dedicated infrastructure.

## I-AC-007

Queues are independently scalable.

## I-AC-008

Cache and storage are tenant-isolated.

## I-AC-009

Backups and restore procedures are defined.

## I-AC-010

Monitoring and alerting cover critical infrastructure.

## I-AC-011

Deployment supports rollback/recovery planning.

## I-AC-012

Database migrations are version-controlled.

## I-AC-013

Infrastructure is reproducible through code.

## I-AC-014

Production access is controlled and audited.

## I-AC-015

PWA/static assets are compatible with controlled deployments.

## I-AC-016

Critical infrastructure failures have defined behavior.

---

# 126. Open Decisions

### I-OD-001
Cloud provider.

### I-OD-002
Compute/orchestration platform.

### I-OD-003
Container orchestration level.

### I-OD-004
Managed PostgreSQL provider/architecture.

### I-OD-005
Cache provider.

### I-OD-006
Object storage provider.

### I-OD-007
CDN provider.

### I-OD-008
Infrastructure-as-Code tool.

### I-OD-009
CI/CD platform.

### I-OD-010
Secret-management platform.

### I-OD-011
Logging/observability stack.

### I-OD-012
Tracing platform.

### I-OD-013
Deployment strategy:

```text
rolling
blue/green
canary
```

### I-OD-014
Exact tenant-size thresholds for infrastructure isolation.

### I-OD-015
Exact RPO/RTO.

### I-OD-016
Exact backup retention.

### I-OD-017
Exact browser/PWA hosting model.

### I-OD-018
Custom-domain architecture.

---

# 127. Explicit Non-Goals

Phase I does not implement:

```text
Dockerfiles
Terraform
Kubernetes
CI scripts
Cloud resources
DNS records
Production credentials
Monitoring dashboards
Backup jobs
Deployment scripts
```

Those belong to the implementation/delivery phase.

---

# 128. Infrastructure Documentation

Recommended structure:

```text
docs/infrastructure/
├── infrastructure.md
├── environments.md
├── repository.md
├── branching.md
├── ci-cd.md
├── containers.md
├── networking.md
├── domains.md
├── tenant-provisioning.md
├── tenant-migration.md
├── databases.md
├── cache.md
├── queues.md
├── storage.md
├── secrets.md
├── backups.md
├── disaster-recovery.md
├── observability.md
├── monitoring.md
├── scaling.md
├── deployment.md
├── rollback.md
└── runbooks/
```

---

# 129. AI Infrastructure Implementation Rules

Any AI implementing infrastructure must:

1. Read Phases A–H.
2. Read Phase I before modifying infrastructure.
3. Never hardcode production secrets.
4. Never create cloud resources blindly.
5. Never change tenant DB architecture without an ADR.
6. Never deploy unverified artifacts.
7. Never claim deployment succeeded without evidence.
8. Record exact environment changes.
9. Record migrations executed.
10. Record rollback status.
11. Update infrastructure documentation.
12. Update architecture documentation.
13. Update changelog/status.
14. Document all unresolved infrastructure decisions.
15. Never treat local success as proof of production readiness.

---

# 130. Infrastructure Definition of Done

Infrastructure capability is complete only when:

```text
definition exists
configuration is versioned
security is reviewed
automation exists where required
failure behavior is defined
monitoring exists
backup/recovery impact is known
deployment behavior is documented
tests/verification exist
documentation is updated
```

---

# 131. Final Operational Architecture

```text
                         Internet
                            │
                            ▼
                    ┌───────────────┐
                    │ DNS / Gateway │
                    └───────┬───────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
       ┌──────────────┐            ┌──────────────┐
       │ Next.js Web  │            │ Laravel API  │
       └──────────────┘            └──────┬───────┘
                                          │
                   ┌──────────────────────┼──────────────────────┐
                   ▼                      ▼                      ▼
             Control Plane          Tenant Resolver        Application
                   │                      │                   │
                   ▼                      ▼                   ▼
             Control DB             Tenant Registry      Domain / App
                                          │                   │
                                          ▼                   ▼
                                   Tenant DB Resolver    Queue / Cache
                                          │                   │
                           ┌──────────────┼───────────────┐   │
                           ▼              ▼               ▼   ▼
                      Tenant DB A     Tenant DB B     Tenant DB C
                           
                           │
                           ▼
                    External Providers
                  ┌────────┼────────┐
                  ▼        ▼        ▼
                Video    Meet     Email
```

---

# 132. Final Phase-I Rule

Infrastructure must remain an implementation of the approved architecture.

It must not redefine:

```text
tenant model
identity model
authorization model
domain boundaries
payment model
credential model
API contracts
frontend contracts
```

Infrastructure exists to run the system safely and reliably.

---

# 133. Phase Status

```text
Phase A — Approved
Phase B — Approved
Phase C — Approved
Phase D — Approved
Phase E — Approved
Phase F — Approved
Phase G — Approved
Phase H — Approved
Phase I — Draft / Pending Approval
```

---

# 134. What Comes After Phase I

Phase I is **not** the last documentation phase.

The next recommended phases are:

```text
Phase J
Implementation & Delivery Master Plan

Phase K
Final Master Specification / AI Handoff
```

### Phase J

سيحوّل كل الـarchitecture اللي عملناها إلى خطة تنفيذ فعلية مرتبة:

```text
Foundation
→ Project Bootstrap
→ Core Infrastructure
→ Identity
→ Tenancy
→ Authorization
→ Education
→ Billing
→ Credentials
→ Attendance
→ Assessment
→ Analytics
→ Integrations
→ Frontend
→ Testing
→ Deployment
```

مع dependency graph، milestones، sequencing، definition of done لكل مرحلة، وما الذي يستطيع الـAI تنفيذه بشكل مستقل وما الذي لا يجوز له لمسه بدون اعتماد.

### Phase K

دي هتكون **الوثيقة النهائية الأم**:

```text
Master Architecture
+
Business Requirements
+
Domain Model
+
ERD / Database Rules
+
Security
+
API
+
Frontend
+
Testing
+
Infrastructure
+
Implementation Rules
+
AI Instructions
```

بحيث لو بعد كده فتحت ChatGPT أو Gemini أو Claude أو Cursor أو أي AI Agent، تقدر تديه الـMaster Specification + repository، ويبقى عنده **single source of truth** يفهم المشروع من غير ما نعيد شرح المشروع من الصفر.
:::

**حالة Phase I الآن: `Draft — Pending Approval`**

وبالتالي الخطة الحالية أصبحت:

`A ✅ → B ✅ → C ✅ → D ✅ → E ✅ → F ✅ → G ✅ → H ✅ → I ⏳ → J → K`

وده معناه إننا بعد موافقتك على **I** هنكون فعليًا دخلنا آخر مرحلتين: **خطة التنفيذ J** ثم **الـMaster Handoff K**.