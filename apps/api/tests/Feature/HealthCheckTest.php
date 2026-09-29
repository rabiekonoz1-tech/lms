<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    /**
     * Test the API health endpoint returns healthy status and standard envelope.
     */
    public function test_health_check_returns_healthy_envelope(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertHeader('X-Request-ID')
            ->assertJsonStructure([
                'data' => [
                    'status',
                    'services' => [
                        'database',
                        'cache',
                    ],
                    'version',
                    'environment',
                ],
                'meta' => [
                    'request_id',
                    'timestamp',
                ],
            ]);

        $this->assertEquals('healthy', $response->json('data.status'));
        $this->assertEquals('ok', $response->json('data.services.database'));
        $this->assertEquals('ok', $response->json('data.services.cache'));
        $this->assertEquals(
            $response->headers->get('X-Request-ID'),
            $response->json('meta.request_id')
        );
    }
}
