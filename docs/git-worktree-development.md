# Git Worktree Development Guide

## Purpose

機能開発では、Git Worktreeを使って複数の機能ブランチを並行して進める。

各機能は機能ごとのWorktreeで作業する。複数機能で使う共通部品や共通処理は、機能Worktreeへ直接混ぜず、共通機能用Worktreeで作業する。

Docker環境は複数立てず、現在のDocker Compose環境を1つだけ使い回す。動作検証時だけ、Docker Composeに見せるWorktreeを切り替える。

## Basic Policy

- 1 Worktree = 1機能 = 1 feature branch とする。
- 共通部品、共通API、AI処理基盤、UI基盤など複数機能が使う変更は、共通機能用Worktreeで作業する。
- 機能Worktreeで作業中に共通機能の改修が必要になった場合は、共通部分だけを共通機能用Worktreeへ切り出す。
- `main` ブランチは直接作業せず、統合確認用のWorktreeとして扱う。
- Docker Composeのproject名は固定し、コンテナ、ポート、PostgreSQLコンテナは1セットだけ使う。
- DBはPostgreSQLコンテナを共有しつつ、ブランチごとにDB名を分ける。
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

## Docker Switching

`docker-compose.yml` は `./frontend` と `./backend` を相対パスでbind mountしている。

そのため、検証したいWorktreeの `docker-compose.yml` を指定して起動し直せば、同じDocker環境を別Worktreeのコードに向けられる。

通常の切り替え:

```powershell
docker compose -p ai-delivery-assistant -f <worktree>\docker-compose.yml up -d --force-recreate
```

依存関係やDockerfileが変わった場合:

```powershell
docker compose -p ai-delivery-assistant -f <worktree>\docker-compose.yml up -d --build --force-recreate
```

`--build` が必要な主なケース:

- `Dockerfile` を変更した
- `frontend/package-lock.json` を変更した
- `backend/composer.lock` を変更した
- `node_modules` または `vendor` のvolumeに不整合が出た

## Database Separation

Dockerは1つだけ使うが、マイグレーション衝突を避けるためDB名はブランチごとに分ける。

例:

```text
ai_delivery_assistant_main
ai_delivery_assistant_requirements
ai_delivery_assistant_task_breakdown
ai_delivery_assistant_review
ai_delivery_assistant_common
```

検証前に対象ブランチ用のDB名を指定する。

```powershell
$env:DB_DATABASE="ai_delivery_assistant_task_breakdown"
docker compose -p ai-delivery-assistant -f <worktree>\docker-compose.yml up -d --force-recreate
docker compose -p ai-delivery-assistant exec backend php artisan migrate
```

`docker-compose.yml` 側では、DB名を環境変数化しておくことが望ましい。

```yaml
DB_DATABASE: ${DB_DATABASE:-ai_delivery_assistant}
DATABASE_URL: postgresql://postgres:postgres@db:5432/${DB_DATABASE:-ai_delivery_assistant}
```

backend起動時に対象DBが無ければ自動作成するようにしておくと、既存volumeを使ったままでもWorktreeごとのDB切り替えがしやすい。

この構成にすると、あるWorktreeで追加したマイグレーションが他のWorktreeやmain確認用DBへ直接影響しにくくなる。

## Verification Flow

Worktree切り替え後は、以下を基本確認とする。

```powershell
docker compose -p ai-delivery-assistant ps
docker compose -p ai-delivery-assistant exec frontend npm run lint
docker compose -p ai-delivery-assistant exec frontend npm run build
docker compose -p ai-delivery-assistant exec backend php artisan test
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
$env:DB_DATABASE="ai_delivery_assistant_main"
docker compose -p ai-delivery-assistant -f C:\Users\asami\projects\ai-delivery-assistant-main\docker-compose.yml up -d --force-recreate
docker compose -p ai-delivery-assistant exec backend php artisan migrate
```

## Notes

この運用では、複数Worktreeで同時にコードを書くことはできるが、Dockerでの画面確認は1つずつ行う。

複数機能を同時にブラウザで開いて比較したい場合は、別project名、別ポート、別DBを使う必要がある。ただし、このプロジェクトではDocker環境を1つに保つ方針を優先する。
