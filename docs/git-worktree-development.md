# Git Worktree Development Guide

## Purpose

機能開発では、Git Worktreeを使って複数の機能ブランチを並行して進める。

各機能は機能ごとのWorktreeで作業する。複数機能で使う共通部品や共通処理は、機能Worktreeへ直接混ぜず、共通機能用Worktreeで作業する。

Docker環境は複数立てず、現在のDocker Compose環境を1つだけ使い回す。動作検証時だけ、Docker Composeに見せるWorktreeを切り替える。

## Quick Start

Git Worktreeに慣れていない場合は、まずこの手順だけでよい。

1. 元のrepoで最新の `main` を取得する。
2. 機能に対応したWorktreeを作る。
3. 作成されたWorktreeへ移動する。
4. `.env.worktree` の `DB_DATABASE` を確認する。
5. Dockerを起動する。
6. `migrate` と `api/health` を確認する。

例: AIタスク分解機能を始める場合

```powershell
git pull origin main
node scripts/create-worktree.mjs --feature task-breakdown
cd ..\ai-delivery-assistant-task
docker compose --env-file .env.worktree up -d --force-recreate
docker compose --env-file .env.worktree exec backend php artisan migrate
```

ブラウザ確認先:

```text
http://localhost:3000
http://localhost:8000/api/health
```

Worktree一覧を見たい場合:

```powershell
git worktree list
```

backendログを見たい場合:

```powershell
docker compose --env-file .env.worktree logs backend --tail 100
docker compose --env-file .env.worktree logs backend -f
```

frontendログを見たい場合:

```powershell
docker compose --env-file .env.worktree logs frontend --tail 100
docker compose --env-file .env.worktree logs frontend -f
```

DBログを見たい場合:

```powershell
docker compose --env-file .env.worktree logs db --tail 100
docker compose --env-file .env.worktree logs db -f
```

Dockerの起動状態を見たい場合:

```powershell
docker compose --env-file .env.worktree ps
```

## Basic Policy

- 1 Worktree = 1機能 = 1 feature branch とする。
- 共通部品、共通API、AI処理基盤、UI基盤など複数機能が使う変更は、共通機能用Worktreeで作業する。
- 機能Worktreeで作業中に共通機能の改修が必要になった場合は、共通部分だけを共通機能用Worktreeへ切り出す。
- `main` ブランチは直接作業せず、統合確認用のWorktreeとして扱う。
- Docker Composeのproject名は固定し、コンテナ、ポート、PostgreSQLコンテナは1セットだけ使う。
- DBはPostgreSQLコンテナを共有しつつ、WorktreeごとにDB名を分ける。
- ローカル動作確認のために毎回remoteへpush/pullする必要はない。
- remoteへのpushは、レビュー、バックアップ、PR作成、統合確認のために行う。

## Recommended Worktree Layout

```text
C:\Users\asami\projects\ai-delivery-assistant              feature/requirements-ai
C:\Users\asami\projects\ai-delivery-assistant-task         feature/task-breakdown-ai
C:\Users\asami\projects\ai-delivery-assistant-review       feature/review-ai
C:\Users\asami\projects\ai-delivery-assistant-common       feature/common-foundation
C:\Users\asami\projects\ai-delivery-assistant-main         main
```

例:

```powershell
git worktree add ..\ai-delivery-assistant-task -b feature/task-breakdown-ai origin/main
git worktree add ..\ai-delivery-assistant-review -b feature/review-ai origin/main
git worktree add ..\ai-delivery-assistant-common -b feature/common-foundation origin/main
git worktree add ..\ai-delivery-assistant-main main
```

Codexが今後追加開発用のWorktreeを作るときは、このrepoに追加した `scripts/create-worktree.mjs` を使う前提にする。

## Common Feature Worktree

同時に複数機能を開発している途中で共通機能の改修が必要になった場合は、以下の方針で判断する。

共通機能用Worktreeで作業する対象:

- 複数機能で使うUIコンポーネント
- 複数機能で使うAPIクライアント
- `OpenAiService` などAI生成処理の共通基盤
- Markdown表示、エラー表示、ローディング表示などの共通UI
- バリデーションや型定義など複数機能にまたがる処理
- Docker、lint、build、testなど開発基盤の変更

機能Worktreeで作業してよい対象:

- その機能専用の画面
- その機能専用のフォーム
- その機能専用のプロンプト
- その機能専用のAPIエンドポイント
- その機能だけで使う表示や文言

共通機能の変更を全Worktreeへ反映する方法は2つある。

推奨は、共通機能ブランチを先にmainへmergeし、各機能ブランチがmainを取り込む方法。

```powershell
git -C C:\Users\asami\projects\ai-delivery-assistant-common push origin feature/common-foundation

git -C C:\Users\asami\projects\ai-delivery-assistant-task fetch origin
git -C C:\Users\asami\projects\ai-delivery-assistant-task merge origin/main
```

mainへmergeする前に各機能で先行利用したい場合は、各機能ブランチへ共通機能ブランチを取り込む。

```powershell
git -C C:\Users\asami\projects\ai-delivery-assistant-task fetch origin
git -C C:\Users\asami\projects\ai-delivery-assistant-task merge origin/feature/common-foundation
```

ただし、この方法は後でmainへmergeするときの履歴やコンフリクトが複雑になりやすい。急ぎで必要な場合だけ使う。

共通機能ブランチを使う場合、機能ブランチ側では同じ共通ファイルを直接変更しない。追加改修が必要になったら、再度共通機能用Worktreeへ戻して作業する。

## Worktree Environment File

各Worktree直下に `.env.worktree` を置き、そのWorktree専用の設定を持たせる。

ブランチ名と `DB_DATABASE` の標準マッピングは以下を使う。

| 用途 | ブランチ名 | DB_DATABASE |
| --- | --- | --- |
| 統合確認 | `main` | `ai_delivery_assistant_main` |
| 共通基盤 | `feature/common-foundation` | `ai_delivery_assistant_common` |
| AI要件定義 | `feature/requirements-ai` | `ai_delivery_assistant_requirements` |
| AIタスク分解 | `feature/task-breakdown-ai` | `ai_delivery_assistant_task_breakdown` |
| AIレビュア | `feature/review-ai` | `ai_delivery_assistant_review` |
| AI業務改善提案 | `feature/business-improvement-ai` | `ai_delivery_assistant_business_improvement` |
| 履歴・保存・エクスポート | `feature/history-and-export` | `ai_delivery_assistant_history_export` |

例:

```env
COMPOSE_PROJECT_NAME=ai-delivery-assistant
DB_DATABASE=ai_delivery_assistant_task_breakdown
```

`.env.worktree` 自体はローカル運用ファイルとして扱い、repoには `.env.worktree.example` を置く。

新しいWorktreeを作ったら、まず以下を用意する。

```powershell
Copy-Item .env.worktree.example .env.worktree
```

その後、対応するブランチ名に合わせて `DB_DATABASE` を手動で設定する。

補助スクリプトとして `scripts/generate-worktree-env.mjs` を用意している。通常はこのスクリプトで `.env.worktree` を生成する。

```powershell
node scripts/generate-worktree-env.mjs
```

現在のブランチではなく、別ブランチ向けに生成したい場合:

```powershell
node scripts/generate-worktree-env.mjs --branch feature/task-breakdown-ai
```

既存の `.env.worktree` を上書きしたい場合:

```powershell
node scripts/generate-worktree-env.mjs --force
```

このスクリプトは標準マッピングに一致するブランチは固定の `DB_DATABASE` を使い、それ以外のブランチはブランチ名から `ai_delivery_assistant_<normalized_branch_name>` を生成する。

## New Worktree Procedure

今後追加開発を行うときは、以下の流れでWorktreeを作成する。

1. `node scripts/create-worktree.mjs --feature <preset>` を実行する。
2. 作成されたWorktreeへ移動する。
3. `.env.worktree` の `DB_DATABASE` が想定したマッピングになっていることを確認する。
4. `docker compose --env-file .env.worktree up -d --force-recreate` で起動する。
5. 必要に応じて `docker compose --env-file .env.worktree exec backend php artisan migrate` を実行する。

代表的な `--feature` 値:

- `common`
- `requirements`
- `task-breakdown`
- `review`
- `business-improvement`
- `history-export`
- `main`

Windows例:

```powershell
node scripts/create-worktree.mjs --feature task-breakdown
cd ..\ai-delivery-assistant-task
docker compose --env-file .env.worktree up -d --force-recreate
```

任意のブランチ名を直接指定したい場合:

```powershell
node scripts/create-worktree.mjs --branch feature/my-new-feature --path ai-delivery-assistant-my-feature
```

この場合、`DB_DATABASE` は既知の標準マッピングが無ければ、ブランチ名から自動生成される。

CodexがWorktreeを作成する場合も、基本的にはこの手順に従う。新しい機能開発を依頼する際は、Codexが対象機能に対応したWorktreeを `scripts/create-worktree.mjs` で作成し、そのWorktree上で実装を進める。

## Docker Switching

`docker-compose.yml` は `./frontend` と `./backend` を相対パスでbind mountしている。

そのため、検証したいWorktreeで `.env.worktree` を使って起動し直せば、同じDocker環境を別Worktreeのコードに向けられる。

通常の切り替え:

```powershell
docker compose --env-file .env.worktree up -d --force-recreate
```

依存関係やDockerfileが変わった場合:

```powershell
docker compose --env-file .env.worktree up -d --build --force-recreate
```

`--build` が必要な主なケース:

- `Dockerfile` を変更した
- `frontend/package-lock.json` を変更した
- `backend/composer.lock` を変更した
- `node_modules` または `vendor` のvolumeに不整合が出た

## Database Separation

Dockerは1つだけ使うが、マイグレーション衝突を避けるためDB名はWorktreeごとに分ける。

例:

```text
ai_delivery_assistant_main
ai_delivery_assistant_requirements
ai_delivery_assistant_task_breakdown
ai_delivery_assistant_review
ai_delivery_assistant_common
```

backend起動時に対象DBが無ければ `backend/scripts/ensure-database.php` で自動作成する。

そのうえで、各Worktreeでマイグレーションを流す。

```powershell
docker compose --env-file .env.worktree exec backend php artisan migrate
```

この構成にすると、あるWorktreeで追加したマイグレーションが他のWorktreeやmain確認用DBへ直接影響しにくくなる。

## Verification Flow

Worktree切り替え後は、以下を基本確認とする。

```powershell
docker compose --env-file .env.worktree ps
docker compose --env-file .env.worktree exec frontend npm run lint
docker compose --env-file .env.worktree exec frontend npm run build
docker compose --env-file .env.worktree exec backend php artisan test
```

ブラウザ確認:

```text
http://localhost:3000
http://localhost:8000/api/health
```

フロントエンド変更時は、表示だけでなく操作後の状態も確認する。

- フォーム入力
- サンプル入力
- AI生成
- API応答後の表示
- エラー表示
- Markdown表示

## User Verification Commands

今回追加した仕組みをユーザー側で確認する場合は、以下を順番に実行すればよい。

### 1. Worktree自動作成

例: AIタスク分解機能

```powershell
node scripts/create-worktree.mjs --feature task-breakdown
git worktree list
```

確認ポイント:

- `feature/task-breakdown-ai` のWorktreeが作成されている
- 作成先ディレクトリが期待どおりである

### 2. `.env.worktree` の生成内容

```powershell
Get-Content ..\ai-delivery-assistant-task\.env.worktree
```

確認ポイント:

- `COMPOSE_PROJECT_NAME=ai-delivery-assistant`
- `DB_DATABASE=ai_delivery_assistant_task_breakdown`

### 3. Docker設定の解決結果

```powershell
docker compose --env-file ..\ai-delivery-assistant-task\.env.worktree -f ..\ai-delivery-assistant-task\docker-compose.yml config
```

確認ポイント:

- `DB_DATABASE` が `ai_delivery_assistant_task_breakdown` になっている
- `DATABASE_URL` が同じDB名を参照している
- backend の command に `php scripts/ensure-database.php` が含まれている

### 4. Docker起動

```powershell
docker compose --env-file ..\ai-delivery-assistant-task\.env.worktree -f ..\ai-delivery-assistant-task\docker-compose.yml up -d --force-recreate
docker compose --env-file ..\ai-delivery-assistant-task\.env.worktree -f ..\ai-delivery-assistant-task\docker-compose.yml ps
```

確認ポイント:

- `backend`
- `frontend`
- `db`

の3サービスが起動している

### 5. backendログ確認

```powershell
docker compose --env-file ..\ai-delivery-assistant-task\.env.worktree -f ..\ai-delivery-assistant-task\docker-compose.yml logs backend --tail 100
```

確認ポイント:

- `Created database:` が出ている、または既存DB利用でエラーなく起動している
- `Server running on [http://0.0.0.0:8000]` が出ている

### 6. migrate

```powershell
docker compose --env-file ..\ai-delivery-assistant-task\.env.worktree -f ..\ai-delivery-assistant-task\docker-compose.yml exec backend php artisan migrate
```

確認ポイント:

- migration が成功する

### 7. API疎通

```powershell
curl.exe http://localhost:8000/api/health
```

確認ポイント:

- `{"status":"ok","service":"ai-delivery-assistant-api"}`

### 8. フロント表示

```text
http://localhost:3000
```

確認ポイント:

- 画面が表示される
- 対象機能のUIが崩れていない

### 9. 停止

```powershell
docker compose --env-file ..\ai-delivery-assistant-task\.env.worktree -f ..\ai-delivery-assistant-task\docker-compose.yml down
```

必要に応じて次のWorktreeへ切り替える。

## Beginner Notes

Git Worktreeを知らないユーザー向けの前提は以下。

- Worktreeは、1つのgit repositoryから複数の作業ディレクトリを作る仕組み
- ブランチを切り替えるたびに `stash` したり `checkout` し直したりしなくてよい
- このプロジェクトでは「1 Worktree = 1機能」で使う
- Dockerは1つだけ使い、切り替えたいWorktreeの `docker-compose.yml` と `.env.worktree` を使って起動する
- DBはWorktreeごとに分けるので、別機能の migration が混ざりにくい

## Conflict Prevention

並行開発でコンフリクトや不要コード混入を減らすため、以下を守る。

- 各Worktreeでは担当機能の範囲だけを変更する。
- 共通部品、共通API、`OpenAiService`、UI基盤など複数機能が触る箇所は、共通機能用Worktreeで作業する。
- 機能ブランチと共通機能ブランチで同じファイルを同時に変更しない。
- 共通機能の変更は小さく区切り、できるだけ先にmainへ入れる。
- 長期間mainから離れたブランチにしない。
- PR作成前に `git diff main...HEAD` を確認し、不要な差分が混ざっていないか確認する。
- `git status --short` で未追跡ファイルを確認し、生成物やキャッシュをコミットしない。
- 依存関係変更やマイグレーション追加はPR説明に明記する。

## Merge Strategy

推奨する統合順序:

1. 共通基盤の変更を先にmainへ入れる。
2. 各機能ブランチでmainを取り込む。
3. 機能単位でPRを作成する。
4. main確認用Worktreeで最終動作確認する。

統合確認例:

```powershell
git -C C:\Users\asami\projects\ai-delivery-assistant-main pull
docker compose --env-file C:\Users\asami\projects\ai-delivery-assistant-main\.env.worktree up -d --force-recreate
docker compose --env-file C:\Users\asami\projects\ai-delivery-assistant-main\.env.worktree exec backend php artisan migrate
```

## Notes

この運用では、複数Worktreeで同時にコードを書くことはできるが、Dockerでの画面確認は1つずつ行う。

複数機能を同時にブラウザで開いて比較したい場合は、別project名、別ポート、別DBを使う必要がある。ただし、このプロジェクトではDocker環境を1つに保つ方針を優先する。
