<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiErrorHandlingTest extends TestCase
{
    public function test_api_not_found_errors_are_json(): void
    {
        $response = $this->getJson('/api/unknown-endpoint');

        $response
            ->assertNotFound()
            ->assertJson([
                'message' => 'API endpoint not found.',
                'errors' => [],
            ]);
    }

    public function test_api_method_not_allowed_errors_are_json(): void
    {
        $response = $this->getJson('/api/ai/generate');

        $response
            ->assertStatus(405)
            ->assertJson([
                'message' => 'HTTP method not allowed.',
                'errors' => [],
            ]);
    }
}
