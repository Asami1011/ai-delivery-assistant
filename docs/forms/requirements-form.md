# AI Requirements Form

## 目的

AI要件定義機能で利用する入力フォーム仕様を定義する。

ユーザーが入力した情報をもとに、AIへ要件定義生成用の構造化データを渡す。

## 対象機能

- AI要件定義
- Frontend page: `/requirements`
- Backend API: `POST /api/ai/generate`
- feature: `requirements`

## 入力項目

| 項目ID | 表示名 | 入力形式 | 必須/任意 | プレースホルダー |
| --- | --- | --- | --- | --- |
| `product_name` | プロダクト名 | text | 必須 | 例: AI Delivery Assistant |
| `background` | 背景 | textarea | 必須 | 例: 要件定義やタスク分解に時間がかかっている |
| `problem` | 解決したい課題 | textarea | 必須 | 例: アイデアを開発可能な要件に整理できない |
| `target_users` | 想定ユーザー | textarea | 必須 | 例: 個人開発者、エンジニア初学者、小規模チーム |
| `goal` | 実現したいこと | textarea | 必須 | 例: 入力したアイデアから要件定義書をMarkdownで生成したい |
| `constraints` | 制約・前提条件 | textarea | 任意 | 例: MVPでは認証なし、OpenAI APIキー未設定時はデモレスポンス |
| `output_level` | 出力の詳しさ | select | 任意 | 標準 |
| `notes` | 補足情報 | textarea | 任意 | 例: ポートフォリオ用途を重視したい |

## 入力項目詳細

### product_name

プロダクトまたはサービスの名前。

- 必須
- 文字数: 1〜100文字
- 前後の空白は削除する

### background

なぜこのプロダクトを作るのか、現在の状況や背景。

- 必須
- 文字数: 10〜2000文字
- 具体的な業務背景や開発背景を入力する

### problem

解決したい課題。

- 必須
- 文字数: 10〜2000文字
- 複数ある場合は箇条書き入力を許可する

### target_users

想定ユーザー。

- 必須
- 文字数: 2〜1000文字
- 複数のユーザー種別を入力可能にする

### goal

実現したいこと、達成したい状態。

- 必須
- 文字数: 10〜2000文字
- 成功状態が分かるように入力する

### constraints

制約、前提条件、MVP範囲。

- 任意
- 文字数: 0〜2000文字
- 未入力の場合は空文字として扱う

### output_level

AIが生成する要件定義の詳しさ。

- 任意
- 初期値: `standard`
- 選択肢:
  - `short`: 簡潔
  - `standard`: 標準
  - `detailed`: 詳細

### notes

AIに伝えたい補足情報。

- 任意
- 文字数: 0〜2000文字
- 未入力の場合は空文字として扱う

## バリデーション

| 項目ID | ルール |
| --- | --- |
| `product_name` | required, string, min:1, max:100 |
| `background` | required, string, min:10, max:2000 |
| `problem` | required, string, min:10, max:2000 |
| `target_users` | required, string, min:2, max:1000 |
| `goal` | required, string, min:10, max:2000 |
| `constraints` | nullable, string, max:2000 |
| `output_level` | nullable, string, in:short,standard,detailed |
| `notes` | nullable, string, max:2000 |

## 送信例

```json
{
  "product_name": "AI Delivery Assistant",
  "background": "個人開発や小規模チーム開発では、アイデアを要件定義やタスクに落とし込む作業に時間がかかる。",
  "problem": "要件が曖昧なまま実装が始まり、手戻りが発生しやすい。タスク分解やレビュー観点も属人的になりやすい。",
  "target_users": "個人開発者、エンジニア初学者、小規模チームの開発者",
  "goal": "アイデアや課題を入力すると、開発に使える要件定義書をMarkdownで生成できるようにする。",
  "constraints": "MVPでは認証なし。OpenAI APIキー未設定時はデモレスポンスを返す。",
  "output_level": "standard",
  "notes": "ポートフォリオとして技術力が伝わる構成にしたい。"
}
```

## AIへ渡すデータ構造

現在の共通AI APIでは `feature` と `input` を受け取るため、Frontend側でフォーム入力値をMarkdownまたはJSON文字列に整形して送信する。

### API Request

```json
{
  "feature": "requirements",
  "input": "{ \"product_name\": \"AI Delivery Assistant\", \"background\": \"...\", \"problem\": \"...\", \"target_users\": \"...\", \"goal\": \"...\", \"constraints\": \"...\", \"output_level\": \"standard\", \"notes\": \"...\" }"
}
```

### input JSON

`input` には以下のJSON文字列を渡す。

```json
{
  "product_name": "AI Delivery Assistant",
  "background": "個人開発や小規模チーム開発では、アイデアを要件定義やタスクに落とし込む作業に時間がかかる。",
  "problem": "要件が曖昧なまま実装が始まり、手戻りが発生しやすい。",
  "target_users": "個人開発者、エンジニア初学者、小規模チームの開発者",
  "goal": "アイデアや課題を入力すると、開発に使える要件定義書をMarkdownで生成できるようにする。",
  "constraints": "MVPでは認証なし。OpenAI APIキー未設定時はデモレスポンスを返す。",
  "output_level": "standard",
  "notes": "ポートフォリオとして技術力が伝わる構成にしたい。"
}
```

## AI生成時に期待する出力

AIは以下をMarkdownで生成する。

- 概要
- 背景
- 目的
- 対象ユーザー
- 機能要件
- 非機能要件
- 制約・前提
- 成功指標
- 未決事項

## UI方針

- 必須項目には必須表示を付ける
- 入力欄は長文入力しやすいtextareaを中心にする
- バリデーションエラーは項目の近くに表示する
- 送信中はLoading表示を出す
- 生成失敗時はError表示を出す
- 生成結果はMarkdownとして表示する

## 備考

将来的にAI要件定義専用APIを作る場合は、`input` 文字列ではなく、構造化JSONをBackend側で直接受け取る形に変更する可能性がある。
