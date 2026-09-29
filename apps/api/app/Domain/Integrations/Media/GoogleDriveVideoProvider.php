<?php

namespace App\Domain\Integrations\Media;

use App\Domain\Integrations\Contracts\VideoProviderInterface;
use App\Domain\Integrations\DTOs\VideoUploadRequest;
use App\Domain\Integrations\DTOs\VideoUploadResponse;
use Illuminate\Support\Str;

class GoogleDriveVideoProvider implements VideoProviderInterface
{
    public function getProviderName(): string
    {
        return 'google_drive';
    }

    public function getEmbedUrl(string $externalVideoId, array $options = []): string
    {
        return "https://drive.google.com/file/d/{$externalVideoId}/preview";
    }

    public function uploadVideo(VideoUploadRequest $request): VideoUploadResponse
    {
        $id = $request->externalId ?: Str::random(28);

        return new VideoUploadResponse(
            externalVideoId: $id,
            embedUrl: $this->getEmbedUrl($id),
            playbackUrl: "https://drive.google.com/file/d/{$id}/view",
            status: 'ready',
            provider: 'google_drive',
            durationSeconds: null,
            sizeBytes: null,
            rawPayload: [
                'fileId' => $id,
                'name' => $request->title,
                'mimeType' => 'video/mp4',
            ]
        );
    }

    public function getVideoStatus(string $externalVideoId): string
    {
        return 'ready';
    }

    public function verifyWebhookSignature(string $payload, string $signature, string $secret): bool
    {
        $computed = hash_hmac('sha256', $payload, $secret);

        return hash_equals($computed, $signature);
    }
}
