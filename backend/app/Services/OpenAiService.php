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
        $excerpt = trim($input);

        return match ($feature) {
            'requirements' => $this->demoRequirementsMarkdown($input),
            'task_breakdown' => <<<MARKDOWN
                # AIタスク分解 Demo

                ## 入力概要
                ```
                {$excerpt}
                ```

                ## 生成内容
                - タスク、優先度、工数見積のサンプル構成を返します。
                - OpenAI APIキー未設定のため、現在はデモレスポンスです。
                MARKDOWN,
            'code_review' => <<<MARKDOWN
                # AIレビュア Demo

                ## 入力概要
                ```
                {$excerpt}
                ```

                ## 生成内容
                - バグ、保守性、セキュリティ、テスト観点のサンプルレビューを返します。
                - OpenAI APIキー未設定のため、現在はデモレスポンスです。
                MARKDOWN,
            'business_improvement' => <<<MARKDOWN
                # AI業務改善提案 Demo

                ## 入力概要
                ```
                {$excerpt}
                ```

                ## 生成内容
                - ボトルネック、改善案、期待効果のサンプル提案を返します。
                - OpenAI APIキー未設定のため、現在はデモレスポンスです。
                MARKDOWN,
            default => <<<MARKDOWN
                # AI生成 Demo

                ## 入力概要
                ```
                {$excerpt}
                ```

                OpenAI APIキー未設定のため、現在はデモレスポンスです。
                MARKDOWN,
        };
    }

    private function demoRequirementsMarkdown(string $input): string
    {
        $data = $this->parseStructuredInput($input);

        $productName = $this->fieldValue($data, 'product_name', '新規プロダクト');
        $background = $this->fieldValue($data, 'background', trim($input) !== '' ? trim($input) : '背景情報は未入力です。');
        $problem = $this->fieldValue($data, 'problem', '解決したい課題は未入力です。');
        $targetUsers = $this->fieldValue($data, 'target_users', '想定ユーザーは未入力です。');
        $goal = $this->fieldValue($data, 'goal', '目的は未入力です。');
        $constraints = $this->fieldValue($data, 'constraints', '大きな制約条件はまだ整理されていません。');
        $notes = $this->fieldValue($data, 'notes', '補足情報はありません。');
        $outputLevel = $this->fieldValue($data, 'output_level', 'standard');

        $detailLine = match ($outputLevel) {
            'short' => 'MVP向けに、短く判断しやすい粒度で要件を整理します。',
            'detailed' => '詳細設計に渡しやすいよう、要件の粒度を少し細かめに整理します。',
            default => 'MVPと次工程の両方で使いやすいよう、標準的な粒度で整理します。',
        };

        return <<<MARKDOWN
            # {$productName} 要件定義（デモ）

            ## 概要
            - {$productName} に関する要件定義のたたき台です。
            - デモモードのため、入力内容をもとに本番想定の構成で整形しています。
            - {$detailLine}

            ## 背景
            {$background}

            ## 解決すべき課題
            - {$problem}

            ## 目的
            - {$goal}

            ## 想定ユーザー
            - {$targetUsers}

            ## 機能要件
            - 背景・課題・目的を入力し、要件定義をMarkdown形式で生成できること
            - 生成結果を後続のタスク分解やレビュー工程で再利用できる構成にすること
            - ユーザーが入力内容と生成結果を同じ画面で確認できること

            ## 非機能要件
            - 要件定義結果は読みやすいMarkdown形式で表示されること
            - APIキー未設定時でもデモレスポンスで画面確認ができること
            - 将来的に保存、履歴、SaaS化へ拡張しやすい構成であること

            ## 制約条件
            - {$constraints}

            ## 成功指標
            - {$goal}
            - 入力した背景と課題が、生成結果の中で一貫して整理されていること

            ## 補足情報
            - {$notes}

            ## 未確定事項
            - OpenAI APIキー未設定のため、現在はデモレスポンスです
            - 本番AI利用時のプロンプト品質、モデル選定、出力精度は別途実機検証が必要です
            MARKDOWN;
    }

    /**
     * @return array<string, mixed>
     */
    private function parseStructuredInput(string $input): array
    {
        $decoded = json_decode($input, true);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * @param array<string, mixed> $data
     */
    private function fieldValue(array $data, string $key, string $default): string
    {
        $value = $data[$key] ?? null;

        if (! is_string($value)) {
            return $default;
        }

        $trimmed = trim($value);

        return $trimmed !== '' ? $trimmed : $default;
    }
}
