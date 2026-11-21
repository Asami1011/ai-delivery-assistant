<?php

namespace Tests\Feature;

use Illuminate\Http\Client\Request;
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

    public function test_returns_a_task_breakdown_demo_response_when_openai_api_key_is_not_configured(): void
    {
        Config::set('services.openai.api_key', null);

        $response = $this->postJson('/api/ai/generate', [
            'feature' => 'task_breakdown',
            'input' => json_encode([
                'project_name' => 'AI Delivery Assistant',
                'requirements_text' => '要件定義の結果をもとに、実装しやすいタスクへ落とし込みたい。',
                'delivery_goal' => '2週間でMVPの主要画面を確認できる状態にしたい。',
                'team_context' => '個人開発。Next.js / Laravel / PostgreSQL。',
                'constraints' => '保存機能は後続。まずは画面とAPI連携を優先する。',
                'output_level' => 'standard',
                'notes' => '優先度と依存関係が分かる形にしたい。',
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.feature', 'task_breakdown')
            ->assertJsonPath('data.mode', 'demo')
            ->assertJsonPath('data.model', config('services.openai.model'))
            ->assertJsonPath('meta.stored', false);

        $outputMarkdown = $response->json('data.output_markdown');

        $this->assertIsString($outputMarkdown);
        $this->assertStringContainsString('# AI Delivery Assistant タスク分解案（デモ）', $outputMarkdown);
        $this->assertStringContainsString('## タスク一覧', $outputMarkdown);
        $this->assertStringContainsString('## マイルストーン案', $outputMarkdown);
        $this->assertStringContainsString('## 想定成果物', $outputMarkdown);
        $this->assertStringContainsString('## リスク・注意点', $outputMarkdown);
        $this->assertStringContainsString('## 実装順の提案', $outputMarkdown);
        $this->assertStringContainsString('## 今回やらないこと', $outputMarkdown);
        $this->assertStringContainsString('## 確認観点', $outputMarkdown);
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

    public function test_task_breakdown_formats_the_openai_user_prompt(): void
    {
        Config::set('services.openai.api_key', 'test-api-key');
        Http::fake([
            '*' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => "# タスク分解案\n\n## 前提",
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->postJson('/api/ai/generate', [
            'feature' => 'task_breakdown',
            'input' => json_encode([
                'project_name' => 'AI Delivery Assistant',
                'requirements_text' => '要件定義の結果をタスクへ落とし込みたい。',
                'delivery_goal' => '2週間でMVPを確認したい。',
                'team_context' => '個人開発。Next.js / Laravel。',
                'constraints' => '保存機能は後続。',
                'output_level' => 'standard',
                'notes' => '優先度を明示したい。',
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.feature', 'task_breakdown')
            ->assertJsonPath('data.mode', 'openai');

        Http::assertSent(function (Request $request) {
            $messages = $request['messages'] ?? [];
            $userMessage = $messages[1]['content'] ?? '';

            return $request->url() === rtrim(config('services.openai.base_url'), '/').'/chat/completions'
                && ($messages[0]['role'] ?? null) === 'system'
                && ($messages[1]['role'] ?? null) === 'user'
                && str_contains($userMessage, '以下の入力情報をもとに、AIタスク分解を作成してください。')
                && str_contains($userMessage, '- 対象プロジェクト: AI Delivery Assistant')
                && str_contains($userMessage, '- 要件定義テキスト: 要件定義の結果をタスクへ落とし込みたい。')
                && str_contains($userMessage, '- 補足情報: 優先度を明示したい。');
        });
    }
}
