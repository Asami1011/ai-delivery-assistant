# API Design

## 概要

ai-delivery-assistant のAPIは、Laravel 12で実装します。

Next.js 15のフロントエンドからLaravel APIを呼び出し、Laravel側でOpenAI APIとの通信、入力検証、生成履歴の保存を行います。

## 設計方針

- APIはREST形式を基本とする
- レスポンスはJSONで返す
- AI APIキーはLaravel側の環境変数で管理する
- フロントエンドからOpenAI APIを直接呼び出さない
- 生成結果はMarkdown文字列として返す
- MVPでは認証なしでも動作可能にし、SaaS化時に認証を追加する

## 共通仕様

### Base URL

開発環境:

```text
http://localhost:8000/api
```

本番環境:

```text
https://api.example.com/api
```

### 共通レスポンス

成功時:

```json
{
  "data": {},
  "meta": {}
}
```

エラー時:

```json
{
  "message": "Error message",
  "errors": {}
}
```

### 共通ステータスコード

| ステータス | 説明 |
| --- | --- |
| 200 | 正常終了 |
| 201 | 作成成功 |
| 400 | 不正なリクエスト |
| 422 | バリデーションエラー |
| 500 | サーバーエラー |
| 503 | AI API利用不可 |

## エンドポイント一覧

| メソッド | パス | 概要 |
| --- | --- | --- |
| POST | `/ai/generate` | 共通AI生成API |
| POST | `/ai/requirements` | AI要件定義を生成する |
| POST | `/ai/task-breakdown` | AIタスク分解を生成する |
| POST | `/ai/github-issues` | GitHub Issue形式Markdownを生成する |
| POST | `/ai/code-review` | AIレビュー結果を生成する |
| POST | `/ai/business-improvement` | AI業務改善提案を生成する |
| GET | `/generations` | AI生成履歴を取得する |
| GET | `/generations/{id}` | AI生成履歴の詳細を取得する |
| DELETE | `/generations/{id}` | AI生成履歴を削除する |

## 共通AI生成API

### POST `/ai/generate`

MVPでは各機能専用APIの代わりに、共通のAI生成APIを利用する。

リクエスト:

```json
{
  "feature": "code_review",
  "input": "{ \"review_type\": \"requirements\", \"technology\": \"Next.js / Laravel / PostgreSQL\", \"review_target\": \"...\", \"review_focus\": \"...\", \"context\": \"...\", \"output_level\": \"standard\", \"notes\": \"...\" }"
}
```

レスポンス:

```json
{
  "data": {
    "feature": "code_review",
    "mode": "demo",
    "model": "gpt-4o-mini",
    "output_markdown": "# レビュー結果..."
  },
  "meta": {
    "stored": false
  }
}
```

## AI要件定義API

### POST `/ai/requirements`

アイデアや課題から要件定義Markdownを生成します。

リクエスト:

```json
{
  "product_name": "ai-delivery-assistant",
  "background": "AIを活用した開発支援プラットフォームを作りたい",
  "problem": "要件定義やタスク分解に時間がかかる",
  "target_users": "個人開発者、小規模チーム",
  "goal": "要件定義を短時間で整理できるようにする",
  "constraints": "MVPでは認証なし"
}
```

レスポンス:

```json
{
  "data": {
    "id": 1,
    "type": "requirements",
    "output_markdown": "# 要件定義...",
    "created_at": "2026-06-03T00:00:00Z"
  }
}
```

## AIタスク分解API

### POST `/ai/task-breakdown`

要件定義からタスク一覧、工数見積、優先順位を生成します。

リクエスト:

```json
{
  "requirement_text": "# 要件定義...",
  "priority_policy": "MVPで価値が出る機能を優先",
  "duration": "1か月",
  "team_structure": "個人開発"
}
```

レスポンス:

```json
{
  "data": {
    "id": 10,
    "type": "task_breakdown",
    "output_markdown": "# タスク分解...",
    "tasks": [
      {
        "title": "AI要件定義画面を実装する",
        "priority": "high",
        "estimate_hours": 8,
        "estimate_reason": "入力フォームとAPI連携が必要なため",
        "acceptance_criteria": [
          "入力フォームから送信できる",
          "生成結果をMarkdownで表示できる"
        ]
      }
    ]
  }
}
```

## GitHub Issue生成API

### POST `/ai/github-issues`

AIタスク分解の結果から、GitHub Issue形式のMarkdownを生成します。

リクエスト:

```json
{
  "task_breakdown_id": 10,
  "tasks": [
    {
      "title": "AI要件定義画面を実装する",
      "description": "要件定義用の入力フォームと結果表示を作成する",
      "priority": "high",
      "estimate_hours": 8,
      "acceptance_criteria": [
        "入力フォームから送信できる",
        "生成結果をMarkdownで表示できる"
      ]
    }
  ]
}
```

レスポンス:

```json
{
  "data": {
    "id": 20,
    "type": "github_issue",
    "issues": [
      {
        "title": "AI要件定義画面を実装する",
        "markdown": "## 概要\n要件定義用の入力フォームと結果表示を作成する..."
      }
    ]
  }
}
```

## AIレビュアAPI

### POST `/ai/code-review`

要件定義、タスク分解、コード差分、設計メモなどの成果物からレビュー結果を生成します。

リクエスト:

```json
{
  "review_type": "requirements",
  "technology": "Next.js / Laravel / PostgreSQL",
  "review_target": "レビュー対象の要件定義、タスク分解、コード差分、設計メモなど",
  "review_focus": "何をどうレビューしてほしいか。要件の抜け漏れ、優先度の妥当性、セキュリティ、テスト不足",
  "context": "MVP開発中。まずはMarkdown表示を優先する。",
  "output_level": "standard",
  "notes": "P0-P3 の重要度順で見たい。"
}
```

レスポンス:

```json
{
  "data": {
    "feature": "code_review",
    "mode": "demo",
    "model": "gpt-4o-mini",
    "output_markdown": "# レビュー結果..."
  }
}
```

## AI業務改善提案API

### POST `/ai/business-improvement`

業務内容や課題から改善提案を生成します。

リクエスト:

```json
{
  "business_overview": "手作業で要件整理を行っている",
  "current_issues": "作業時間が長く、品質にばらつきがある",
  "stakeholders": "開発者、PM",
  "constraints": "低コストで始めたい",
  "target_metric": "要件定義にかかる時間"
}
```

レスポンス:

```json
{
  "data": {
    "id": 40,
    "type": "business_improvement",
    "output_markdown": "# 業務改善提案..."
  }
}
```

## 履歴API

### GET `/generations`

AI生成履歴の一覧を取得します。

クエリパラメータ:

| パラメータ | 説明 |
| --- | --- |
| type | 生成種別で絞り込み |
| project_id | プロジェクトIDで絞り込み |
| page | ページ番号 |

### GET `/generations/{id}`

AI生成履歴の詳細を取得します。

### DELETE `/generations/{id}`

AI生成履歴を削除します。

## バリデーション方針

- 必須入力を検証する
- 入力文字数の上限を設定する
- AIに送信する前に空文字や不正形式を排除する
- JSON配列の形式を検証する

## OpenAI API連携方針

- Laravel側でOpenAI APIを呼び出す
- APIキーは `.env` で管理する
- プロンプトは機能ごとに分離する
- 失敗時はユーザーに分かりやすいエラーを返す
- 生成結果はMarkdownとして扱う

## 将来的な拡張

- GitHub APIによるIssue自動作成
- ユーザー認証
- ワークスペース別API
- 利用量制限
- 課金プラン別のAPI制御
- Webhook連携
