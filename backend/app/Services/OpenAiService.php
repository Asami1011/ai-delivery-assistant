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
                        'content' => $this->userPrompt($feature, $input),
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

    private function userPrompt(string $feature, string $input): string
    {
        return match ($feature) {
            'task_breakdown' => $this->taskBreakdownUserPrompt($input),
            default => $input,
        };
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
            'task_breakdown' => <<<PROMPT
                あなたはソフトウェア開発の計画立案を支援するAIアシスタントです。
                入力された要件定義や前提条件をもとに、日本語で、実装に使えるタスク分解Markdownを生成してください。

                以下の方針を必ず守ってください。

                1. 出力は必ずMarkdown形式にする
                2. タスクは実装や設計に着手しやすい粒度で整理する
                3. タスクごとに、優先度、依存関係、完了条件、想定工数を含める
                4. 優先度には理由を添える
                5. 依存関係がない場合は「なし」と明示する
                6. 曖昧な情報は過剰に補完せず、「未確定事項」として分ける
                7. MVPとして先にやるべき順序を意識する
                8. 営業文ではなく、開発計画やWBSのたたき台として使える内容にする

                出力には最低限以下を含めてください。

                - タスク分解の前提
                - タスク一覧
                - 想定成果物
                - リスク・注意点
                - マイルストーン案
                - 実装順の提案
                - 今回やらないこと
                - 確認観点
                - 未確定事項

                各タスクには以下を含めてください。

                - タスク名
                - 概要
                - 優先度
                - 優先度の理由
                - 依存関係
                - 完了条件
                - 想定工数
                - 見積理由
                - マイルストーン
                PROMPT,
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
            'task_breakdown' => $this->demoTaskBreakdownMarkdown($input),
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

    private function demoTaskBreakdownMarkdown(string $input): string
    {
        $data = $this->parseStructuredInput($input);

        $projectName = $this->fieldValue($data, 'project_name', '対象プロジェクト');
        $requirementsText = $this->fieldValue($data, 'requirements_text', trim($input) !== '' ? trim($input) : '要件定義テキストは未入力です。');
        $deliveryGoal = $this->fieldValue($data, 'delivery_goal', '到達目標は未入力です。');
        $teamContext = $this->fieldValue($data, 'team_context', '体制・技術前提は未入力です。');
        $constraints = $this->fieldValue($data, 'constraints', '大きな制約条件はまだ整理されていません。');
        $notes = $this->fieldValue($data, 'notes', '補足情報はありません。');
        $outputLevel = $this->fieldValue($data, 'output_level', 'standard');

        $detailLine = match ($outputLevel) {
            'short' => 'MVP最小構成を優先し、着手順を短く絞った粒度で整理します。',
            'detailed' => '設計、実装、確認まで追いやすいよう、タスク粒度をやや細かめに整理します。',
            default => 'MVPと次工程の両方で使いやすいよう、標準的な粒度で整理します。',
        };

        $scopeSummary = $this->firstMeaningfulLine($requirementsText);
        $stackHint = $this->stackHint($teamContext);
        $constraintsLine = $constraints !== '大きな制約条件はまだ整理されていません。'
            ? $constraints
            : '大きな制約は未確定のため、MVP優先で進める前提です。';

        return <<<MARKDOWN
            # {$projectName} タスク分解案（デモ）

            ## 前提
            - {$projectName} の要件定義や仕様メモをもとにしたタスク分解のたたき台です。
            - デモモードのため、入力内容をもとに本番想定の構成で整形しています。
            - {$detailLine}
            - 到達目標: {$deliveryGoal}
            - 体制・技術前提: {$teamContext}
            - 制約・優先条件: {$constraints}
            - 今回の着手対象: {$scopeSummary}

            ## タスク一覧

            ### 1. スコープと完了イメージを固定する
            - 概要: 要件定義テキストから今回の対象範囲を整理し、MVPとしてどこまで作るかを明確にする。
            - 優先度: 高
            - 優先度の理由: スコープが曖昧なまま進めると、後続の設計や実装の粒度がぶれやすいため。
            - 依存関係: なし
            - 完了条件: 実装対象、除外対象、MVP完了条件が短いメモとして整理されている。
            - 想定工数: 0.5日
            - 見積理由: 入力済みの要件を読み解きつつ、着手順とスコープを詰める整理作業が中心になるため。
            - マイルストーン: 方針確定

            ### 2. 画面・API・データの実装方針を決める
            - 概要: 必要な画面、API、入出力、状態管理の責務を整理し、実装順を決める。{$stackHint}
            - 優先度: 高
            - 優先度の理由: 実装前に責務分割を決めておくと、フロントとバックの往復を減らせるため。
            - 依存関係: 1. スコープと完了イメージを固定する
            - 完了条件: どの画面で何を入力し、どのAPIが何を返すか説明できる状態になっている。
            - 想定工数: 0.5日
            - 見積理由: 現在の前提と制約を踏まえた実装順の整理が主で、大きな調査は不要なため。
            - マイルストーン: 実装設計確定

            ### 3. コア機能を実装する
            - 概要: {$scopeSummary} を実現するための主要な画面、API、業務ロジックを順に実装する。
            - 優先度: 高
            - 優先度の理由: 利用価値の中心になる部分で、MVPの成否を最も左右するため。
            - 依存関係: 2. 画面・API・データの実装方針を決める
            - 完了条件: 想定入力に対して主要フローが最後まで動き、結果を確認できる。
            - 想定工数: 1.5日
            - 見積理由: フロントとバックの双方にまたがる実装が発生し、確認の往復も必要になるため。
            - マイルストーン: コア機能完成

            ### 4. 制約条件に合わせて調整する
            - 概要: 現時点の制約や優先条件を踏まえて、後回しにする範囲と今回仕上げる範囲を明確にする。
            - 優先度: 中
            - 優先度の理由: {$constraintsLine}
            - 依存関係: 3. コア機能を実装する
            - 完了条件: 今回やらない項目と、その理由が整理されている。
            - 想定工数: 0.5日
            - 見積理由: 主にスコープ調整と軽微な修正が中心で、大きな新規実装は含まないため。
            - マイルストーン: MVP調整完了

            ### 5. 動作確認とデモ準備を行う
            - 概要: 主要ケースで動作確認し、成果物やデモ導線が分かる状態まで整える。
            - 優先度: 中
            - 優先度の理由: リリースや共有前に最低限の品質確認が必要なため。
            - 依存関係: 3. コア機能を実装する, 4. 制約条件に合わせて調整する
            - 完了条件: サンプル入力や代表ケースで期待どおりの結果が出ることを確認できる。
            - 想定工数: 0.5日
            - 見積理由: 既存の確認基盤を使える前提で、主要フローの確認と仕上げが中心になるため。
            - マイルストーン: MVP完了

            ## マイルストーン案
            - 方針確定
            - 実装設計確定
            - コア機能完成
            - MVP調整完了
            - MVP完了

            ## 想定成果物
            - 実装対象とスコープ外を整理したMVPメモ
            - 主要画面とAPIの責務が分かる設計メモ
            - 代表ケースで動作するコア機能
            - 動作確認結果と残課題のメモ

            ## リスク・注意点
            - 要件定義テキストの粒度が粗い場合、タスクの切り方が大きくぶれる可能性がある
            - 優先度や依存関係は、実装しながら前後する可能性がある
            - 見積もりは個人開発かチーム開発かで大きく変わるため、前提確認が必要
            - 制約条件が増えると、MVP範囲の再調整が必要になる

            ## 実装順の提案
            1. スコープとMVP完了条件を固める
            2. 画面・API・データの責務分割を決める
            3. コア機能を先に通す
            4. 制約に合わせて対象範囲を調整する
            5. 最後に動作確認とデモ準備をまとめて行う

            ## 今回やらないこと
            - 認証や権限管理の導入
            - 保存、履歴、エクスポートのような周辺機能
            - 優先度や依存関係の専用可視化UI
            - 本番運用向けの監視や詳細な非機能要件の詰め

            ## 確認観点
            - サンプル入力や代表ケースで、主要フローが最後まで通るか
            - 生成結果や実装結果が、次工程へ流用しやすい粒度になっているか
            - 制約条件どおりにMVP範囲が守られているか
            - 画面表示やAPI応答に、利用上の大きな違和感がないか

            ## 参照した要件定義テキスト
            {$requirementsText}

            ## 補足情報
            - {$notes}

            ## 未確定事項
            - OpenAI APIキー未設定のため、現在はデモレスポンスです
            - 優先度や依存関係の専用UI表示は後続タスクとして切り出す前提です
            - 本番AI利用時の出力粒度と工数精度は実機検証が必要です
            MARKDOWN;
    }

    private function firstMeaningfulLine(string $text): string
    {
        $normalized = preg_replace('/\s+/u', ' ', trim($text)) ?? '';

        if ($normalized === '') {
            return '要件定義テキストから対象範囲を読み取る想定です。';
        }

        $parts = preg_split('/[。!?！？]/u', $normalized) ?: [];
        $first = trim($parts[0] ?? $normalized);

        if ($first === '') {
            return $normalized;
        }

        return mb_strimwidth($first, 0, 80, '...');
    }

    private function stackHint(string $teamContext): string
    {
        if (trim($teamContext) === '' || $teamContext === '体制・技術前提は未入力です。') {
            return '体制や技術前提が未入力の場合でも、画面とAPIの責務を先に切り分ける想定です。';
        }

        return "利用技術として {$teamContext} を前提に、責務分割を揃える。";
    }

    private function taskBreakdownUserPrompt(string $input): string
    {
        $data = $this->parseStructuredInput($input);

        $projectName = $this->fieldValue($data, 'project_name', '未入力');
        $requirementsText = $this->fieldValue($data, 'requirements_text', '未入力');
        $deliveryGoal = $this->fieldValue($data, 'delivery_goal', '未入力');
        $teamContext = $this->fieldValue($data, 'team_context', '未入力');
        $constraints = $this->fieldValue($data, 'constraints', '未入力');
        $outputLevel = $this->fieldValue($data, 'output_level', 'standard');
        $notes = $this->fieldValue($data, 'notes', '未入力');

        return <<<PROMPT
            以下の入力情報をもとに、AIタスク分解を作成してください。

            [入力情報]
            - 対象プロジェクト: {$projectName}
            - 要件定義テキスト: {$requirementsText}
            - 到達目標: {$deliveryGoal}
            - 体制・技術前提: {$teamContext}
            - 制約・優先条件: {$constraints}
            - 出力の詳しさ: {$outputLevel}
            - 補足情報: {$notes}

            [出力条件]
            - 日本語で出力すること
            - Markdown形式で出力すること
            - タスクは番号付きで整理すること
            - 各タスクに以下を含めること
              - タスク名
              - 概要
              - 優先度
              - 優先度の理由
              - 依存関係
              - 完了条件
              - 想定工数
              - 見積理由
              - マイルストーン
            - 最後に未確定事項をまとめること
            - 想定成果物、リスク・注意点、今回やらないこと、確認観点も含めること
            - MVPで先に着手すべき順序を意識すること
            PROMPT;
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
