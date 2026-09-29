<?php

namespace App\Domain\Integrations\DTOs;

class VideoUploadResponse
{
    public function __construct(
        public readonly string $externalVideoId,
        public readonly string $embedUrl,
        public readonly ?string $playbackUrl = null,
        public readonly string $status = 'ready',
        public readonly string $provider = '',
        public readonly ?int $durationSeconds = null,
        public readonly ?int $sizeBytes = null,
        public readonly array $rawPayload = [],
    ) {}

    public function toArray(): array
    {
        return [
            'external_video_id' => $this->externalVideoId,
            'embed_url' => $this->embedUrl,
            'playback_url' => $this->playbackUrl,
            'status' => $this->status,
            'provider' => $this->provider,
            'duration_seconds' => $this->durationSeconds,
            'size_bytes' => $this->sizeBytes,
        ];
    }
}
