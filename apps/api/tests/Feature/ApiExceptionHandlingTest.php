<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ApiExceptionHandlingTest extends TestCase
{
    /**
     * Test not found HTTP exception returns standardized RESOURCE_NOT_FOUND envelope.
     */
    public function test_resource_not_found_returns_standard_error_envelope(): void
    {
        $response = $this->getJson('/api/v1/non-existent-endpoint');

        $response->assertStatus(404)
            ->assertHeader('X-Request-ID')
            ->assertJsonStructure([
                'error' => [
                    'code',
                    'message',
                    'details',
                ],
                'meta' => [
                    'request_id',
                    'timestamp',
                ],
            ]);

        $this->assertEquals('RESOURCE_NOT_FOUND', $response->json('error.code'));
        $this->assertEquals(
            $response->headers->get('X-Request-ID'),
            $response->json('meta.request_id')
        );
    }

    /**
     * Test method not allowed exception returns standardized METHOD_NOT_ALLOWED envelope.
     */
    public function test_method_not_allowed_returns_standard_error_envelope(): void
    {
        $response = $this->postJson('/api/v1/health');

        $response->assertStatus(405)
            ->assertHeader('X-Request-ID')
            ->assertJsonStructure([
                'error' => [
                    'code',
                    'message',
                    'details',
                ],
                'meta' => [
                    'request_id',
                    'timestamp',
                ],
            ]);

        $this->assertEquals('METHOD_NOT_ALLOWED', $response->json('error.code'));
    }

    /**
     * Test validation failure returns standardized VALIDATION_FAILED envelope with details map.
     */
    public function test_validation_exception_returns_standard_validation_failed_envelope(): void
    {
        Route::post('/api/v1/test-validation', function () {
            request()->validate([
                'email' => 'required|email',
                'name' => 'required|min:3',
            ]);

            return response()->json(['ok' => true]);
        });

        $response = $this->postJson('/api/v1/test-validation', [
            'email' => 'invalid-email',
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'error' => [
                    'code',
                    'message',
                    'details' => [
                        'email',
                        'name',
                    ],
                ],
                'meta' => [
                    'request_id',
                    'timestamp',
                ],
            ]);

        $this->assertEquals('VALIDATION_FAILED', $response->json('error.code'));
    }
}
