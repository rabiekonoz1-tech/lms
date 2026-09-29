تمام. بما إن Phase F اتعتمدت، دي **Phase G — Frontend Application Architecture & UX/System Contract**، وهي هتربط الـAPI والـDomain Architecture بالواجهة بشكل منظم جدًا، بحيث الـAI مايبنيش Frontend عبارة عن صفحات ضخمة ومكونات متداخلة.

:::writing{variant="document" id="74162" title="Phase G — Frontend Application Architecture & UX/System Contract"}
# PHASE G — FRONTEND APPLICATION ARCHITECTURE & UX/SYSTEM CONTRACT

**Project:** Multi-Tenant SaaS LMS & Education Management Platform  
**Architecture Baseline:** Phases A–F Approved  
**Current Phase:** G  
**Status:** Draft — Pending Approval  
**Implementation Status:** Specification Only — No Implementation  
**Frontend:** Next.js + React + TypeScript  
**Presentation Model:** Web Application + Responsive + PWA  
**Primary UI Language:** Arabic  
**Direction:** RTL  
**Font:** IBM Sans  
**Theme:** Light / Dark  
**Design Approach:** Mobile-First  
**Tenant Model:** Multi-Tenant  
**Branding:** White-Label per Tenant

---

# 1. Purpose

Phase G defines the complete frontend architecture and UX/system contract.

Its purpose is to establish:

- application structure
- routing architecture
- layout system
- dashboard separation
- feature boundaries
- component boundaries
- state-management strategy
- data-fetching strategy
- authentication UX
- authorization UX
- tenant-aware UI behavior
- responsive behavior
- PWA behavior
- accessibility expectations
- Arabic RTL behavior
- light/dark theme behavior
- white-label branding
- loading/error/empty states
- frontend observability
- testing boundaries
- documentation requirements

This phase defines **how the frontend application is organized and behaves**, not the implementation itself.

---

# 2. Core Frontend Architecture Principle

The frontend must be designed as a collection of modular product capabilities.

It must NOT become a collection of giant pages.

Avoid:

```text
Teachers.tsx
Students.tsx
Dashboard.tsx
Settings.tsx
```

where each file contains:

- API calls
- business logic
- permissions
- validation
- forms
- tables
- dialogs
- state
- analytics
- styling
- side effects

Instead use:

```text
Page
  ↓
Feature Container
  ↓
Use-Case / Application Hook
  ↓
API Client
  ↓
Reusable UI
```

and where necessary:

```text
Page
  ↓
Feature Module
  ├── components
  ├── hooks
  ├── queries
  ├── mutations
  ├── schemas
  ├── permissions
  ├── types
  └── utils
```

---

# 3. Frontend Architectural Principles

## FE-PR-001 — Feature-Oriented Architecture

Frontend code must be organized primarily by business capability and feature boundaries.

## FE-PR-002 — Thin Pages

Pages should compose features.

Pages should not become business-logic containers.

## FE-PR-003 — Server Is Source of Truth

The frontend reflects server state.

It must not independently redefine:

- permissions
- subscription access
- entitlements
- credential state
- payment state
- exam state
- attendance state

## FE-PR-004 — UI Authorization Is Not Security

Frontend permission checks exist for:

- UX
- navigation
- visibility
- workflow guidance

Backend authorization remains authoritative.

## FE-PR-005 — Reusable Design System

Shared UI behavior must come from a controlled design system.

## FE-PR-006 — Composition Over Duplication

Shared behavior should use composition and reusable primitives rather than giant inheritance trees.

## FE-PR-007 — Explicit Data Boundaries

API data, local UI state, form state, and derived state must remain conceptually separate.

## FE-PR-008 — No Hidden Global State

Global state must be justified.

Do not put all application data into one universal client store.

---

# 4. Recommended Frontend Layer Model

Conceptual frontend stack:

```text
Presentation
    ↓
Feature UI
    ↓
Application Hooks / Use Cases
    ↓
Data Access Layer
    ↓
API Contract
```

Cross-cutting services:

```text
Auth
Permissions
Theme
Tenant Context
Localization
Telemetry
Notifications
Error Handling
```

Shared UI:

```text
Design System
Primitives
Components
Patterns
```

---

# 5. Proposed Frontend Folder Architecture

Initial recommended structure:

```text
src/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── (student)/
│   ├── (parent)/
│   ├── (teacher)/
│   ├── (assistant)/
│   ├── (platform)/
│   └── api/
│
├── features/
│   ├── authentication/
│   ├── students/
│   ├── parents/
│   ├── teachers/
│   ├── assistants/
│   ├── courses/
│   ├── lessons/
│   ├── assignments/
│   ├── exams/
│   ├── grades/
│   ├── attendance/
│   ├── packages/
│   ├── payments/
│   ├── subscriptions/
│   ├── entitlements/
│   ├── credentials/
│   ├── devices/
│   ├── meetings/
│   ├── media/
│   ├── analytics/
│   ├── reports/
│   ├── notifications/
│   ├── settings/
│   └── support/
│
├── components/
│   ├── ui/
│   ├── forms/
│   ├── tables/
│   ├── charts/
│   ├── feedback/
│   └── navigation/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── permissions/
│   ├── tenant/
│   ├── theme/
│   ├── i18n/
│   ├── telemetry/
│   ├── validation/
│   └── utils/
│
├── hooks/
├── providers/
├── types/
├── config/
└── styles/
```

This structure is a baseline, not a mandate to create empty abstractions that are never needed.

---

# 6. Next.js Application Structure

The application should use route groups and layouts to separate experiences.

Conceptual structure:

```text
app/
├── (public)/
│   ├── page
│   ├── login
│   └── ...
│
├── (student)/
│   ├── layout
│   ├── dashboard
│   ├── courses
│   ├── lessons
│   ├── assignments
│   ├── exams
│   ├── grades
│   ├── attendance
│   ├── meetings
│   ├── files
│   └── profile
│
├── (parent)/
│   ├── layout
│   ├── dashboard
│   ├── children
│   ├── reports
│   └── notifications
│
├── (teacher)/
│   ├── layout
│   ├── dashboard
│   ├── students
│   ├── courses
│   ├── attendance
│   ├── assessments
│   ├── payments
│   ├── subscriptions
│   ├── credentials
│   ├── analytics
│   ├── reports
│   └── settings
│
├── (assistant)/
│   ├── layout
│   ├── dashboard
│   ├── students
│   ├── attendance
│   └── payments
│
└── (platform)/
    ├── layout
    ├── dashboard
    ├── tenants
    ├── usage
    ├── support
    └── settings
```

Actual URLs may differ from route-group names.

---

# 7. Dashboard Separation

The product contains multiple distinct application experiences.

They must not be treated as one giant dashboard with conditional rendering everywhere.

Primary experiences:

```text
Student Dashboard
Parent Dashboard
Teacher Dashboard
Assistant Dashboard
Platform Admin Dashboard
Support Experience
```

Each experience should have its own:

- navigation
- information hierarchy
- permissions
- dashboard widgets
- primary actions
- layout behavior

Shared primitives may be reused.

Business-specific dashboard logic must remain feature-local.

---

# 8. Student Experience

The student experience is a primary product surface.

The interface should make it easy to understand:

```text
What do I need to do?
What am I currently learning?
What is coming next?
What have I completed?
What needs attention?
```

Recommended dashboard sections:

```text
Current Learning
Upcoming Sessions
Pending Assignments
Upcoming Exams
Learning Progress
Attendance
Recent Grades
Meetings
Notifications
```

Exact dashboard composition remains a UX/product decision.

---

# 9. Student Multi-Tenant Experience

A global student identity may connect the user to multiple tenant-specific student accounts.

The UI may provide a unified student experience.

Conceptual:

```text
Global Student Identity
        ↓
Unified Student Shell
        ↓
Tenant A Learning
Tenant B Learning
Tenant C Learning
```

However:

```text
Tenant A data ≠ Tenant B data
```

The frontend must not merge private tenant data merely because the same person exists globally.

Tenant switch/context must be explicit whenever required.

---

# 10. Tenant Context UI

The application must have a clear concept of active tenant context.

The frontend may display:

```text
tenant name
logo
brand color
teacher/organization name
```

The frontend must never treat a user-supplied tenant identifier as authority.

Tenant context ultimately comes from the authenticated/server-resolved session.

---

# 11. White-Label Branding

Each tenant may define:

```text
organization/teacher name
logo
primary color
secondary branding
favicon
subdomain/domain
```

The frontend should load branding through a tenant configuration endpoint.

Conceptual:

```text
Request
   ↓
Tenant Resolution
   ↓
Tenant Branding Config
   ↓
Theme / Brand Provider
   ↓
Application UI
```

Branding must not require duplicating the codebase per tenant.

---

# 12. Theme Architecture

The application supports:

```text
LIGHT
DARK
```

Potential future:

```text
SYSTEM
```

may be supported, but must be explicitly approved.

Theme implementation should use design tokens rather than hardcoding colors throughout components.

Avoid:

```text
background: #ffffff
color: #000000
```

repeated across hundreds of files.

Prefer semantic tokens such as:

```text
background
surface
foreground
muted
border
primary
destructive
success
warning
```

---

# 13. Tenant Theme + Dark Mode

Tenant branding must remain compatible with light and dark modes.

A tenant's brand color must not cause:

- unreadable text
- insufficient contrast
- broken controls
- inaccessible states

The system should be able to derive/validate accessible color usage.

Tenant branding is configuration, not permission.

---

# 14. Typography

Primary font:

```text
IBM Sans
```

Typography must support Arabic RTL naturally.

The design system should define:

```text
Display
Heading
Subtitle
Body
Caption
Label
Numeric emphasis
```

The application must not randomly assign font sizes page by page.

---

# 15. Arabic RTL Architecture

Arabic is the primary application language.

The frontend must support RTL at the architectural level rather than through page-by-page fixes.

Requirements:

```text
direction: rtl
```

must be handled consistently.

The design system must account for RTL versions of:

- navigation
- breadcrumbs
- drawers
- tables
- pagination
- forms
- icon placement
- charts
- progress indicators
- menus
- dialogs

Avoid manual left/right assumptions whenever logical direction properties can be used.

---

# 16. Logical CSS Direction

Prefer logical properties conceptually equivalent to:

```text
margin-inline
padding-inline
inset-inline
border-inline
text-align
```

rather than systematically depending on:

```text
margin-left
margin-right
left
right
```

when the component is directional.

---

# 17. Responsive Strategy

The application is mobile-first.

Breakpoints should emerge from content/layout needs rather than arbitrary device names.

Required behavior:

```text
small mobile
large mobile
tablet
desktop
large desktop
```

The application must not merely "shrink" the desktop UI.

Interactions should adapt.

---

# 18. Mobile Interaction Model

On mobile:

- large tables may become cards or horizontally scrollable views
- sidebars may become drawers/bottom navigation where appropriate
- dense desktop controls may collapse into action menus
- key CTAs must remain reachable
- dialogs must fit small screens
- touch targets must remain usable

The correct mobile behavior is feature-specific.

---

# 19. PWA Requirements

The platform is web-based but should behave app-like.

Target capability:

```text
Add to Home Screen
Installable PWA
Responsive shell
App icon
Launch configuration
Offline-safe shell where appropriate
```

PWA must NOT be interpreted as "the whole LMS works offline".

Offline support is an explicit product/technical decision.

---

# 20. PWA Offline Boundary

The following should not automatically be assumed available offline:

```text
exam submission
payment approval
attendance mutation
credential activation
sensitive reports
```

Potentially cacheable:

```text
static shell
branding configuration
recent non-sensitive content
safe reference data
```

The final offline capability matrix is an Open Decision.

---

# 21. Frontend Data Categories

Frontend state should be separated into categories.

## Server State

Examples:

```text
students
courses
payments
subscriptions
attendance
grades
analytics
notifications
```

## Session State

Examples:

```text
authenticated user
session
active tenant
effective permissions
```

## UI State

Examples:

```text
drawer open
modal open
selected tab
filters
temporary UI preferences
```

## Form State

Examples:

```text
student creation form
payment review form
course form
exam answer form
```

## Derived State

Examples:

```text
dashboard totals
filtered view
display labels
computed progress display
```

Do not mix all categories into one global client store.

---

# 22. Data Fetching Architecture

API access must be centralized.

The frontend should not scatter raw fetch logic across components.

Preferred conceptual structure:

```text
Feature
  ↓
Query / Mutation
  ↓
API Client
  ↓
OpenAPI Contract
```

Example:

```text
features/students/
    queries/
    mutations/
    api/
    types/
```

The exact library for server-state management remains an Open Decision.

---

# 23. Server State Management

A dedicated server-state mechanism is recommended.

Examples of responsibilities:

```text
caching
deduplication
loading state
error state
refetching
mutation handling
stale data management
```

Do not use a general client-state store as a replacement for a server-state framework.

---

# 24. API Client Boundary

One controlled API client layer should handle:

- base URL
- authentication headers/cookies
- request IDs where required
- error normalization
- retries where safe
- serialization
- common response handling

Features should not each implement their own API client.

---

# 25. Authentication Frontend Flow

Conceptual:

```text
Login Screen
    ↓
Submit Credentials
    ↓
Authentication API
    ↓
Session Established
    ↓
GET /me
    ↓
Resolve Tenant Context
    ↓
Resolve Effective Permissions
    ↓
Load Appropriate Application Shell
```

The UI should not guess the actor type before authentication.

---

# 26. Authentication Modes UI

Tenant configuration may determine whether the login UI presents:

```text
Password/contact login
Credential login
Combined login
```

The frontend should receive configuration from the backend rather than hardcoding every tenant to one login flow.

---

# 27. Authentication Error UX

Different authentication failures should result in safe but useful UX.

Examples:

```text
invalid credentials
expired session
credential revoked
device binding conflict
rate limited
tenant unavailable
```

The UI must not reveal sensitive internal details that could aid account enumeration.

---

# 28. Permission-Aware UI

The application may hide controls the actor cannot use.

Example:

```text
Can user approve payment?
```

If not:

```text
Approve button not shown
```

But backend must still enforce:

```text
POST /payments/{id}/approve
```

independently.

---

# 29. Permission Architecture

Permission utilities should be centralized.

Conceptual:

```text
can(action, resource, context)
```

and/or:

```text
usePermission(...)
```

The frontend should avoid hardcoding dozens of role-name conditions:

```text
if role === "teacher"
if role === "assistant"
if role === "admin"
```

The preferred approach uses capabilities/permissions delivered from the server.

---

# 30. Conditional Navigation

Navigation should be permission-aware.

Example:

```text
Teacher
  → Students
  → Courses
  → Attendance
  → Payments
  → Analytics
```

Assistant navigation may contain only authorized modules.

Parent navigation is separate.

Student navigation is optimized around learning rather than administration.

Platform administration has its own shell.

---

# 31. Feature Flags

Feature availability may depend on:

```text
tenant configuration
plan/package
platform configuration
rollout strategy
```

The frontend should not treat feature flags as security.

An unavailable feature should also be rejected by the backend.

---

# 32. Authorization + Feature Flags

The final visibility rule may conceptually be:

```text
Feature Enabled
AND
User Authorized
```

not:

```text
Feature Enabled
OR
User Authorized
```

UI access must be based on both product availability and permission.

---

# 33. Navigation Architecture

Shared navigation primitives:

```text
AppShell
Sidebar
TopBar
Breadcrumbs
MobileNavigation
UserMenu
TenantSwitcher
NotificationCenter
```

But each application experience defines its own navigation configuration.

Avoid one massive navigation file containing every role-specific rule.

---

# 34. Layout Architecture

Recommended shared layout layers:

```text
RootLayout
  ↓
ThemeProvider
  ↓
TenantProvider
  ↓
AuthProvider
  ↓
ApplicationShell
  ↓
Role/Experience Layout
  ↓
Feature Page
```

Only providers with actual cross-cutting responsibilities should be global.

---

# 35. Server Components vs Client Components

Next.js Server Components should be preferred when interactivity is not needed.

Client Components should be used when functionality requires:

- local interactivity
- browser APIs
- event handlers
- real-time UI
- media playback
- complex forms
- client-only state

Do not turn entire page trees into Client Components without justification.

---

# 36. Browser-Specific Features

Browser-dependent capabilities should be isolated.

Examples:

```text
camera/QR scanning
PWA installation
media playback
notifications
local storage
device information
clipboard
fullscreen
```

Do not allow browser-specific APIs to leak into domain-neutral business code.

---

# 37. QR Scanner UX

QR attendance requires a dedicated responsive flow.

Conceptual:

```text
Open Attendance Scanner
    ↓
Select / Confirm Session
    ↓
Camera Permission
    ↓
Scan QR
    ↓
Visual Success/Failure
    ↓
Attendance Result
```

The UI should provide immediate feedback.

Repeated scans should clearly indicate:

```text
Attendance recorded
Already recorded
Invalid QR
Unauthorized
Session closed
```

without relying on ambiguous UI state.

---

# 38. Student QR Display

Student credential QR should have:

- clear visual hierarchy
- safe display
- anti-sharing awareness
- appropriate warning/context
- tenant branding

The UI must not imply that screenshots can be technically prevented.

---

# 39. Video Player UX

Video playback should support:

```text
play/pause
progress
resume
fullscreen where appropriate
volume
playback position
completion indication
```

The system should additionally support:

```text
dynamic watermark
student identity display
secure access flow
playback tracking
```

---

# 40. Dynamic Watermark

The player may render dynamic identifying information such as:

```text
Student Name
Student ID
Student Contact Number
```

The watermark should be:

- visible
- dynamic where practical
- difficult to remove through ordinary UI
- integrated with abuse deterrence

The frontend must not claim that watermarking prevents external recording.

---

# 41. Student Learning UX

Learning UI should clearly show:

```text
course
lesson
lesson status
completion %
next lesson
assignments
exams
files
meeting links
```

Progress indicators must correspond to server-defined learning progress.

The frontend must not invent completion rules.

---

# 42. Assignment UX

Assignment UI must represent:

```text
available
not started
draft
submitted
late
graded
returned
```

The exact states come from the backend domain contract.

Students should be able to clearly distinguish:

```text
action required
waiting for grading
completed
deadline passed
```

---

# 43. Exam UX

Exam UI is a specialized experience.

It should support:

```text
attempt start
question navigation
answer entry
autosave where designed
remaining-time display
submission confirmation
submission result
```

The frontend must not be the source of truth for exam timing or submission.

The server remains authoritative.

---

# 44. Exam Safety UX

Potential browser behaviors:

```text
tab visibility changes
connection interruptions
reload attempts
session expiration
duplicate submission
```

may be tracked where product policy requires.

However, frontend controls must not be presented as absolute protection against cheating.

---

# 45. Payment UX

Student payment flow:

```text
Select package
    ↓
Select method
    ↓
Enter sender number / reference
    ↓
Upload proof
    ↓
Submit
    ↓
Pending Review
```

The UI should clearly communicate:

```text
Payment submitted
Awaiting review
Approved
Rejected
```

The dashboard may become available before payment approval, but paid capabilities remain controlled by entitlements.

---

# 46. Payment Reviewer UX

Authorized reviewers should have:

```text
payment details
student information
package
amount
payment method
sender number
proof
review actions
review history
```

Approval/rejection should require confirmation where the action is consequential.

---

# 47. Subscription and Entitlement UX

Students should see understandable access status.

Example:

```text
Online Access: Active
Offline Access: Active
Exam Access: Active
```

The UI should not expose internal authorization complexity unless useful.

Business concepts remain separate internally.

---

# 48. Teacher Dashboard

Teacher dashboard should emphasize operational control.

Potential sections:

```text
Student Count
Active Courses
Today's Sessions
Pending Payments
Attendance
Assignments
Upcoming Exams
Performance Overview
Notifications
```

Widgets should remain modular.

---

# 49. Assistant Dashboard

Assistant dashboard should focus on assigned operations.

Potential:

```text
Today's Sessions
Attendance Scanner
Assigned Students
Pending Payments
Tasks
Notifications
```

The dashboard must reflect the assistant's actual scope.

---

# 50. Parent Dashboard

Parent dashboard should emphasize children and outcomes.

Potential:

```text
Children
Attendance
Progress
Grades
Upcoming Activities
Reports
Notifications
```

Parent data must remain tenant-scoped.

---

# 51. Platform Dashboard

Platform dashboard should focus on aggregate platform operations.

Potential:

```text
Tenant Count
Active Tenants
Active Students
Platform Usage
Infrastructure Health
Queue Health
Integration Health
Storage/Consumption
Support Activity
```

Tenant-specific private data should not appear merely because the user is in the platform dashboard.

---

# 52. Support UI

Support access must feel visibly different from ordinary tenant usage where practical.

The UI should clearly indicate:

```text
SUPPORT SESSION ACTIVE
Target Tenant
Session Expiry
Reason
```

This reduces accidental privilege confusion.

A support user should never forget that they are operating under a temporary support context.

---

# 53. Support Session Exit

The UI should provide a clear:

```text
End Support Session
```

action.

Session expiration should automatically terminate access.

---

# 54. Forms Architecture

Forms must be feature-local but use shared primitives.

Example:

```text
features/students/
    forms/
        StudentCreateForm
        StudentEditForm
```

Shared components:

```text
FormField
TextInput
PhoneInput
Select
DatePicker
FileUpload
ValidationMessage
SubmitButton
```

Do not duplicate low-level form implementation across every feature.

---

# 55. Form Validation

Frontend validation improves UX.

Backend validation remains authoritative.

The frontend may reuse schema definitions where practical, but must not assume frontend validation alone guarantees acceptance.

---

# 56. File Upload UX

File upload components should communicate:

```text
allowed formats
maximum size
upload progress
success
failure
retry
```

Payment proof uploads should receive specialized UI because they are security-sensitive.

---

# 57. Tables

Administrative interfaces will require tables.

Tables should support where relevant:

```text
sorting
filtering
search
pagination
row actions
bulk actions
responsive behavior
empty state
loading state
error state
```

Table behavior should be reusable but feature-specific column definitions should remain inside the feature.

---

# 58. Mobile Table Strategy

Do not assume every desktop table can simply become a narrow table.

Feature-specific mobile strategies may include:

```text
horizontal scroll
stacked cards
priority columns
row expansion
action menus
```

The most important information should remain visible first.

---

# 59. Charts and Analytics UI

Charts must consume backend-defined analytical data.

The frontend should not independently derive core KPIs from raw events unless specifically designed for that purpose.

Chart components should be reusable:

```text
LineChart
BarChart
DonutChart
ProgressChart
TrendCard
MetricCard
```

Feature-specific analytics configurations remain inside the analytics feature.

---

# 60. Dashboard Widget Architecture

Widgets should be self-contained.

Example:

```text
StudentAttendanceWidget
UpcomingAssignmentsWidget
PaymentReviewWidget
CourseProgressWidget
```

Avoid one giant:

```text
Dashboard.tsx
```

that contains all dashboard logic.

---

# 61. Loading States

Every asynchronous feature must define an intentional loading experience.

Possible patterns:

```text
skeleton
spinner
progress indicator
placeholder
optimistic UI
```

Choose based on operation type.

Large pages should not show a blank screen while one request completes.

---

# 62. Empty States

Empty states must communicate:

```text
what is empty
why it may be empty
what the user can do next
```

Example:

```text
No courses yet.
Create your first course to start organizing lessons.
```

For student experiences, empty states should avoid making the product appear broken.

---

# 63. Error States

Feature-level errors should distinguish:

```text
not authorized
not found
validation failed
conflict
network issue
temporary integration issue
unknown failure
```

The UI should provide the most useful safe next action.

---

# 64. Offline / Connectivity UX

Because this is a web/PWA application, network status may change.

The UI should detect relevant connectivity issues where practical.

Possible states:

```text
online
offline
reconnecting
queued
retry required
```

The application must not pretend a mutation succeeded merely because it was queued locally unless offline mutation is explicitly supported for that feature.

---

# 65. Notifications UX

Notifications should support:

```text
unread count
read/unread
priority where applicable
timestamp
navigation target
```

Notifications are separate from delivery channels.

---

# 66. Toasts vs Persistent Messaging

Use temporary feedback for:

```text
saved successfully
copied
attendance recorded
```

Use persistent/inline messaging for:

```text
authorization failure
payment rejected
exam deadline passed
subscription unavailable
integration failure
```

Do not communicate critical business state only through disappearing toasts.

---

# 67. Modal Architecture

Modals should be reserved for:

- confirmation
- focused editing
- contextual workflows
- short forms

Avoid putting complete complex applications inside nested modal stacks.

Long workflows should generally use dedicated pages or drawers where appropriate.

---

# 68. Confirmation Rules

High-impact actions should require deliberate confirmation.

Examples:

```text
Delete student
Reject payment
Revoke credential
Replace device
Cancel meeting
Publish grade
```

The confirmation message should clearly state the action and consequence.

---

# 69. Accessibility

The frontend must target strong accessibility practices.

Requirements include:

```text
keyboard navigation
focus management
visible focus states
semantic HTML
screen-reader labels
form error associations
sufficient contrast
accessible dialogs
accessible tables
accessible charts where practical
```

Accessibility applies to both light and dark modes.

---

# 70. Touch Accessibility

Interactive targets must be large enough for touch use.

Particularly:

```text
buttons
QR scanner controls
navigation
checkboxes
row actions
video controls
```

---

# 71. Internationalization Architecture

Arabic is the first supported language.

The architecture should not hardcode Arabic strings directly throughout components.

Use a centralized localization system.

Example:

```text
t("students.create.success")
```

The system should allow future additional languages without rewriting feature structure.

---

# 72. Date and Time Handling

Dates must be represented consistently.

The frontend must distinguish:

```text
date only
local date/time
server timestamp
scheduled time
duration
```

Timezone behavior must be consistent across:

```text
sessions
attendance
meetings
assignments
exams
notifications
reports
```

The exact timezone policy remains an Open Decision if not already fixed in earlier phases.

---

# 73. Number Formatting

Arabic-facing UI should format:

```text
currency
percentages
dates
times
counts
durations
```

consistently.

The display format must not change the underlying API data semantics.

---

# 74. RTL Data Visualization

Charts must be reviewed under RTL.

Do not assume every chart automatically becomes understandable when container direction changes.

Axes, labels, legends, tooltips, and navigation must be intentionally handled.

---

# 75. Security UX

Security-sensitive features should provide useful user feedback without exposing unnecessary internals.

Examples:

```text
This device is not authorized.
This credential has expired.
Your session has expired.
You need additional permission to perform this action.
```

Avoid exposing:

```text
database details
provider tokens
authorization internals
security implementation details
```

---

# 76. Session Expiration UX

When a session expires:

```text
detect authentication failure
preserve safe user intent where possible
redirect to authentication
inform user
```

Sensitive unsaved information must not be indiscriminately persisted.

---

# 77. Permission Denied UX

A permission-denied experience should be explicit.

Possible:

```text
403 state
```

with:

```text
You do not have permission to perform this action.
```

The application should not expose a hidden button simply to discover the denial after submission where the permission was already known.

However, server responses remain authoritative.

---

# 78. Not Found vs Unauthorized

Frontend routing must not assume that:

```text
404 = resource absent
```

or:

```text
403 = safe to reveal existence
```

The API may intentionally use non-disclosure behavior depending on security policy.

The UI must render based on returned contract.

---

# 79. Optimistic UI

Optimistic updates may be used for low-risk interactions.

Examples:

```text
mark notification read
toggle UI preference
```

They should be used cautiously for:

```text
payments
subscriptions
credentials
attendance
grades
exam submission
```

because those actions have stronger transactional semantics.

---

# 80. Real-Time Features

Real-time behavior should be introduced only where product value justifies it.

Potential future candidates:

```text
notifications
live attendance feedback
support events
meeting updates
payment review updates
```

The initial architecture should not assume the whole platform is real-time.

---

# 81. API Polling

Polling may be acceptable for:

```text
report generation
import status
long-running jobs
integration completion
```

Polling must have:

```text
interval
timeout
stop condition
error handling
```

and should not continue indefinitely.

---

# 82. Frontend Error Boundary Architecture

Application-level error boundaries should isolate failures.

Conceptual levels:

```text
Global Boundary
Experience Boundary
Feature Boundary
```

A failure inside one widget should not necessarily crash the complete dashboard.

---

# 83. Logging and Telemetry

Frontend telemetry should support:

```text
route
feature
operation
request_id
error
performance metric
tenant context where safe
actor context where safe
```

Never log:

```text
passwords
credentials
tokens
payment secrets
sensitive personal data unnecessarily
```

---

# 84. Performance Architecture

Primary frontend performance goals:

```text
fast initial shell
efficient navigation
controlled bundle size
lazy loading where useful
minimal duplicate requests
responsive interactions
progressive rendering
```

Heavy modules may be loaded on demand.

Examples:

```text
analytics
large reports
exam tools
QR scanner
advanced media
```

---

# 85. Bundle Boundaries

Large optional dependencies should remain feature-local.

Do not import large libraries globally when only one feature requires them.

---

# 86. Image and Media Performance

Images should use responsive/optimized delivery where practical.

Media-heavy pages must avoid loading every asset at once.

Student dashboards should prioritize above-the-fold information.

---

# 87. Video Performance

Video playback should not load:

```text
all videos
all metadata
all thumbnails
```

for an entire course unnecessarily.

Load progressively based on visible/useful content.

---

# 88. Frontend Caching

Caching must distinguish:

```text
public/shared
tenant-scoped
user-scoped
highly sensitive
```

Sensitive user/tenant responses must never leak through improperly shared browser or CDN caches.

---

# 89. Browser Storage

Browser storage must be used conservatively.

Do not put highly sensitive secrets into localStorage by default.

Session architecture determines the appropriate storage strategy.

This decision follows the security model in Phase E and authentication decisions in Phase F.

---

# 90. Service Worker Rules

Service worker behavior must be intentionally scoped.

It must not blindly cache:

```text
student private data
payment proofs
credential data
support session data
```

unless explicitly designed and secured.

---

# 91. Navigation Guards

Client-side navigation guards may improve UX.

Examples:

```text
unsaved form changes
exam in progress
expired session
unsupported role experience
```

Navigation guards are not backend security.

---

# 92. Unsaved Changes

For important forms, warn when navigating away with unsaved changes.

The warning behavior must not interfere with:

```text
session expiration
forced logout
security revocation
```

when secure termination is required.

---

# 93. Feature Module Structure

Example:

```text
features/payments/
├── components/
│   ├── PaymentTable
│   ├── PaymentDetails
│   ├── PaymentStatusBadge
│   └── PaymentReviewDialog
├── queries/
│   ├── usePayments
│   └── usePayment
├── mutations/
│   ├── useSubmitPayment
│   ├── useApprovePayment
│   └── useRejectPayment
├── schemas/
├── permissions/
├── types/
├── utils/
└── index.ts
```

The same pattern should be applied selectively to complex features.

---

# 94. Shared Component Architecture

Recommended shared levels:

```text
UI Primitive
    ↓
Composite Component
    ↓
Feature Component
    ↓
Page
```

Example:

```text
Button
    ↓
ConfirmButton
    ↓
PaymentApproveButton
    ↓
PaymentReviewPage
```

Do not force every component into a generic abstraction.

---

# 95. Design System Levels

## Level 1 — Tokens

```text
colors
spacing
radius
typography
shadows
motion
z-index
```

## Level 2 — Primitives

```text
Button
Input
Select
Checkbox
Badge
Card
Dialog
Tooltip
```

## Level 3 — Patterns

```text
DataTable
FormLayout
FilterBar
EmptyState
PageHeader
StatsCard
```

## Level 4 — Feature Components

```text
PaymentReview
AttendanceScanner
ExamTimer
StudentProgressPanel
```

---

# 96. Design Tokens

Tokens should be semantic rather than component-specific.

Example:

```text
color.background
color.surface
color.foreground
color.muted
color.primary
color.success
color.warning
color.danger

spacing.xs
spacing.sm
spacing.md
spacing.lg
spacing.xl

radius.sm
radius.md
radius.lg
```

The design system may evolve without rewriting feature components.

---

# 97. Motion and Animation

Animation should communicate:

```text
state change
feedback
navigation
loading
```

Avoid unnecessary motion.

Respect accessibility preferences such as reduced motion where supported.

---

# 98. Form Submission Rules

Every form should clearly represent:

```text
idle
editing
submitting
success
validation failure
server failure
```

Buttons must avoid accidental duplicate submissions.

Critical mutations should use the API idempotency contract where required.

---

# 99. Search UX

Search interfaces should support:

```text
loading
no results
results
error
clear
```

Server-side search remains authoritative for large datasets.

---

# 100. Filter UX

Filters should preserve URL state where useful for shareability/navigation.

For sensitive information, do not encode secrets into URLs.

---

# 101. URL State

URL may represent safe user navigation state such as:

```text
search
filters
sort
tab
pagination cursor where appropriate
```

Do not place:

```text
password
credential
private tokens
sensitive payment information
```

in URL parameters.

---

# 102. Error Recovery

The frontend should support safe retry.

Examples:

```text
Retry request
Retry upload
Retry report status
Reconnect
Reload stale data
```

Retries should not blindly repeat non-idempotent business mutations.

---

# 103. Offline Error Recovery

If true offline mutations are later approved, each offline-capable mutation must define:

```text
queue semantics
conflict handling
retry semantics
expiration
user feedback
security implications
```

No generic "offline sync" should be invented for the entire application without domain analysis.

---

# 104. Frontend Testing Architecture

Testing layers:

```text
Unit Tests
Component Tests
Feature Tests
Integration Tests
End-to-End Tests
Accessibility Tests
Visual Regression where justified
Performance Tests where justified
```

---

# 105. Unit Testing

Use unit tests for:

```text
pure utilities
formatters
selectors
permission display helpers
validation helpers
state transitions
```

Do not use unit tests to mock away every meaningful system behavior.

---

# 106. Component Testing

Test important components for:

```text
rendering
interaction
states
accessibility
error handling
```

Examples:

```text
PaymentReviewDialog
AttendanceScanner
ExamTimer
StudentProgressCard
```

---

# 107. Feature Testing

Feature tests should verify flows such as:

```text
student submits payment
teacher approves payment
student sees pending/approved state
assistant records attendance
student submits assignment
teacher grades submission
student starts/submits exam
```

---

# 108. End-to-End Testing

Critical workflows require end-to-end coverage.

At minimum:

```text
authentication
tenant resolution
student learning
payment workflow
credential login
attendance scanning
exam submission
support access
```

The final test plan will be expanded in the later testing phase.

---

# 109. Cross-Tenant Frontend Testing

The UI must be tested to ensure no tenant data is accidentally presented through:

```text
cache
route state
client state
search state
browser storage
shared components
prefetched queries
```

The backend remains the primary isolation boundary, but frontend leakage must also be avoided.

---

# 110. Authorization UI Testing

For each major feature:

```text
authorized actor
unauthorized actor
different scope
different tenant
```

should be tested.

---

# 111. Accessibility Testing

Critical flows should be tested for:

```text
keyboard
screen reader semantics
focus
contrast
forms
dialogs
navigation
```

---

# 112. Visual Regression

Visual regression testing may be valuable for:

```text
design system primitives
student dashboard
teacher dashboard
responsive layouts
RTL
dark mode
white-label theming
```

It should be introduced where maintenance value justifies it.

---

# 113. Frontend Security Invariants

```text
FE-SEC-INV-001
Frontend is never the final authorization boundary.

FE-SEC-INV-002
Tenant context must be derived from trusted application/auth context.

FE-SEC-INV-003
Sensitive secrets are never rendered or persisted unnecessarily.

FE-SEC-INV-004
Tenant-scoped client caches must be isolated.

FE-SEC-INV-005
Support mode must be visibly temporary.

FE-SEC-INV-006
Critical mutations must not rely on optimistic UI as truth.

FE-SEC-INV-007
Credential secrets must not be exposed in logs or client state.

FE-SEC-INV-008
PWA/service-worker caching must not leak private tenant data.

FE-SEC-INV-009
Frontend cannot guarantee screenshot prevention.

FE-SEC-INV-010
Server state remains authoritative.
```

---

# 114. Frontend Scalability Rules

The frontend architecture must scale by:

```text
feature isolation
code splitting
lazy loading
server rendering where useful
controlled state
API caching
component reuse
modular route boundaries
```

Avoid:

```text
one global store
one global API service file
one global utility file containing everything
one dashboard component
one permission component
one form system that knows every feature
```

---

# 115. Anti-God-File Rules

The following are explicitly discouraged:

```text
Dashboard.tsx > huge monolithic component
Students.tsx > all student feature logic
api.ts > all endpoints
permissions.ts > all authorization behavior
utils.ts > unrelated utilities
forms.tsx > every form in the system
```

Files should remain understandable and purpose-driven.

---

# 116. Frontend Dependency Rules

Feature modules should not create arbitrary dependency graphs.

Avoid:

```text
Feature A
   ↓
Feature B
   ↓
Feature C
   ↓
Feature A
```

Circular dependencies are prohibited.

Shared abstractions belong in shared layers only when genuinely shared.

---

# 117. Domain-to-UI Mapping

A domain concept may produce several UI models.

Example:

```text
Payment domain
    ↓
PaymentListItem
PaymentDetailsView
PaymentReviewPanel
StudentPaymentStatusCard
TeacherPaymentMetric
```

These are UI representations, not necessarily database entities.

---

# 118. API-to-UI Mapping

Do not expose API responses blindly throughout the component tree.

Use feature-level mapping when necessary.

Example:

```text
Payment API Response
      ↓
PaymentViewModel
      ↓
PaymentCard
```

This keeps the UI resilient to API/internal contract evolution.

---

# 119. Frontend Business Logic Boundary

The frontend may contain:

```text
presentation logic
interaction logic
formatting
local validation
display rules
temporary UI state
```

The frontend should not become the authoritative place for:

```text
payment approval rules
subscription eligibility
credential lifecycle
tenant authorization
exam finalization
entitlement calculation
```

---

# 120. Error Code Mapping

Frontend should centralize known API error codes.

Example:

```text
AUTH_SESSION_EXPIRED
PAYMENT_ALREADY_REVIEWED
AUTHZ_PERMISSION_DENIED
CREDENTIAL_ALREADY_BOUND
ATTENDANCE_ALREADY_RECORDED
EXAM_ATTEMPT_NOT_ACTIVE
```

Each code may map to:

```text
user message
UI action
retry behavior
redirect behavior
```

---

# 121. Notification Handling

Notifications may link to routes.

Example:

```text
PaymentApproved
    → /payments/{id}

AssignmentGraded
    → /assignments/{id}

ExamPublished
    → /exams/{id}
```

Navigation targets should be validated server-side where resource access is sensitive.

---

# 122. Breadcrumbs

Breadcrumbs should reflect application hierarchy.

Student:

```text
Dashboard
→ Courses
→ Mathematics
→ Lesson 3
```

Teacher:

```text
Dashboard
→ Students
→ Student Profile
→ Performance
```

The breadcrumb architecture should derive from route/feature metadata rather than manual repetition.

---

# 123. Page Metadata

Pages should support:

```text
title
description where appropriate
navigation label
breadcrumb label
permission requirement
```

Sensitive/private information should not be blindly placed into document metadata.

---

# 124. Mobile Navigation Strategy

Student mobile navigation may prioritize:

```text
Home
Learning
Schedule
Notifications
Profile
```

Teacher/Assistant navigation may prioritize operational workflows.

The exact navigation hierarchy is a UX Open Decision and should be finalized during design specification.

---

# 125. Desktop Navigation Strategy

Desktop may use:

```text
sidebar
topbar
content
contextual actions
```

The layout should remain consistent across tenant experiences while allowing role-specific navigation.

---

# 126. Responsive Dashboard Strategy

The dashboard must define priority.

Example:

```text
Priority 1:
urgent / next action

Priority 2:
current progress

Priority 3:
supporting information

Priority 4:
historical / secondary analytics
```

Do not simply render desktop widgets in a smaller grid.

---

# 127. White-Label Constraints

Tenant branding must not be allowed to break system consistency.

Tenant customization should remain limited to approved dimensions such as:

```text
brand colors
logo
name
favicon
certain visual accents
```

The core layout, accessibility baseline, and security UX remain platform-controlled.

---

# 128. Platform Branding vs Tenant Branding

The system contains two branding levels:

```text
Platform Brand
Tenant Brand
```

Tenant-facing application experiences should normally prioritize tenant branding.

Platform administration should retain platform branding.

Support sessions inside tenant UI may display both tenant context and support context where useful.

---

# 129. Frontend Configuration

Configuration should distinguish:

```text
build-time config
runtime public config
tenant config
session config
feature flags
```

Do not expose secrets as client-side configuration.

---

# 130. Environment Separation

Frontend environments should conceptually support:

```text
local
development
staging
production
```

Environment-specific behavior should be centralized.

Do not scatter environment checks across hundreds of components.

---

# 131. Development Experience

The project should include standard developer tooling for:

```text
formatting
linting
type checking
tests
build validation
API contract validation
```

Specific tools are an implementation decision unless locked later.

---

# 132. API Contract Synchronization

Frontend types should be synchronized with the Phase F API contract.

Preferred conceptual pipeline:

```text
OpenAPI Contract
     ↓
Generated / Validated Types
     ↓
API Client
     ↓
Feature Queries/Mutations
     ↓
UI
```

Manual duplication of API models should be minimized.

---

# 133. Frontend Documentation

Recommended documentation structure:

```text
docs/frontend/
├── frontend-architecture.md
├── routing.md
├── layouts.md
├── state-management.md
├── data-fetching.md
├── authentication-ui.md
├── authorization-ui.md
├── rtl.md
├── theming.md
├── responsive.md
├── pwa.md
├── accessibility.md
├── design-system.md
├── performance.md
├── testing.md
└── features/
    ├── student.md
    ├── teacher.md
    ├── assistant.md
    ├── parent.md
    └── platform.md
```

---

# 134. AI Frontend Implementation Rules

Any AI agent implementing frontend functionality must:

1. Read Phases A–F.
2. Read Phase G before creating new screens or components.
3. Identify the feature/domain responsible.
4. Avoid creating monolithic pages.
5. Use the API contract from Phase F.
6. Do not invent backend business behavior in the frontend.
7. Keep authorization checks centralized.
8. Respect RTL.
9. Respect IBM Sans.
10. Support light/dark theme.
11. Follow responsive/mobile-first behavior.
12. Update frontend documentation after every meaningful implementation step.
13. Update architecture documentation when boundaries change.
14. Record new ADRs when architectural decisions change.
15. Record incomplete or blocked work.
16. Never mark UI complete when backend behavior is missing.
17. Never bypass API contracts with direct database access.
18. Never expose secrets through client-side code.

---

# 135. Definition of Done — Frontend Feature

A feature is considered complete only when applicable items are satisfied:

```text
Route defined
Layout defined
Permission behavior defined
Tenant behavior defined
API integration defined
Loading state
Empty state
Error state
Success state
Responsive behavior
RTL verified
Light mode verified
Dark mode verified
Accessibility reviewed
Mobile behavior verified
Tests implemented
Documentation updated
```

---

# 136. Frontend Acceptance Criteria

## G-AC-001

The application is modular by feature rather than giant page files.

## G-AC-002

Student, Parent, Teacher, Assistant, and Platform experiences have clear boundaries.

## G-AC-003

The frontend consumes the versioned API contract.

## G-AC-004

Server authorization remains authoritative.

## G-AC-005

Tenant context is explicit and isolated.

## G-AC-006

White-label branding works without creating tenant-specific codebases.

## G-AC-007

Arabic RTL works consistently across the system.

## G-AC-008

Light and dark modes are supported through semantic design tokens.

## G-AC-009

Responsive/mobile-first behavior is defined for major workflows.

## G-AC-010

PWA architecture is established without incorrectly assuming full offline LMS capability.

## G-AC-011

Student dashboard is optimized as a dedicated experience.

## G-AC-012

Feature code avoids God Components and God Files.

## G-AC-013

Critical mutations correctly represent server success/failure.

## G-AC-014

Sensitive data is not accidentally exposed through browser storage/cache/logging.

## G-AC-015

Frontend documentation remains synchronized with implementation.

---

# 137. Open Decisions

The following must not be silently decided during implementation.

### G-OD-001
Exact server-state management library.

### G-OD-002
Exact client-state library, if any.

### G-OD-003
Exact forms/validation library.

### G-OD-004
Exact UI component library vs custom design system foundation.

### G-OD-005
Exact PWA offline capability matrix.

### G-OD-006
Exact routing URL structure.

### G-OD-007
Exact student mobile navigation hierarchy.

### G-OD-008
Exact teacher/assistant desktop navigation hierarchy.

### G-OD-009
Exact timezone policy.

### G-OD-010
Exact runtime theming mechanism for tenant branding.

### G-OD-011
Exact API client/code-generation workflow.

### G-OD-012
Exact frontend telemetry provider.

---

# 138. Explicit Non-Goals

Phase G does not implement:

```text
Next.js pages
React components
CSS
API client code
state-management code
PWA service worker
design files
production visual assets
```

These will belong to implementation/design phases.

---

# 139. Relationship to Previous Phases

```text
Phase A
Business/Product Foundation

Phase B
Business Requirements

Phase C
Architecture

Phase D
Domain / ERD / Database

Phase E
Security / Scalability / Resilience

Phase F
API & Application Contract

        ↓

Phase G
Frontend Application Architecture & UX/System Contract
```

Phase G must not introduce behavior that conflicts with the approved backend/domain contracts.

---

# 140. Architectural Principle — Final Frontend Shape

The intended structure is:

```text
                    ┌─────────────────────┐
                    │     Next.js App     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ↓                ↓                ↓
        Student UX        Teacher UX        Parent UX
              │                │                │
              └────────────┬───┴────────────────┘
                           ↓
                    Feature Modules
                           ↓
                Application Data Layer
                           ↓
                     API Client
                           ↓
                     REST API v1
                           ↓
                  Application / Domain
                           ↓
                Tenant DB / Infrastructure
```

Cross-cutting:

```text
Auth
Tenant Context
Authorization
Theme
RTL / i18n
Telemetry
Error Handling
Design System
```

---

# 141. Final Rule for AI

Before creating any frontend file, the AI must answer:

```text
1. What user experience does this belong to?
2. What feature owns it?
3. Is it a page, layout, feature component, shared component, hook, query, mutation, or utility?
4. What API contract does it consume?
5. What permission controls it?
6. What tenant context does it require?
7. What state does it own?
8. What state comes from the server?
9. What happens during loading?
10. What happens when there are no records?
11. What happens on authorization failure?
12. What happens on API/network failure?
13. How does it behave on mobile?
14. How does it behave in RTL?
15. How does it behave in dark mode?
16. Is it accessible?
17. Is it white-label compatible?
18. Does this create a new abstraction?
19. Is that abstraction genuinely reusable?
20. Which documentation files must be updated?
```

If the answer to these questions is unclear, the AI must update the specification rather than silently inventing architecture.

---

# 142. Phase Status

```text
Phase A — Approved
Phase B — Approved
Phase C — Approved
Phase D — Approved
Phase E — Approved
Phase F — Approved
Phase G — Draft / Pending Approval
```

**Next planned phase after Phase G approval:**

**Phase H — Testing, Quality Engineering & Verification Architecture**

This phase will define the project's testing pyramid, unit/integration/E2E/contract/security/performance tests, tenant-isolation verification, state-machine testing, CI quality gates, release gates, regression strategy, and AI-agent verification rules.
:::

**حالة Phase G الآن: `Draft — Pending Approval`**.