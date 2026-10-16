<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NotificationController extends Controller
{
    /**
     * List user's notifications.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = $user->notifications()->paginate(15);
        $unreadCount = $user->unreadNotifications()->count();

        return ApiResponse::success([
            'notifications' => $notifications->items(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'total' => $notifications->total(),
                'unread_count' => $unreadCount,
            ],
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $notification = $user->notifications()->where('id', $id)->first();

        if (! $notification) {
            return ApiResponse::error('NOTIFICATION_NOT_FOUND', 'Notification not found.', Response::HTTP_NOT_FOUND);
        }

        $notification->markAsRead();

        return ApiResponse::success([
            'message' => 'Notification marked as read.',
        ]);
    }

    /**
     * Mark all unread notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->unreadNotifications()->update(['read_at' => now()]);

        return ApiResponse::success([
            'message' => 'All notifications marked as read.',
        ]);
    }
}
