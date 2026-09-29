<?php

namespace App\Domain\Integrations\Meetings;

use App\Domain\Integrations\Contracts\MeetingProviderInterface;
use App\Domain\Integrations\DTOs\MeetingRequest;
use App\Domain\Integrations\DTOs\MeetingResponse;
use Illuminate\Support\Str;

class ZoomMeetingProvider implements MeetingProviderInterface
{
    public function getProviderName(): string
    {
        return 'zoom';
    }

    public function createMeeting(MeetingRequest $request): MeetingResponse
    {
        $meetingId = (string) rand(1000000000, 9999999999);
        $passcode = Str::random(8);

        return new MeetingResponse(
            externalMeetingId: $meetingId,
            joinUrl: "https://zoom.us/j/{$meetingId}?pwd={$passcode}",
            hostUrl: "https://zoom.us/s/{$meetingId}",
            passcode: $passcode,
            provider: 'zoom',
            rawPayload: [
                'id' => $meetingId,
                'topic' => $request->title,
                'type' => 2,
            ]
        );
    }

    public function getJoinUrl(string $externalMeetingId, array $userContext = []): string
    {
        return "https://zoom.us/j/{$externalMeetingId}";
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
