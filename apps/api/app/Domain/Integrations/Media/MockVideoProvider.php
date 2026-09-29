<?php

namespace App\Domain\Integrations\Media;

use App\Domain\Integrations\Contracts\VideoProviderInterface;
use App\Domain\Integrations\DTOs\VideoUploadRequest;
use App\Domain\Integrations\DTOs\VideoUploadResponse;
use App\Domain\Integrations\Exceptions\ProviderException;
use App\Domain\Integrations\Exceptions\ProviderTimeoutException;
use Illuminate\Support\Str;

class MockVideoProvider implements VideoProviderInterface
{
    protected static bool $shouldFail = false;

    protected static bool $shouldTimeout = false;

    public static function simulateFailure(bool $fail = true): void
    {
        self::$shouldFail = $fail;
    }

    public static function simulateTimeout(bool $timeout = true): void
    {
        self::$shouldTimeout = $timeout;
    }

    public static function reset(): void
    {
        self::$shouldFail = false;
        self::$shouldTimeout = false;
    }

    public function getProviderName(): string
    {
        return 'mock';
    }

    public function getEmbedUrl(string $externalVideoId, array $options = []): string
    {
        return "https://mock-video.local/embed/{$externalVideoId}";
    }

    public function uploadVideo(VideoUploadRequest $request): VideoUploadResponse
    {
        if (self::$shouldTimeout) {
            throw new ProviderTimeoutException('Mock video provider timed out', 'mock');
        }

        if (self::$shouldFail) {
            throw new ProviderException('Mock video provider failed processing', 'mock', 502);
        }

        $id = $request->externalId ?: 'v-'.Str::random(12);

        return new VideoUploadResponse(
            externalVideoId: $id,
            embedUrl: $this->getEmbedUrl($id),
            playbackUrl: "https://mock-video.local/hls/{$id}/playlist.m3u8",
            status: 'ready',
            provider: 'mock',
            durationSeconds: 360,
            sizeBytes: 10485760,
            rawPayload: [
                'id' => $id,
                'title' => $request->title,
                'status' => 'ready',
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
