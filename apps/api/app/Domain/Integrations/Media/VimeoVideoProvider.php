<?php

namespace App\Domain\Integrations\Media;

use App\Domain\Integrations\Contracts\VideoProviderInterface;
use App\Domain\Integrations\DTOs\VideoUploadRequest;
use App\Domain\Integrations\DTOs\VideoUploadResponse;

class VimeoVideoProvider implements VideoProviderInterface
{
    public function getProviderName(): string
    {
        return 'vimeo';
    }

    public function getEmbedUrl(string $externalVideoId, array $options = []): string
    {
        return "https://player.vimeo.com/video/{$externalVideoId}";
    }

    public function uploadVideo(VideoUploadRequest $request): VideoUploadResponse
    {
        $id = $request->externalId ?: (string) rand(100000000, 999999999);

        return new VideoUploadResponse(
            externalVideoId: $id,
            embedUrl: $this->getEmbedUrl($id),
            playbackUrl: "https://vimeo.com/{$id}",
            status: 'ready',
            provider: 'vimeo',
            durationSeconds: 120,
            sizeBytes: 5242880,
            rawPayload: [
                'uri' => "/videos/{$id}",
                'name' => $request->title,
                'status' => 'available',
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
