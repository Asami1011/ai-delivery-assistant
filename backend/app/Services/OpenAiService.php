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
            'code_review' => <<<'PROMPT'
You are an AI reviewer for software delivery artifacts such as requirements drafts, task breakdowns, code diffs, and design notes.
Always respond in Japanese Markdown.
Review the given input with practical MVP-aware judgment.
Adjust your review to the artifact type provided in review_type.
Prioritize bugs, security risks, input validation gaps, error handling gaps, testing gaps, architectural inconsistencies, and maintainability risks.
Order findings by severity using only P0, P1, P2, or P3 as severity codes.
When you render headings, add short Japanese labels such as P1（重要） for readability.
Include Japanese sections for 概要, 指摘事項, 良い点, 改善提案, テスト観点, and 次に直すべき順.
Do not invent files or implementation details that are not present in the input.
PROMPT,
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
            'code_review' => $this->demoCodeReviewMarkdown($input),
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

    private function demoCodeReviewMarkdown(string $input): string
    {
        $data = $this->parseStructuredInput($input);

        $reviewType = $this->fieldValue($data, 'review_type', 'other');
        $technology = $this->fieldValue($data, 'technology', '技術スタックや関連領域は未入力です。');
        $reviewTarget = $this->fieldValue(
            $data,
            'review_target',
            trim($input) !== '' ? trim($input) : 'レビュー対象は未入力です。'
        );
        $reviewFocus = $this->fieldValue(
            $data,
            'review_focus',
            '何をどうレビューしてほしいかの指定が無いため、抜け漏れ、セキュリティ、保守性、テスト観点を基準に確認します。'
        );
        $context = $this->fieldValue($data, 'context', '特記事項なし。');
        $notes = $this->fieldValue($data, 'notes', '補足情報はありません。');
        $outputLevel = $this->fieldValue($data, 'output_level', 'standard');
        $reviewTypeLabel = match ($reviewType) {
            'requirements' => '要件定義',
            'task_breakdown' => 'タスク分解',
            'code_diff' => 'コード差分',
            'design_note' => '設計メモ',
            default => 'その他',
        };

        $summaryLine = match ($outputLevel) {
            'short' => '重大な指摘を優先し、簡潔なレビュー結果として整理しています。',
            'detailed' => '理由と修正方針をやや詳しめに添えたレビュー結果として整理しています。',
            default => 'MVPで使いやすい標準的な粒度でレビュー結果を整理しています。',
        };

        return <<<MARKDOWN
            # レビュー結果

            ## 概要

            - {$summaryLine}
            - レビュー対象の種類: {$reviewTypeLabel}
            - 対象技術: {$technology}
            - 重点観点: {$reviewFocus}
            - 前提: {$context}
            - OpenAI APIキー未設定のため、現在はデモレスポンスです。

            ## 指摘事項

            ### P1（重要）: 入力仕様と実装仕様のずれを早めに吸収したい

            - 対象ファイル: 入力本文
            - 該当箇所: レビュー対象の仕様説明
            - 問題: フォーム仕様、プロンプト仕様、Backendの扱いがずれると、レビュー結果の粒度や期待出力が不安定になりやすいです。
            - 理由: AIレビューは入力項目、重要度表現、出力見出しの一致が前提になるため、仕様のずれがあると利用者体験とテスト観点の両方に影響します。
            - 修正案: `review_target`、`review_focus`、`output_level`、`P0-P3`、出力見出しを docs と実装でそろえ、最初にMarkdown表示までの完了条件を固定してください。

            ### P2（改善推奨）: レビュー対象が広すぎると指摘精度が落ちやすい

            - 対象ファイル: 入力本文
            - 該当箇所: レビュー対象全体
            - 問題: レビュー対象が大きすぎると、重要な問題より要約寄りの出力になり、具体的な修正案が弱くなりやすいです。
            - 理由: AIレビュアは他機能より入力が長くなりやすく、成果物全文を無制限に貼るよりも、抜粋や差分に絞った方がレビューの解像度が上がります。
            - 修正案: MVPでは文字数上限と「レビューしたい範囲に絞る」案内を用意し、将来的に `OPENAI_MODEL_REVIEW` や入力圧縮方針を追加してください。

            ### P3（軽微）: 良い点と改善提案の分離を明確にしたい

            - 対象ファイル: 入力本文
            - 該当箇所: 出力設計
            - 問題: 指摘だけに寄ると、継続利用時にレビュー結果が読みづらくなります。
            - 理由: Good Points と Suggested Refactoring を分けることで、維持したい実装と後回しにできる改善を切り分けやすくなります。
            - 修正案: Summary / Findings / Good Points / Suggested Refactoring / Test Suggestions の見出しを固定してください。

            ## 良い点

            - レビュー観点、重要度、出力形式を docs で先に固めようとしている点は、後続の実装とテストを安定させやすいです。
            - Markdown表示を先に成立させる方針は、MVPの完了条件が明確で進めやすいです。

            ## 改善提案

            - 初回は共通AIフォームを使い、コードレビュー専用UIの細かな最適化は後続に回すと実装負荷を抑えられます。
            - 保存や構造化 findings は 6 完了後に分離して検討すると、責務が整理しやすくなります。

            ## テスト観点

            - `code_review` のデモレスポンスで `概要`、`指摘事項`、`良い点`、`改善提案`、`テスト観点` が含まれることを確認する
            - `review_focus` 未入力時のバリデーションを Frontend で確認する
            - `review_target` が上限を超えた場合のバリデーション表示を確認する
            - `review_type` ごとに意図したレビュー観点へ寄るかを確認する

            ## 次に直すべき順

            1. `review_type` と `review_focus` に応じてレビューの観点がぶれないよう、入力仕様とプロンプト仕様を固定する
            2. 対象成果物を全文ではなく抜粋や差分に絞る運用ルールを明示する
            3. 出力の重要度順に、P1 から順番に修正や見直しを進める

            ## レビュー対象の抜粋

            ```text
            {$reviewTarget}
            ```

            ## 補足情報

            - {$notes}
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
