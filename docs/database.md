# Database Design

## 概要

ai-delivery-assistant では、PostgreSQLを利用してユーザー、プロジェクト、AI生成履歴、タスク分解結果、GitHub Issue形式の出力を管理します。

MVPでは認証やチーム管理は必須対象外ですが、将来的なSaaS化を見据えて、ユーザー単位・プロジェクト単位でデータを分離できる設計を前提とします。

## 設計方針

- PostgreSQLをメインデータベースとして利用する
- Laravelのマイグレーションでスキーマを管理する
- AI生成結果は再利用できるよう履歴として保存する
- MVPではシンプルな構成にし、SaaS化時に拡張できる余地を残す
- OpenAI APIキーなどの秘密情報はDBに保存しない

## 主要エンティティ

### users

ユーザー情報を管理します。

MVPでは任意ですが、SaaS化時の認証・データ分離のために想定します。

| カラム | 型 | 説明 |
| --- | --- | --- |
| id | bigint | 主キー |
| name | varchar | ユーザー名 |
| email | varchar | メールアドレス |
| password | varchar | ハッシュ化されたパスワード |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### projects

ユーザーが作成するプロジェクトを管理します。

| カラム | 型 | 説明 |
| --- | --- | --- |
| id | bigint | 主キー |
| user_id | bigint | users.id |
| name | varchar | プロジェクト名 |
| description | text | プロジェクト説明 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### ai_generations

AI生成の共通履歴を管理します。

要件定義、タスク分解、レビュー、業務改善提案、GitHub Issue生成の結果を共通形式で保存します。

| カラム | 型 | 説明 |
| --- | --- | --- |
| id | bigint | 主キー |
| user_id | bigint nullable | users.id |
| project_id | bigint nullable | projects.id |
| type | varchar | 生成種別 |
| title | varchar | 履歴タイトル |
| input | jsonb | 入力内容 |
| output_markdown | text | AI生成結果 |
| model | varchar nullable | 使用AIモデル |
| token_usage | jsonb nullable | トークン使用量 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

typeの候補:

- `requirements`
- `task_breakdown`
- `github_issue`
- `code_review`
- `business_improvement`

### requirement_documents

AI要件定義の結果を詳細に管理します。

| カラム | 型 | 説明 |
| --- | --- | --- |
| id | bigint | 主キー |
| ai_generation_id | bigint | ai_generations.id |
| product_name | varchar | プロダクト名 |
| target_users | jsonb | 対象ユーザー |
| functional_requirements | jsonb | 機能要件 |
| non_functional_requirements | jsonb | 非機能要件 |
| constraints | jsonb nullable | 制約 |
| success_metrics | jsonb nullable | 成功指標 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### task_breakdowns

AIタスク分解のまとまりを管理します。

| カラム | 型 | 説明 |
| --- | --- | --- |
| id | bigint | 主キー |
| ai_generation_id | bigint | ai_generations.id |
| source_requirement_id | bigint nullable | requirement_documents.id |
| summary | text | タスク分解の概要 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### tasks

タスク分解で生成された個別タスクを管理します。

| カラム | 型 | 説明 |
| --- | --- | --- |
| id | bigint | 主キー |
| task_breakdown_id | bigint | task_breakdowns.id |
| title | varchar | タスク名 |
| description | text | タスク概要 |
| priority | varchar | 優先度 |
| estimate_hours | numeric nullable | 工数見積 |
| estimate_reason | text nullable | 見積理由 |
| difficulty | varchar nullable | 実装難易度 |
| acceptance_criteria | jsonb | 完了条件 |
| dependencies | jsonb nullable | 依存タスク |
| milestone | varchar nullable | マイルストーン |
| sort_order | integer | 表示順 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

priorityの候補:

- `high`
- `medium`
- `low`

difficultyの候補:

- `easy`
- `medium`
- `hard`

### github_issue_outputs

タスク分解結果から生成したGitHub Issue形式のMarkdownを管理します。

| カラム | 型 | 説明 |
| --- | --- | --- |
| id | bigint | 主キー |
| ai_generation_id | bigint | ai_generations.id |
| task_id | bigint nullable | tasks.id |
| issue_title | varchar | Issueタイトル |
| issue_markdown | text | Issue本文Markdown |
| labels | jsonb nullable | 推奨ラベル |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### review_results

AIレビュアの結果を管理します。

| カラム | 型 | 説明 |
| --- | --- | --- |
| id | bigint | 主キー |
| ai_generation_id | bigint | ai_generations.id |
| target_type | varchar | レビュー対象種別 |
| severity_summary | jsonb nullable | 重要度別サマリー |
| findings | jsonb | 指摘一覧 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### business_improvement_reports

AI業務改善提案の結果を管理します。

| カラム | 型 | 説明 |
| --- | --- | --- |
| id | bigint | 主キー |
| ai_generation_id | bigint | ai_generations.id |
| current_process | text | 現状業務 |
| bottlenecks | jsonb | ボトルネック |
| proposals | jsonb | 改善案 |
| automation_candidates | jsonb nullable | 自動化候補 |
| expected_effects | jsonb nullable | 期待効果 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

## リレーション

- users 1:N projects
- users 1:N ai_generations
- projects 1:N ai_generations
- ai_generations 1:1 requirement_documents
- ai_generations 1:1 task_breakdowns
- task_breakdowns 1:N tasks
- tasks 1:N github_issue_outputs
- ai_generations 1:N github_issue_outputs
- ai_generations 1:1 review_results
- ai_generations 1:1 business_improvement_reports

## インデックス方針

- `ai_generations.user_id`
- `ai_generations.project_id`
- `ai_generations.type`
- `ai_generations.created_at`
- `tasks.task_breakdown_id`
- `tasks.priority`
- `github_issue_outputs.task_id`

履歴一覧やプロジェクト別表示が多くなるため、ユーザー、プロジェクト、生成種別、作成日時を中心にインデックスを付与します。

## MVPでの最小構成

MVPでは以下のテーブルから開始できます。

- `ai_generations`
- `task_breakdowns`
- `tasks`
- `github_issue_outputs`

認証やプロジェクト管理を後回しにする場合、`user_id` と `project_id` は nullable として扱います。

## 将来的な拡張

- ユーザー認証
- ワークスペース管理
- チーム管理
- GitHub連携情報の保存
- 生成テンプレート管理
- 課金プランと利用量管理
- 監査ログ
