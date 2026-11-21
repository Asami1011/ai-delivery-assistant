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

    public function test_returns_code_review_demo_sections_when_openai_api_key_is_not_configured(): void
    {
        Config::set('services.openai.api_key', null);

        $response = $this->postJson('/api/ai/generate', [
            'feature' => 'code_review',
            'input' => json_encode([
                'review_type' => 'code_diff',
                'technology' => 'Next.js / Laravel / PostgreSQL',
                'review_target' => 'AI生成フォームの入力仕様と共通UI実装をレビューしたい。',
                'review_focus' => 'バグ、セキュリティ、責務分離、テスト不足',
                'context' => 'MVP開発中。まずはMarkdown表示を優先する。',
                'output_level' => 'standard',
                'notes' => 'P0-P3の重要度順で見たい。',
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.feature', 'code_review')
            ->assertJsonPath('data.mode', 'demo');

        $outputMarkdown = $response->json('data.output_markdown');

        $this->assertIsString($outputMarkdown);
        $this->assertStringContainsString('# レビュー結果', $outputMarkdown);
        $this->assertStringContainsString('## 概要', $outputMarkdown);
        $this->assertStringContainsString('## 指摘事項', $outputMarkdown);
        $this->assertStringContainsString('### P1（重要）:', $outputMarkdown);
        $this->assertStringContainsString('## 良い点', $outputMarkdown);
        $this->assertStringContainsString('## 改善提案', $outputMarkdown);
        $this->assertStringContainsString('## テスト観点', $outputMarkdown);
        $this->assertStringContainsString('## 次に直すべき順', $outputMarkdown);
    }

    public function test_validates_code_review_input_fields(): void
    {
        $response = $this->postJson('/api/ai/generate', [
            'feature' => 'code_review',
            'input' => json_encode([
                'review_type' => 'unknown',
                'technology' => '',
                'review_target' => 'short target',
                'review_focus' => '',
                'context' => str_repeat('a', 3001),
                'output_level' => 'verbose',
                'notes' => str_repeat('b', 2001),
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'review_type',
                'technology',
                'review_target',
                'review_focus',
                'context',
                'output_level',
                'notes',
            ]);
    }

    public function test_requires_json_string_input_for_code_review_feature(): void
    {
        $response = $this->postJson('/api/ai/generate', [
            'feature' => 'code_review',
            'input' => 'not-json',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'input',
            ]);
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
