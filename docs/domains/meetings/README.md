# Meetings Domain

## 1. Overview
The Meetings Domain encapsulates live virtual classroom sessions, remote parent-teacher conferences, and scheduled web conferences across multiple video conferencing providers (Google Meet, Zoom, Microsoft Teams, Mock).
Per Phase J §38–§40 and ADR rules:
- Provider abstraction is strictly enforced: `Domain Contract -> Application Interface -> Provider Adapter -> External SDK`.
- The domain never depends directly on provider SDK classes.
- Provider failover and timeout resilience are supported transparently.

## 2. Invariants
- `Meeting ≠ ClassSession`: A ClassSession can occur without a virtual meeting (e.g. physical classroom) or can attach to a virtual Meeting.
- `External Meeting ID Mapping`: All external provider IDs (`spaceUri`, `zoom_meeting_id`, etc.) are mapped to internal tenant meeting UUIDs.
- `Idempotent Creation`: Repeated meeting creation requests containing the same `idempotency_key` must not create duplicate meetings or trigger additional remote provider allocations.
- `Tenant Isolation`: Meetings belong strictly to a tenant data plane. Cross-tenant meeting access is denied by default.
- `Webhook Integrity`: Provider webhooks must verify HMAC-SHA256 signatures before modifying internal meeting states.

## 3. Architecture & Interfaces
- **Contract**: `App\Domain\Integrations\Contracts\MeetingProviderInterface`
  - `getProviderName(): string`
  - `createMeeting(MeetingRequest $request): MeetingResponse`
  - `getJoinUrl(string $externalMeetingId, array $userContext = []): string`
  - `cancelMeeting(string $externalMeetingId): bool`
  - `verifyWebhookSignature(string $payload, string $signature, string $secret): bool`
- **Adapters**:
  - `App\Domain\Integrations\Meetings\GoogleMeetProvider`
  - `App\Domain\Integrations\Meetings\ZoomMeetingProvider`
  - `App\Domain\Integrations\Meetings\MockMeetingProvider`
- **Manager / Failover**:
  - `App\Domain\Integrations\Meetings\MeetingProviderManager` (`createMeetingWithFailover`)

## 4. Data Model (`meetings`)
- `id` (UUID, primary key)
- `title` (string)
- `description` (text, nullable)
- `provider` (string: `google_meet`, `zoom`, `mock`)
- `external_meeting_id` (string, indexed)
- `join_url` (text)
- `host_url` (text, nullable)
- `passcode` (string, nullable)
- `idempotency_key` (string, nullable, indexed)
- `start_time` (timestamp, nullable)
- `duration_minutes` (integer, default 60)
- `status` (string: `scheduled`, `in_progress`, `completed`, `cancelled`)
- `course_id` (UUID, nullable, FK to `courses`)
- `session_id` (UUID, nullable, FK to `sessions`)
- `host_staff_id` (UUID, nullable, FK to `staff`)
- `metadata` (JSON, nullable)
- `timestamps`

## 5. Endpoints
- `GET /api/v1/meetings`: List meetings (filtered by course, session, status) [`tenant.can:meetings.view`]
- `POST /api/v1/meetings`: Create a scheduled or instant meeting [`tenant.can:meetings.create`]
- `GET /api/v1/meetings/{id}`: View meeting details [`tenant.can:meetings.view`]
- `GET /api/v1/meetings/{id}/join`: Get authenticated role-specific join URL [`tenant.can:meetings.view`]
- `POST /api/v1/meetings/{id}/cancel`: Cancel scheduled meeting [`tenant.can:meetings.manage`]
- `POST /api/v1/integrations/webhooks/{provider}`: Handle provider status lifecycle events (signed webhook)

## 6. Verification Status
- **Status**: `VERIFIED`
- **Gate Tests**:
  - `Tests\Feature\IntegrationGateTest` (Phase J §40 Gate)
  - `Tests\Feature\GoogleServicesIntegrationTest` (Google Meet Code Generation, Custom URLs & Config)
- **UI Hubs**:
  - Teacher: `/teacher/meetings` (Create, schedule, host launch, student copy link, and cancel)
  - Student: `/student/meetings` (Live virtual room and direct Google Meet launch)
