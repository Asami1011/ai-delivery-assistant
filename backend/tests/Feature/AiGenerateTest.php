<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiGenerateTest extends TestCase
{
    public function test_returns_a_demo_response_when_openai_api_key_is_not_configured(): void
    {
        Config::set('services.openai.api_key', null);

        $response = $this->postJson('/api/ai/generate', [
            'feature' => 'requirements',
            'input' => json_encode([
                'product_name' => 'AI Delivery Assistant',
                'background' => '要件定義からタスク分解までを支援したい。',
                'problem' => '初期整理に時間がかかる。',
                'target_users' => '個人開発者',
                'goal' => '要件定義の初稿を短時間で作りたい。',
                'constraints' => 'MVPでは最小構成。',
                'output_level' => 'standard',
                'notes' => 'ポートフォリオ用途。',
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.feature', 'requirements')
            ->assertJsonPath('data.mode', 'demo')
            ->assertJsonPath('data.model', config('services.openai.model'))
            ->assertJsonPath('meta.stored', false)
            ->assertJsonStructure([
                'data' => [
                    'feature',
                    'mode',
                    'model',
                    'output_markdown',
                ],
                'meta' => [
                    'stored',
                ],
            ]);

        $outputMarkdown = $response->json('data.output_markdown');

        $this->assertIsString($outputMarkdown);
        $this->assertStringContainsString('## 機能要件', $outputMarkdown);
        $this->assertStringContainsString('## 非機能要件', $outputMarkdown);
        $this->assertStringContainsString('## 未確定事項', $outputMarkdown);
    }

    public function test_validates_feature_and_input(): void
    {
        $response = $this->postJson('/api/ai/generate', [
            'feature' => 'unknown',
            'input' => '',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'feature',
                'input',
            ]);
    }

    public function test_validation_errors_are_json_for_plain_post_requests(): void
    {
        $response = $this->post('/api/ai/generate', [
            'feature' => 'unknown',
            'input' => '',
        ]);

        $response
            ->assertUnprocessable()
            ->assertHeader('content-type', 'application/json')
            ->assertJsonValidationErrors([
                'feature',
                'input',
            ]);
    }

    public function test_openai_api_failures_are_json(): void
    {
        Config::set('services.openai.api_key', 'test-api-key');
        Http::fake([
            '*' => Http::response([
                'error' => [
                    'message' => 'Upstream failure',
                ],
            ], 500),
        ]);

        $response = $this->postJson('/api/ai/generate', [
            'feature' => 'requirements',
            'input' => 'AI delivery assistant project',
        ]);

        $response
            ->assertStatus(503)
            ->assertJson([
                'message' => 'AI generation failed.',
                'errors' => [
                    'detail' => 'OpenAI API request failed with status 500.',
                ],
            ]);
    }
}
