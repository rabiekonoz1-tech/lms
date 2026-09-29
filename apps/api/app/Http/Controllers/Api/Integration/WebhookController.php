<?php

namespace App\Http\Controllers\Api\Integration;

use App\Domain\Integrations\Media\VideoProviderManager;
use App\Domain\Integrations\Meetings\MeetingProviderManager;
use App\Http\Controllers\Controller;
use App\Models\IntegrationWebhookLog;
use App\Models\MediaAsset;
use App\Models\Meeting;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class WebhookController extends Controller
{
    /**
     * Handle incoming webhooks from external providers.
     */
    public function handle(
        Request $request,
        string $provider,
        MeetingProviderManager $meetingManager,
        VideoProviderManager $videoManager
    ): JsonResponse {
        $rawPayload = $request->getContent();
        $payloadData = $request->json()->all();
        $signature = $request->header('X-Signature')
            ?? $request->header('X-Hub-Signature-256')
            ?? $request->header('X-Zoom-Signature')
            ?? '';

        $secret = config('services.integrations.webhook_secret', 'secret-key-123');

        // Resolve provider to verify signature
        $adapter = null;
        try {
            $adapter = $meetingManager->provider($provider);
        } catch (\Throwable) {
            try {
                $adapter = $videoManager->provider($provider);
            } catch (\Throwable) {
                return ApiResponse::error('UNKNOWN_PROVIDER', "Unknown provider [{$provider}]", Response::HTTP_BAD_REQUEST);
            }
        }

        $isValid = $adapter->verifyWebhookSignature($rawPayload, $signature, $secret);

        if (! $isValid) {
            IntegrationWebhookLog::create([
                'provider' => $provider,
                'event_type' => $payloadData['event'] ?? 'unknown',
                'payload' => $payloadData,
                'signature' => $signature,
                'status' => 'invalid_signature',
            ]);

            return ApiResponse::error('INVALID_SIGNATURE', 'Invalid webhook signature', Response::HTTP_UNAUTHORIZED);
        }

        // Process valid webhook event
        $eventType = $payloadData['event'] ?? 'unknown';

        if (isset($payloadData['meeting_id'])) {
            $meeting = Meeting::where('external_meeting_id', $payloadData['meeting_id'])->first();
            if ($meeting) {
                if ($eventType === 'meeting.ended') {
                    $meeting->update(['status' => 'completed']);
                } elseif ($eventType === 'meeting.started') {
                    $meeting->update(['status' => 'in_progress']);
                }
            }
        }

        if (isset($payloadData['video_id'])) {
            $media = MediaAsset::where('external_media_id', $payloadData['video_id'])->first();
            if ($media) {
                if ($eventType === 'video.ready') {
                    $media->update(['status' => 'ready']);
                } elseif ($eventType === 'video.failed') {
                    $media->update(['status' => 'failed']);
                }
            }
        }

        $log = IntegrationWebhookLog::create([
            'provider' => $provider,
            'event_type' => $eventType,
            'payload' => $payloadData,
            'signature' => $signature,
            'status' => 'processed',
        ]);

        return ApiResponse::success([
            'message' => 'Webhook processed successfully.',
            'log_id' => $log->id,
            'event' => $eventType,
        ]);
    }
}
