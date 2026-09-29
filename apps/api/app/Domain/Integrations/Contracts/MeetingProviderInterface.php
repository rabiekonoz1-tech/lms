<?php

namespace App\Domain\Integrations\Contracts;

use App\Domain\Integrations\DTOs\MeetingRequest;
use App\Domain\Integrations\DTOs\MeetingResponse;
use App\Domain\Integrations\Exceptions\ProviderException;
use App\Domain\Integrations\Exceptions\ProviderTimeoutException;

interface MeetingProviderInterface
{
    /**
     * Get the identifier name of the provider.
     */
    public function getProviderName(): string;

    /**
     * Create a new remote meeting on the provider.
     *
     * @throws ProviderException
     * @throws ProviderTimeoutException
     */
    public function createMeeting(MeetingRequest $request): MeetingResponse;

    /**
     * Get join URL for a given external meeting ID with optional participant context.
     *
     * @throws ProviderException
     */
    public function getJoinUrl(string $externalMeetingId, array $userContext = []): string;

    /**
     * Cancel an existing meeting on the provider.
     *
     * @throws ProviderException
     */
    public function cancelMeeting(string $externalMeetingId): bool;

    /**
     * Verify the webhook signature sent by the provider.
     */
    public function verifyWebhookSignature(string $payload, string $signature, string $secret): bool;
}
