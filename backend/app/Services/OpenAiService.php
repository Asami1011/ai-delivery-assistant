<?php

namespace App\Services;

use App\Exceptions\AiGenerationException;
use Illuminate\Support\Facades\Http;

class OpenAiService
{
    /**
     * @return array<string, mixed>
     */
    public function generate(string $feature, string $input): array
    {
        $apiKey = config('services.openai.api_key');
        $model = config('services.openai.model');

        if (blank($apiKey)) {
            return $this->demoResponse($feature, $input, $model);
        }

        return $this->openAiResponse($feature, $input, $apiKey, $model);
    }

    /**
     * @return array<string, mixed>
     */
    private function openAiResponse(string $feature, string $input, string $apiKey, string $model): array
    {
        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->timeout(30)
            ->post(rtrim(config('services.openai.base_url'), '/').'/chat/completions', [
                'model' => $model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $this->systemPrompt($feature),
                    ],
                    [
                        'role' => 'user',
                        'content' => $input,
                    ],
                ],
                'temperature' => 0.2,
        ]);

        if ($response->failed()) {
            throw new AiGenerationException('OpenAI API request failed with status '.$response->status().'.');
        }

        $content = data_get($response->json(), 'choices.0.message.content');

        if (! is_string($content) || trim($content) === '') {
            throw new AiGenerationException('OpenAI API response did not include generated content.');
        }

        return [
            'feature' => $feature,
            'mode' => 'openai',
            'model' => $model,
            'output_markdown' => $content,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function demoResponse(string $feature, string $input, string $model): array
    {
        return [
            'feature' => $feature,
            'mode' => 'demo',
            'model' => $model,
            'output_markdown' => $this->demoMarkdown($feature, $input),
        ];
    }

    private function systemPrompt(string $feature): string
    {
        return match ($feature) {
            'requirements' => 'You generate concise Japanese requirements definition documents in Markdown.',
            'task_breakdown' => 'You break Japanese requirements into prioritized implementation tasks in Markdown.',
            'code_review' => 'You review code and design notes in Japanese with severity and remediation steps in Markdown.',
            'business_improvement' => 'You propose Japanese business process improvements with expected effects in Markdown.',
            default => 'You generate helpful Japanese Markdown output.',
        };
    }

    private function demoMarkdown(string $feature, string $input): string
    {
        $excerpt = str($input)->squish()->limit(120)->toString();

        return match ($feature) {
            'requirements' => <<<MARKDOWN
                # AI要件定義 Demo

                ## 入力概要
                {$excerpt}

                ## 生成内容
                - 目的、対象ユーザー、機能要件、非機能要件を整理します。
                - OpenAI APIキー未設定のため、現在はデモレスポンスです。
                MARKDOWN,
            'task_breakdown' => <<<MARKDOWN
                # AIタスク分解 Demo

                ## 入力概要
                {$excerpt}

                ## 生成内容
                - タスク、優先順位、工数見積、完了条件を整理します。
                - OpenAI APIキー未設定のため、現在はデモレスポンスです。
                MARKDOWN,
            'code_review' => <<<MARKDOWN
                # AIレビュア Demo

                ## 入力概要
                {$excerpt}

                ## 生成内容
                - バグ、保守性、セキュリティ、テスト観点でレビューします。
                - OpenAI APIキー未設定のため、現在はデモレスポンスです。
                MARKDOWN,
            'business_improvement' => <<<MARKDOWN
                # AI業務改善提案 Demo

                ## 入力概要
                {$excerpt}

                ## 生成内容
                - ボトルネック、改善案、自動化候補、期待効果を整理します。
                - OpenAI APIキー未設定のため、現在はデモレスポンスです。
                MARKDOWN,
            default => <<<MARKDOWN
                # AI生成 Demo

                ## 入力概要
                {$excerpt}

                OpenAI APIキー未設定のため、現在はデモレスポンスです。
                MARKDOWN,
        };
    }
}
