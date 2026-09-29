<?php

namespace App\Domain\Integrations\DTOs;

use DateTimeInterface;

class MeetingRequest
{
    public function __construct(
        public readonly string $title,
        public readonly ?string $description = null,
        public readonly ?DateTimeInterface $startTime = null,
        public readonly int $durationMinutes = 60,
        public readonly ?string $hostEmail = null,
        public readonly array $settings = [],
        public readonly ?string $idempotencyKey = null,
    ) {}

    public static function fromArray(array $data): self
    {
        $startTime = isset($data['start_time'])
            ? new \DateTimeImmutable($data['start_time'])
            : null;

        return new self(
            title: $data['title'],
            description: $data['description'] ?? null,
            startTime: $startTime,
            durationMinutes: (int) ($data['duration_minutes'] ?? 60),
            hostEmail: $data['host_email'] ?? null,
            settings: $data['settings'] ?? [],
            idempotencyKey: $data['idempotency_key'] ?? null,
        );
    }
}
