<?php

namespace App\Domain\Integrations\DTOs;

class MeetingResponse
{
    public function __construct(
        public readonly string $externalMeetingId,
        public readonly string $joinUrl,
        public readonly ?string $hostUrl = null,
        public readonly ?string $passcode = null,
        public readonly string $provider = '',
        public readonly array $rawPayload = [],
    ) {}

    public function toArray(): array
    {
        return [
            'external_meeting_id' => $this->externalMeetingId,
            'join_url' => $this->joinUrl,
            'host_url' => $this->hostUrl,
            'passcode' => $this->passcode,
            'provider' => $this->provider,
        ];
    }
}
