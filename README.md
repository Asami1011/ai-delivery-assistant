# ai-delivery-assistant

## Documents

- [Development Guide](docs/development.md)
- [Cost Strategy](docs/cost.md)

## プロジェクト概要

AIを活用して、要件定義、タスク分解、コードレビュー、業務改善提案を支援する開発支援プラットフォームです。

このリポジトリは、ポートフォリオ、技術力維持、将来的なSaaS化を目的として開発します。現在はアプリケーション基盤の構築段階であり、AI機能の実装はまだ行っていません。

## 技術スタック

| 領域 | 技術 |
| --- | --- |
| Frontend | Next.js 15, TypeScript, TailwindCSS |
| Backend | Laravel 12 |
| Database | PostgreSQL |
| AI | OpenAI API |
| Infrastructure | Vercel, Railway, Render |
| Development | Docker, Docker Compose, GitHub, Codex |

## ディレクトリ構成

```text
ai-delivery-assistant/
├─ frontend/          # Next.js frontend
├─ backend/           # Laravel API backend
├─ docs/              # Project documents
├─ docker-compose.yml # Local development services
├─ .env.example       # Environment variable template
└─ README.md
```

## ローカル起動手順

初回は `.env.example` をコピーして `.env` を作成します。

```bash
cp .env.example .env
```

Dockerでローカル開発環境を起動します。

```bash
docker compose up --build
```

バックグラウンドで起動する場合:

```bash
docker compose up --build -d
```

詳細なセットアップ、ログ確認、トラブルシュートは [docs/development.md](docs/development.md) を参照してください。

## URL

- Frontend: http://localhost:3000
- Backend health check: http://localhost:8000/api/health
- PostgreSQL: localhost:5432

## よく使うコマンド

Dockerサービスを起動:

```bash
docker compose up --build
```

Dockerサービスを停止:

```bash
docker compose down
```

コンテナ状態を確認:

```bash
docker compose ps
```

ログを確認:

```bash
docker compose logs -f
```

Frontend lint:

```bash
docker compose exec frontend npm run lint
```

Frontend build:

```bash
docker compose exec frontend npm run build
```

Backend artisan:

```bash
docker compose exec backend php artisan
```

Backend composer:

```bash
docker compose exec backend composer install
```

## 環境変数の注意

`.env` は絶対にコミットしないでください。

- `OPENAI_API_KEY` は `.env` または本番環境のBackendホスティングサービスの環境変数にのみ設定します
- `.env.example` には必要な環境変数名とローカル開発用のサンプル値だけを記載します
- FrontendからOpenAI APIを直接呼び出さず、必ずLaravel Backend API経由で呼び出します
