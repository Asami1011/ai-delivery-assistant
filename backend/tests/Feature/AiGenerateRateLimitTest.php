<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class AiGenerateRateLimitTest extends TestCase
{
    public function test_limits_ai_generation_per_minute_by_ip(): void
    {
        Config::set('services.openai.api_key', null);
        Config::set('services.openai.rate_limit_per_minute', 2);
        Config::set('services.openai.rate_limit_per_day', 10);

        $payload = ['feature' => 'requirements', 'input' => 'Test input'];

        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.10'])
            ->postJson('/api/ai/generate', $payload)->assertOk();
        $this->postJson('/api/ai/generate', $payload)->assertOk();
        $this->postJson('/api/ai/generate', $payload)
            ->assertStatus(429)
            ->assertHeader('Retry-After');

        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.11'])
            ->postJson('/api/ai/generate', $payload)->assertOk();
    }

    public function test_limits_ai_generation_per_day_by_ip(): void
    {
        Config::set('services.openai.api_key', null);
        Config::set('services.openai.rate_limit_per_minute', 10);
        Config::set('services.openai.rate_limit_per_day', 2);

        $payload = ['feature' => 'requirements', 'input' => 'Test input'];

        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.20'])
            ->postJson('/api/ai/generate', $payload)->assertOk();
        $this->postJson('/api/ai/generate', $payload)->assertOk();
        $this->postJson('/api/ai/generate', $payload)
            ->assertStatus(429)
            ->assertHeader('Retry-After');
    }
}
