<?php

namespace App\Http\Controllers\Api\Billing;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PackageController extends Controller
{
    /**
     * List packages.
     */
    public function index(): JsonResponse
    {
        $packages = Package::with('entitlements')->where('status', 'active')->get();

        return ApiResponse::success(['packages' => $packages]);
    }

    /**
     * Create a package.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'currency' => 'nullable|string|max:10',
            'billing_cycle' => 'nullable|string|in:monthly,term,yearly',
            'entitlements' => 'nullable|array',
            'entitlements.*' => 'string',
        ]);

        $package = Package::create([
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'currency' => $validated['currency'] ?? 'EGP',
            'billing_cycle' => $validated['billing_cycle'] ?? 'monthly',
            'status' => 'active',
        ]);

        if (! empty($validated['entitlements'])) {
            foreach ($validated['entitlements'] as $key) {
                $package->entitlements()->create([
                    'entitlement_key' => $key,
                    'value' => 'enabled',
                ]);
            }
        }

        return ApiResponse::success(['package' => $package->load('entitlements')], Response::HTTP_CREATED);
    }

    /**
     * Show a package.
     */
    public function show(string $id): JsonResponse
    {
        $package = Package::with('entitlements')->findOrFail($id);

        return ApiResponse::success(['package' => $package]);
    }
}
