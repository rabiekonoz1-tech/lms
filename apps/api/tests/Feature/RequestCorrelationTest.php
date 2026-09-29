<?php

namespace Tests\Feature;

use Illuminate\Support\Str;
use Tests\TestCase;

class RequestCorrelationTest extends TestCase
{
    /**
     * Test that incoming X-Request-ID header is preserved and echoed.
     */
    public function test_incoming_request_id_is_propagated_in_response_and_meta(): void
    {
        $customRequestId = 'req-custom-test-12345';

        $response = $this->withHeaders([
            'X-Request-ID' => $customRequestId,
        ])->getJson('/api/v1/health');

        $response->assertStatus(200);
        $this->assertEquals($customRequestId, $response->headers->get('X-Request-ID'));
        $this->assertEquals($customRequestId, $response->json('meta.request_id'));
    }

    /**
     * Test that missing X-Request-ID header generates a valid UUID.
     */
    public function test_missing_request_id_generates_valid_uuid(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200);
        $headerId = $response->headers->get('X-Request-ID');
        $metaId = $response->json('meta.request_id');

        $this->assertNotEmpty($headerId);
        $this->assertEquals($headerId, $metaId);
        $this->assertTrue(Str::isUuid($headerId));
    }
}
