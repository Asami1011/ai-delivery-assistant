# AI Task Breakdown Form

## 目的

AIタスク分解機能で利用する入力フォーム仕様を定義する。

ユーザーが入力した要件定義や開発前提をもとに、AIへタスク分解生成用の構造化データを渡す。

## 対象機能

- AIタスク分解
- Frontend page: `/task-breakdown`
- Backend API: `POST /api/ai/generate`
- feature: `task_breakdown`

## 実装着手前の方針

- まずは Markdown 出力でMVPを成立させる
- ただし将来的な一覧表示に備えて、タスク1件ごとの項目定義は先に固定する
- 5.6 の WBS形式表示は Phase 1 では簡易表示、詳細な構造化表示は後続拡張でもよい

## 入力項目

| 項目ID | 表示名 | 入力形式 | 必須/任意 | プレースホルダー |
| --- | --- | --- | --- | --- |
| `project_name` | 対象プロジェクト | text | 必須 | 例: AI Delivery Assistant |
| `requirements_text` | 要件定義テキスト | textarea | 必須 | 例: 要件定義書、仕様メモ、実現したい機能を貼り付ける |
| `delivery_goal` | 到達目標 | textarea | 必須 | 例: 2週間でMVPの主要画面を確認できる状態にする |
| `team_context` | 体制・技術前提 | textarea | 任意 | 例: 個人開発、Next.js / Laravel / PostgreSQL |
| `constraints` | 制約・優先条件 | textarea | 任意 | 例: 保存機能は後続、まずは画面とAPI連携を優先 |
| `output_level` | 出力の詳しさ | select | 任意 | 標準 |
| `notes` | 補足情報 | textarea | 任意 | 例: WBSに貼りやすい形式にしたい |

## 入力項目詳細

### project_name

タスク分解の対象となるプロジェクト名。

- 必須
- 文字数: 1〜100文字
- 前後の空白は削除する

### requirements_text

タスク分解の元になる要件定義本文、仕様メモ、実現したい機能の説明。

- 必須
- 文字数: 20〜8000文字
- 箇条書き、Markdown、プレーンテキストを許容する
- 将来的には要件定義機能の生成結果をそのまま貼り付ける利用を想定する

### delivery_goal

いつまでにどのレベルまで到達したいかを示す目標。

- 必須
- 文字数: 10〜2000文字
- MVPか本番想定かが分かる内容にする

### team_context

人数、担当範囲、利用技術、既存資産などの前提。

- 任意
- 文字数: 0〜2000文字
- 未入力の場合は空文字として扱う

### constraints

納期、優先度、除外対象、スコープ制約、品質条件など。

- 任意
- 文字数: 0〜2000文字
- 未入力の場合は空文字として扱う

### output_level

AIが生成するタスク分解結果の詳しさ。

- 任意
- 初期値: `standard`
- 選択肢:
  - `short`: 簡潔
  - `standard`: 標準
  - `detailed`: 詳細

### notes

AIに伝えたい補足情報や重視観点。

- 任意
- 文字数: 0〜2000文字
- 未入力の場合は空文字として扱う

## バリデーション

| 項目ID | ルール |
| --- | --- |
| `project_name` | required, string, min:1, max:100 |
| `requirements_text` | required, string, min:20, max:8000 |
| `delivery_goal` | required, string, min:10, max:2000 |
| `team_context` | nullable, string, max:2000 |
| `constraints` | nullable, string, max:2000 |
| `output_level` | nullable, string, in:short,standard,detailed |
| `notes` | nullable, string, max:2000 |

## 送信例

```json
{
  "project_name": "AI Delivery Assistant",
  "requirements_text": "要件定義フォームで入力した背景、課題、目的をもとに、AIがMarkdown形式の要件定義を生成できる。生成結果は後続工程へ流用しやすい構成にする。",
  "delivery_goal": "2週間でMVPとして要件定義、タスク分解、レビュー、業務改善提案の主要画面を確認できる状態にする。",
  "team_context": "個人開発。Next.js、Laravel、PostgreSQL を利用し、AI API連携はBackendに閉じる。",
  "constraints": "保存機能と認証は後続。まずは画面入力、API連携、デモレスポンス確認を優先する。",
  "output_level": "standard",
  "notes": "WBSに貼り付けやすいよう、優先度、依存関係、見積もりを含めてほしい。"
}
```

## AIへ渡すデータ構造

現在の共通AI APIでは `feature` と `input` を受け取るため、Frontend側でフォーム入力値を JSON文字列に整形して送信する。

### API Request

```json
{
  "feature": "task_breakdown",
  "input": "{ \"project_name\": \"AI Delivery Assistant\", \"requirements_text\": \"...\", \"delivery_goal\": \"...\", \"team_context\": \"...\", \"constraints\": \"...\", \"output_level\": \"standard\", \"notes\": \"...\" }"
}
```

## AI生成時に期待する出力

AIは以下をMarkdownで生成する。

- タスク分解の方針
- タスク一覧
- 各タスクの優先度
- 各タスクの依存関係
- 各タスクの完了条件
- 各タスクの想定工数
- マイルストーン
- WBS表示
- 想定成果物
- リスク・注意点
- 今回やらないこと
- 確認観点
- 未確定事項

## タスク1件あたりの期待項目

5.6 の表示仕様を見据えて、最低限以下の項目を想定する。

- タスク名
- タスク概要
- 優先度
- 優先度の理由
- 依存関係
- 完了条件
- 想定工数
- 見積理由
- マイルストーン

## UI方針

- 必須項目には必須表示を付ける
- 要件定義テキストは長文入力しやすいtextareaを利用する
- バリデーションエラーは項目の近くに表示する
- 送信中はLoading表示を出す
- 生成失敗時はError表示を出す
- MVPではMarkdown結果表示を優先する
- 5.6 では優先度と依存関係が追いやすい簡易表示を追加候補とする

## 5.1〜5.6 着手前に確定すべきこと

### 5.1 入力項目の設計

- `requirements_text` だけで足りるか
- 想定期間や優先観点を別項目に切り出すか

### 5.2 プロンプト設計

- 出力見出しを固定するか
- タスク1件ごとの必須項目を固定するか

### 5.3 入力フォーム実装

- 現在の共通フォーム構成で十分か
- 要件定義からの貼り付け導線を後続で追加するか

### 5.4 AI生成処理実装

- Markdownのみ返すか
- 将来的に構造化データも返せる設計にするか

### 5.5 結果表示実装

- MVPではMarkdown表示のみで完了とするか
- タスク一覧として見やすい整形をどこまで行うか

### 5.6 優先度・依存関係表示

- MVPではMarkdown内の表現に委ねるか
- もしくは簡易カード表示や表形式を別途作るか

## 備考

将来的にAIタスク分解専用APIを作る場合は、`input` 文字列ではなく、構造化JSONをBackend側で直接受け取る形に変更する可能性がある。
