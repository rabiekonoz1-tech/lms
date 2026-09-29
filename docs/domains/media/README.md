# Media Domain

## 1. Overview
The Media Domain provides a provider-agnostic infrastructure for educational media assets (lesson videos, recorded lectures, audio resources, and downloadable materials). Supported video providers include Vimeo, Google Drive, BunnyCDN, and Mock.
Per Phase J §38–§40:
- Provider abstraction: `Domain Contract -> Application Interface -> Provider Adapter -> External SDK`.
- Core learning domain does not depend directly on specific video vendor classes.
- Video playback & embed URLs are dynamically resolved with failover and permission enforcement.

## 2. Invariants
- `MediaAsset ≠ Lesson`: A Lesson can reference zero, one, or multiple media assets; a media asset can exist in the library independently of lessons.
- `Vendor-Agnostic Embed Generation`: Frontend players receive standard embed/playback URLs through the provider abstraction layer.
- `Tenant Isolation`: Media assets are stored per tenant and cannot be accessed or embedded across tenant boundaries without explicit cross-tenant entitlement.
- `Webhook Integrity`: Provider video processing callbacks must authenticate using HMAC signatures.

## 3. Architecture & Interfaces
- **Contract**: `App\Domain\Integrations\Contracts\VideoProviderInterface`
  - `getProviderName(): string`
  - `getEmbedUrl(string $externalVideoId, array $options = []): string`
  - `uploadVideo(VideoUploadRequest $request): VideoUploadResponse`
  - `getVideoStatus(string $externalVideoId): string`
  - `verifyWebhookSignature(string $payload, string $signature, string $secret): bool`
- **Adapters**:
  - `App\Domain\Integrations\Media\VimeoVideoProvider`
  - `App\Domain\Integrations\Media\GoogleDriveVideoProvider`
  - `App\Domain\Integrations\Media\MockVideoProvider`
- **Manager / Failover**:
  - `App\Domain\Integrations\Media\VideoProviderManager` (`uploadWithFailover`)

## 4. Data Model (`media_assets`)
- `id` (UUID, primary key)
- `title` (string)
- `provider` (string: `vimeo`, `google_drive`, `mock`)
- `external_media_id` (string, indexed)
- `media_type` (string: `video`, `audio`, `document`, default `video`)
- `embed_url` (text, nullable)
- `playback_url` (text, nullable)
- `status` (string: `uploading`, `processing`, `ready`, `failed`)
- `course_id` (UUID, nullable, FK to `courses`)
- `lesson_id` (UUID, nullable, FK to `lessons`)
- `size_bytes` (bigint, unsigned, nullable)
- `duration_seconds` (integer, nullable)
- `metadata` (JSON, nullable)
- `timestamps`

## 5. Endpoints
- `GET /api/v1/media`: List media assets (filter by course, lesson, media type) [`tenant.can:media.view`]
- `POST /api/v1/media`: Register or upload new media asset [`tenant.can:media.upload`]
- `GET /api/v1/media/{id}`: View media asset details [`tenant.can:media.view`]
- `GET /api/v1/media/{id}/embed`: Retrieve secure player embed URL [`tenant.can:media.view`]
- `POST /api/v1/integrations/webhooks/{provider}`: Handle media processing webhook callbacks

## 6. Verification Status
- **Status**: `VERIFIED`
- **Gate Test**: `Tests\Feature\IntegrationGateTest` (Phase J §40 Gate)
