<?php

namespace App\Domain\Integrations\Meetings;

use App\Domain\Integrations\Contracts\MeetingProviderInterface;
use App\Domain\Integrations\DTOs\MeetingRequest;
use App\Domain\Integrations\DTOs\MeetingResponse;
use App\Domain\Integrations\Exceptions\ProviderException;
use App\Domain\Integrations\Exceptions\ProviderTimeoutException;
use Illuminate\Support\Str;

class MockMeetingProvider implements MeetingProviderInterface
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

    public function createMeeting(MeetingRequest $request): MeetingResponse
    {
        if (self::$shouldTimeout) {
            throw new ProviderTimeoutException('Mock provider connection timed out', 'mock');
        }

        if (self::$shouldFail) {
            throw new ProviderException('Mock provider failed to generate meeting', 'mock', 502);
        }

        $id = 'mock-'.Str::random(10);
        $passcode = Str::random(6);

        return new MeetingResponse(
            externalMeetingId: $id,
            joinUrl: 'https://mock-meet.local/'.$id,
            hostUrl: 'https://mock-meet.local/host/'.$id,
            passcode: $passcode,
            provider: 'mock',
            rawPayload: [
                'id' => $id,
                'topic' => $request->title,
                'status' => 'created',
            ]
        );
    }

    public function getJoinUrl(string $externalMeetingId, array $userContext = []): string
    {
        $role = $userContext['role'] ?? 'attendee';

        return "https://mock-meet.local/{$externalMeetingId}?role={$role}";
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
