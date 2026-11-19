# Development Guide

## コスト管理方針

AI API利用料を抑えるため、ローカル開発では以下を基本方針とする。

- `OPENAI_API_KEY` 未設定時はデモレスポンスで動作確認する
- 実APIを利用する場合のみ `backend/.env` に `OPENAI_API_KEY` を設定する
- `.env` はGit管理対象にしない
- モデル名は環境変数で切り替える
- 入力文字数と出力トークン上限を設定する
- AIレビュアは入力サイズが大きくなりやすいため、レビュー対象を必要最小限にする
- 詳細な方針は [Cost Strategy](cost.md) を参照する

## 概要

このドキュメントは、ai-delivery-assistant をローカルで開発するための手順書です。

別PCや他ユーザーでも同じ手順で環境構築できるよう、Docker Composeを前提にしています。

## 初回セットアップ手順

### 1. 必要なツール

以下をインストールしてください。

- Git
- Docker Desktop
- Docker Compose

Node.js、PHP、Composer、PostgreSQLはDockerコンテナ内で利用するため、ローカルに直接インストールしなくても開発できます。

### 2. リポジトリを取得

```bash
git clone <repository-url>
cd ai-delivery-assistant
```

### 3. 環境変数ファイルを作成

```bash
cp .env.example .env
```

Windows PowerShellの場合:

```powershell
Copy-Item .env.example .env
```

`.env` はGit管理対象外です。APIキーや秘密情報は `.env` にのみ保存してください。

`APP_KEY` は環境ごとに生成し、`.env` に設定してください。Docker を利用する場合は次のコマンドで生成できます。

```bash
docker run --rm php:8.3-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

Worktree で `.env.worktree` を使う場合は、`node scripts/generate-worktree-env.mjs` で新規生成すると固有の `APP_KEY` が入ります。既存の `.env.worktree` には別途生成した値を追加してください。

### 4. Dockerを起動

Docker Desktopを起動してから、以下を実行します。

```bash
docker compose up --build
```

バックグラウンドで起動する場合:

```bash
docker compose up --build -d
```

### 5. 起動確認

Frontend:

```text
http://localhost:3000
```

Backend health check:

```text
http://localhost:8000/api/health
```

期待するBackendレスポンス:

```json
{
  "status": "ok",
  "service": "ai-delivery-assistant-api"
}
```

## 通常の開発開始手順

2回目以降は、Docker Desktopを起動してから以下を実行します。

```bash
docker compose up -d
```

依存関係やDockerfileを変更した場合は、再ビルドします。

```bash
docker compose up --build -d
```

## 開発終了時の停止手順

コンテナを停止します。

```bash
docker compose down
```

データベースのデータも含めて削除したい場合のみ、volumeも削除します。

```bash
docker compose down -v
```

通常の開発終了では `-v` は付けないでください。PostgreSQLのローカルデータが削除されます。

## Dockerコンテナ確認方法

起動中のサービスを確認します。

```bash
docker compose ps
```

想定サービス:

- `frontend`
- `backend`
- `db`

Docker全体の状態を確認する場合:

```bash
docker info
```

## ログ確認方法

全サービスのログ:

```bash
docker compose logs -f
```

Frontendのみ:

```bash
docker compose logs -f frontend
```

Backendのみ:

```bash
docker compose logs -f backend
```

Databaseのみ:

```bash
docker compose logs -f db
```

## Frontendコマンド

Frontendコンテナ内でlintを実行します。

```bash
docker compose exec frontend npm run lint
```

Frontendコンテナ内でbuildを実行します。

```bash
docker compose exec frontend npm run build
```

Frontendコンテナに入る場合:

```bash
docker compose exec frontend sh
```

ローカルにNode.jsを入れている場合は、`frontend` ディレクトリで直接実行することもできます。

```bash
cd frontend
npm run lint
npm run build
```

## Backendコマンド

Backendコンテナ内でartisanを実行します。

```bash
docker compose exec backend php artisan
```

ルート一覧:

```bash
docker compose exec backend php artisan route:list
```

マイグレーション:

```bash
docker compose exec backend php artisan migrate
```

Composer install:

```bash
docker compose exec backend composer install
```

Composer update:

```bash
docker compose exec backend composer update
```

Backendコンテナに入る場合:

```bash
docker compose exec backend sh
```

## Databaseコマンド

PostgreSQLコンテナに接続します。

```bash
docker compose exec db psql -U postgres -d ai_delivery_assistant
```

## トラブルシュート

### Dockerデーモンが起動していない

症状:

```text
Cannot connect to the Docker daemon
```

対応:

- Docker Desktopを起動する
- Docker Desktopの起動完了を待つ
- `docker info` でServer情報が表示されるか確認する

### Docker設定ファイルの権限エラーが出る

症状:

```text
unable to read config file
```

対応:

- Docker Desktopが起動しているか確認する
- ターミナルを開き直す
- 権限のあるターミナルで `docker info` を実行する

### ポートが使用中

症状:

```text
port is already allocated
```

対応:

- `3000`、`8000`、`5432` を使っている別プロセスを停止する
- 既存のDockerコンテナを確認する

```bash
docker ps
```

### Frontendが起動しない

対応:

```bash
docker compose logs -f frontend
docker compose build frontend --no-cache
docker compose up -d frontend
```

### Backendが起動しない

対応:

```bash
docker compose logs -f backend
docker compose exec backend composer install
docker compose exec backend php artisan route:list
```

### Databaseに接続できない

対応:

```bash
docker compose ps
docker compose logs -f db
docker compose exec db pg_isready -U postgres -d ai_delivery_assistant
```

### 依存関係を最初から入れ直したい

Frontend:

```bash
docker compose exec frontend npm install
```

Backend:

```bash
docker compose exec backend composer install
```

Docker volumeも作り直したい場合:

```bash
docker compose down -v
docker compose up --build -d
```

### .envを誤ってGitに出したくない

確認:

```bash
git status --short --ignored
git ls-files | grep .env
```

PowerShellの場合:

```powershell
git ls-files | Select-String -Pattern "\.env"
```

期待値は `.env.example` のみです。
