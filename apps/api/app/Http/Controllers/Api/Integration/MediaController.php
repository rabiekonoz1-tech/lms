<?php

namespace App\Http\Controllers\Api\Integration;

use App\Domain\Integrations\DTOs\VideoUploadRequest;
use App\Domain\Integrations\Exceptions\ProviderException;
use App\Domain\Integrations\Exceptions\ProviderTimeoutException;
use App\Domain\Integrations\Media\VideoProviderManager;
use App\Http\Controllers\Controller;
use App\Models\MediaAsset;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MediaController extends Controller
{
    /**
     * List registered media assets.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MediaAsset::query()->with(['course', 'lesson']);

        if ($request->has('course_id')) {
            $query->where('course_id', $request->query('course_id'));
        }

        if ($request->has('lesson_id')) {
            $query->where('lesson_id', $request->query('lesson_id'));
        }

        if ($request->has('media_type')) {
            $query->where('media_type', $request->query('media_type'));
        }

        $assets = $query->orderBy('created_at', 'desc')->get();

        return ApiResponse::success(['media_assets' => $assets]);
    }

    /**
     * Register or upload a new media asset.
     */
    public function store(Request $request, VideoProviderManager $providerManager): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'provider' => 'nullable|string|in:google_drive,vimeo,mock',
            'external_id' => 'nullable|string|max:255',
            'media_type' => 'nullable|string|in:video,audio,document',
            'course_id' => 'nullable|uuid|exists:tenant.courses,id',
            'lesson_id' => 'nullable|uuid|exists:tenant.lessons,id',
            'metadata' => 'nullable|array',
            'enable_failover' => 'nullable|boolean',
        ]);

        $uploadRequest = VideoUploadRequest::fromArray($validated);
        $providerName = $validated['provider'] ?? 'mock';
        $enableFailover = $validated['enable_failover'] ?? false;

        try {
            if ($enableFailover) {
                $priority = [$providerName];
                if ($providerName !== 'mock') {
                    $priority[] = 'mock';
                }
                $response = $providerManager->uploadWithFailover($uploadRequest, $priority);
            } else {
                $provider = $providerManager->provider($providerName);
                $response = $provider->uploadVideo($uploadRequest);
            }
        } catch (ProviderTimeoutException $e) {
            return ApiResponse::error('PROVIDER_TIMEOUT', $e->getMessage(), Response::HTTP_GATEWAY_TIMEOUT);
        } catch (ProviderException $e) {
            return ApiResponse::error('PROVIDER_ERROR', $e->getMessage(), Response::HTTP_BAD_GATEWAY);
        }

        $media = MediaAsset::create([
            'title' => $validated['title'],
            'provider' => $response->provider,
            'external_media_id' => $response->externalVideoId,
            'media_type' => $validated['media_type'] ?? 'video',
            'embed_url' => $response->embedUrl,
            'playback_url' => $response->playbackUrl,
            'status' => $response->status,
            'course_id' => $validated['course_id'] ?? null,
            'lesson_id' => $validated['lesson_id'] ?? null,
            'size_bytes' => $response->sizeBytes,
            'duration_seconds' => $response->durationSeconds,
            'metadata' => $response->rawPayload,
        ]);

        return ApiResponse::success(['media_asset' => $media], Response::HTTP_CREATED);
    }

    /**
     * Show media asset details.
     */
    public function show(string $id): JsonResponse
    {
        $media = MediaAsset::with(['course', 'lesson'])->findOrFail($id);

        return ApiResponse::success(['media_asset' => $media]);
    }

    /**
     * Get embed URL for player.
     */
    public function embedUrl(string $id, VideoProviderManager $providerManager): JsonResponse
    {
        $media = MediaAsset::findOrFail($id);

        $provider = $providerManager->provider($media->provider);
        $embedUrl = $provider->getEmbedUrl($media->external_media_id);

        return ApiResponse::success([
            'media_id' => $media->id,
            'external_media_id' => $media->external_media_id,
            'provider' => $media->provider,
            'embed_url' => $embedUrl,
            'status' => $media->status,
        ]);
    }
}
