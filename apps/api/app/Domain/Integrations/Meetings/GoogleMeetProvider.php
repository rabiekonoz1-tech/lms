<?php

namespace App\Domain\Integrations\Meetings;

use App\Domain\Integrations\Contracts\MeetingProviderInterface;
use App\Domain\Integrations\DTOs\MeetingRequest;
use App\Domain\Integrations\DTOs\MeetingResponse;
use Illuminate\Support\Str;

class GoogleMeetProvider implements MeetingProviderInterface
{
    public function getProviderName(): string
    {
        return 'google_meet';
    }

    public function createMeeting(MeetingRequest $request): MeetingResponse
    {
        // Google Meet space/meeting code format: aaa-bbbb-ccc
        $part1 = Str::lower(Str::random(3));
        $part2 = Str::lower(Str::random(4));
        $part3 = Str::lower(Str::random(3));
        $spaceCode = "{$part1}-{$part2}-{$part3}";

        return new MeetingResponse(
            externalMeetingId: $spaceCode,
            joinUrl: "https://meet.google.com/{$spaceCode}",
            hostUrl: "https://meet.google.com/{$spaceCode}?authuser=host",
            passcode: null,
            provider: 'google_meet',
            rawPayload: [
                'spaceUri' => "https://meet.google.com/{$spaceCode}",
                'meetingCode' => $spaceCode,
                'conferenceRecord' => 'spaces/'.$spaceCode,
            ]
        );
    }

    public function getJoinUrl(string $externalMeetingId, array $userContext = []): string
    {
        return "https://meet.google.com/{$externalMeetingId}";
    }

    public function cancelMeeting(string $externalMeetingId): bool
    {
        return true;
    }

    public function verifyWebhookSignature(string $payload, string $signature, string $secret): bool
    {
        $computed = hash_hmac('sha256', $payload, $secret);

        return hash_equals($computed, $signature);
    }
}
