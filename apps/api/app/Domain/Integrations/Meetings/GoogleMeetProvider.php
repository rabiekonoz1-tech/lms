<?php

namespace App\Domain\Integrations\Meetings;

use App\Domain\Integrations\Contracts\MeetingProviderInterface;
use App\Domain\Integrations\DTOs\MeetingRequest;
use App\Domain\Integrations\DTOs\MeetingResponse;

class GoogleMeetProvider implements MeetingProviderInterface
{
    public function getProviderName(): string
    {
        return 'google_meet';
    }

    public function createMeeting(MeetingRequest $request): MeetingResponse
    {
        $customCode = $request->settings['meeting_code'] ?? $request->settings['meet_url'] ?? null;
        if (! empty($customCode)) {
            $spaceCode = $this->extractMeetingCode((string) $customCode);
        } else {
            $spaceCode = $this->generateSpaceCode();
        }

        $clientId = config('services.google.client_id');

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
                'client_id_configured' => ! empty($clientId),
                'google_service' => 'meet',
            ]
        );
    }

    /**
     * Generate Google Meet compliant alpha-only space code: aaa-bbbb-ccc
     */
    public function generateSpaceCode(): string
    {
        $letters = 'abcdefghijklmnopqrstuvwxyz';
        $gen = function (int $len) use ($letters) {
            $res = '';
            for ($i = 0; $i < $len; $i++) {
                $res .= $letters[random_int(0, 25)];
            }

            return $res;
        };

        return "{$gen(3)}-{$gen(4)}-{$gen(3)}";
    }

    /**
     * Extract clean Google Meet code from input string or URL.
     */
    public function extractMeetingCode(string $input): string
    {
        $input = trim($input);
        if (preg_match('#meet\.google\.com/([a-z]{3}-[a-z]{4}-[a-z]{3})#i', $input, $matches)) {
            return strtolower($matches[1]);
        }
        if (preg_match('#^[a-z]{3}-[a-z]{4}-[a-z]{3}$#i', $input)) {
            return strtolower($input);
        }

        return $input;
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
