<?php

namespace App\Http\Controllers\Api\Integration;

use App\Domain\Integrations\DTOs\MeetingRequest;
use App\Domain\Integrations\Exceptions\ProviderException;
use App\Domain\Integrations\Exceptions\ProviderTimeoutException;
use App\Domain\Integrations\Meetings\MeetingProviderManager;
use App\Http\Controllers\Controller;
use App\Models\Meeting;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MeetingController extends Controller
{
    /**
     * List scheduled or active meetings.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Meeting::query()->with(['course', 'session', 'host']);

        if ($request->has('course_id')) {
            $query->where('course_id', $request->query('course_id'));
        }

        if ($request->has('session_id')) {
            $query->where('session_id', $request->query('session_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $meetings = $query->orderBy('start_time', 'asc')->get();

        return ApiResponse::success(['meetings' => $meetings]);
    }

    /**
     * Create a new remote meeting.
     */
    public function store(Request $request, MeetingProviderManager $providerManager): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'provider' => 'nullable|string|in:google_meet,zoom,mock',
            'start_time' => 'nullable|date',
            'duration_minutes' => 'nullable|integer|min:5|max:480',
            'idempotency_key' => 'nullable|string|max:128',
            'course_id' => 'nullable|uuid|exists:tenant.courses,id',
            'session_id' => 'nullable|uuid|exists:tenant.sessions,id',
            'host_staff_id' => 'nullable|uuid|exists:tenant.staff,id',
            'settings' => 'nullable|array',
            'enable_failover' => 'nullable|boolean',
        ]);

        // Idempotency check
        if (! empty($validated['idempotency_key'])) {
            $existing = Meeting::where('idempotency_key', $validated['idempotency_key'])->first();
            if ($existing) {
                return ApiResponse::success([
                    'meeting' => $existing,
                    'idempotent' => true,
                ], Response::HTTP_OK);
            }
        }

        $meetingRequest = MeetingRequest::fromArray($validated);
        $providerName = $validated['provider'] ?? 'mock';
        $enableFailover = $validated['enable_failover'] ?? false;

        try {
            if ($enableFailover) {
                $priority = [$providerName];
                if ($providerName !== 'mock') {
                    $priority[] = 'mock';
                }
                $response = $providerManager->createMeetingWithFailover($meetingRequest, $priority);
            } else {
                $provider = $providerManager->provider($providerName);
                $response = $provider->createMeeting($meetingRequest);
            }
        } catch (ProviderTimeoutException $e) {
            return ApiResponse::error('PROVIDER_TIMEOUT', $e->getMessage(), Response::HTTP_GATEWAY_TIMEOUT);
        } catch (ProviderException $e) {
            return ApiResponse::error('PROVIDER_ERROR', $e->getMessage(), Response::HTTP_BAD_GATEWAY);
        }

        $meeting = Meeting::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'provider' => $response->provider,
            'external_meeting_id' => $response->externalMeetingId,
            'join_url' => $response->joinUrl,
            'host_url' => $response->hostUrl,
            'passcode' => $response->passcode,
            'idempotency_key' => $validated['idempotency_key'] ?? null,
            'start_time' => $meetingRequest->startTime,
            'duration_minutes' => $meetingRequest->durationMinutes,
            'status' => 'scheduled',
            'course_id' => $validated['course_id'] ?? null,
            'session_id' => $validated['session_id'] ?? null,
            'host_staff_id' => $validated['host_staff_id'] ?? null,
            'metadata' => $response->rawPayload,
        ]);

        return ApiResponse::success(['meeting' => $meeting], Response::HTTP_CREATED);
    }

    /**
     * Show meeting details.
     */
    public function show(string $id): JsonResponse
    {
        $meeting = Meeting::with(['course', 'session', 'host'])->findOrFail($id);

        return ApiResponse::success(['meeting' => $meeting]);
    }

    /**
     * Get dynamic join URL for the meeting.
     */
    public function joinUrl(Request $request, string $id, MeetingProviderManager $providerManager): JsonResponse
    {
        $meeting = Meeting::findOrFail($id);

        $user = $request->user();
        $role = ($user && $user->staff) ? 'host' : 'attendee';

        $provider = $providerManager->provider($meeting->provider);
        $joinUrl = $provider->getJoinUrl($meeting->external_meeting_id, ['role' => $role]);

        return ApiResponse::success([
            'meeting_id' => $meeting->id,
            'external_meeting_id' => $meeting->external_meeting_id,
            'provider' => $meeting->provider,
            'join_url' => $joinUrl,
            'passcode' => $meeting->passcode,
            'status' => $meeting->status,
        ]);
    }

    /**
     * Cancel scheduled meeting.
     */
    public function cancel(string $id, MeetingProviderManager $providerManager): JsonResponse
    {
        $meeting = Meeting::findOrFail($id);

        try {
            $provider = $providerManager->provider($meeting->provider);
            $provider->cancelMeeting($meeting->external_meeting_id);
        } catch (\Throwable) {
            // Log provider failure but proceed to cancel internal record
        }

        $meeting->update(['status' => 'cancelled']);

        return ApiResponse::success([
            'meeting' => $meeting,
            'message' => 'Meeting cancelled successfully.',
        ]);
    }
}
