<?php

namespace App\Domain\Integrations\Contracts;

use App\Domain\Integrations\DTOs\VideoUploadRequest;
use App\Domain\Integrations\DTOs\VideoUploadResponse;
use App\Domain\Integrations\Exceptions\ProviderException;
use App\Domain\Integrations\Exceptions\ProviderTimeoutException;

interface VideoProviderInterface
{
    /**
     * Get the identifier name of the provider.
     */
    public function getProviderName(): string;

    /**
     * Get a secure / embeddable URL for a given external video ID.
     *
     * @throws ProviderException
     */
    public function getEmbedUrl(string $externalVideoId, array $options = []): string;

    /**
     * Upload or register a video with the provider.
     *
     * @throws ProviderException
     * @throws ProviderTimeoutException
     */
    public function uploadVideo(VideoUploadRequest $request): VideoUploadResponse;

    /**
     * Get status of video on provider (ready, processing, failed).
     *
     * @throws ProviderException
     */
    public function getVideoStatus(string $externalVideoId): string;

    /**
     * Verify the webhook signature sent by the provider.
     */
    public function verifyWebhookSignature(string $payload, string $signature, string $secret): bool;
}
