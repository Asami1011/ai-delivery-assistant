# AI Code Review Form

## 目的

AIレビュア機能で利用する入力フォーム仕様を定義する。

ユーザーが入力した要件定義、タスク分解、コード差分、設計メモ、実装メモなどの成果物をもとに、AIへレビュー生成用の構造化データを渡す。

## 対象機能

- AIレビュア
- Frontend page: `/code-review`
- Backend API: `POST /api/ai/generate`
- feature: `code_review`

## 実装着手前の方針

- レビュー観点の基準には [review-guidelines.md](C:\Users\asami\projects\ai-delivery-assistant-review\docs\review-guidelines.md) を利用する
- まずは Markdown 出力でMVPを成立させる
- 6.6 の重要度付きレビュー表示は、Phase 1 では Markdown 内の `P0（重大）`〜`P3（軽微）` 見出しで表現する
- 保存、履歴、構造化 findings は後続拡張とする
- AIレビュアは入力が大きくなりやすいため、入力上限とモデル分岐の方針を先に明記する

## 入力項目

| 項目ID | 表示名 | 入力形式 | 必須/任意 | プレースホルダー |
| --- | --- | --- | --- | --- |
| `review_type` | レビュー対象の種類 | select | 必須 | 例: 要件定義 |
| `technology` | 技術スタック | text | 必須 | 例: Next.js / Laravel / PostgreSQL |
| `review_target` | レビュー対象 | textarea | 必須 | 例: 要件定義、タスク分解、コード差分、設計メモ、実装メモを貼り付ける |
| `review_focus` | 何をどうレビューしてほしいか | textarea | 必須 | 例: 要件の抜け漏れ、優先度の妥当性、セキュリティ、テスト不足を重点的に確認したい |
| `context` | 背景・前提 | textarea | 任意 | 例: MVP開発中。保存機能は後続で、まずはMarkdown表示を優先 |
| `output_level` | 出力の詳しさ | select | 任意 | 標準 |
| `notes` | 補足情報 | textarea | 任意 | 例: 重大度順に、修正優先度が分かる形で出してほしい |

## 入力項目詳細

### review_type

レビュー対象が何であるかを示す分類。

- 必須
- 初期値: `requirements`
- 選択肢:
  - `requirements`: 要件定義
  - `task_breakdown`: タスク分解
  - `code_diff`: コード差分
  - `design_note`: 設計メモ
  - `other`: その他
- AIがレビュー観点を合わせやすくするために使う

### technology

レビュー対象で利用している技術スタック、フレームワーク、実行環境。

- 必須
- 文字数: 1〜200文字
- 複数技術は `/`、`,`、改行などで入力可能にする

### review_target

レビュー対象となる成果物本文または抜粋。

- 必須
- 文字数: 20〜12000文字
- Markdown、プレーンテキスト、コードブロックを許容する
- MVPではファイルアップロードではなくtextarea入力を前提にする
- 要件定義、タスク分解、コード差分、設計メモ、実装メモなどを想定する
- 巨大なリポジトリ全体ではなく、レビューしたい範囲に絞った入力を前提にする

### review_focus

重点的に確認したい観点と、どのようにレビューしてほしいか。

- 必須
- 文字数: 2〜2000文字
- 例: 抜け漏れ、曖昧さ、優先度、依存関係、バグ、セキュリティ、API契約、責務分離、テスト不足
- 「何をレビューしてほしいか」と「どういう基準で見てほしいか」をまとめて記載する
- 未指定に近い入力でも、`review-guidelines.md` の共通観点を基準にレビューする

### context

レビュー対象の背景、実装段階、制約、判断済み事項。

- 任意
- 文字数: 0〜3000文字
- 未入力の場合は空文字として扱う
- AIが過剰なリファクタリングを提案しないよう、MVP段階や後続対応の前提を入力できるようにする

### output_level

AIが生成するレビュー結果の詳しさ。

- 任意
- 初期値: `standard`
- 選択肢:
  - `short`: 重要な指摘に絞る
  - `standard`: MVPで使いやすい標準粒度
  - `detailed`: 指摘理由と修正案をやや詳細にする

### notes

AIに伝えたい補足情報や出力上の希望。

- 任意
- 文字数: 0〜2000文字
- 未入力の場合は空文字として扱う

## バリデーション

| 項目ID | ルール |
| --- | --- |
| `review_type` | required, string, in:requirements,task_breakdown,code_diff,design_note,other |
| `technology` | required, string, min:1, max:200 |
| `review_target` | required, string, min:20, max:12000 |
| `review_focus` | required, string, min:2, max:2000 |
| `context` | nullable, string, max:3000 |
| `output_level` | nullable, string, in:short,standard,detailed |
| `notes` | nullable, string, max:2000 |

## 送信例

```json
{
  "review_type": "requirements",
  "technology": "Next.js / Laravel / PostgreSQL",
  "review_target": "レビュー対象の要件定義、タスク分解、コード差分、設計メモなどをここに貼り付ける。",
  "review_focus": "何をどうレビューしてほしいか。たとえば、要件の抜け漏れ、優先度の妥当性、セキュリティ、テスト不足を重点的に確認したい。",
  "context": "MVP開発中。保存機能と認証は後続で、まずはMarkdown表示とAPI契約を優先している。",
  "output_level": "standard",
  "notes": "P0-P3の重要度順に、修正理由と修正案を簡潔に出してほしい。"
}
```

## AIへ渡すデータ構造

現在の共通AI APIでは `feature` と `input` を受け取るため、Frontend側でフォーム入力値を JSON文字列に整形して送信する。

### API Request

```json
{
  "feature": "code_review",
  "input": "{ \"review_type\": \"requirements\", \"technology\": \"Next.js / Laravel / PostgreSQL\", \"review_target\": \"...\", \"review_focus\": \"...\", \"context\": \"...\", \"output_level\": \"standard\", \"notes\": \"...\" }"
}
```

## AI生成時に期待する出力

AIは以下をMarkdownで生成する。

- 概要
- 指摘事項
- 良い点
- 改善提案
- テスト観点
- 次に直すべき順

## Finding 1件あたりの期待項目

将来的な構造化 findings を見据えて、Markdown内では最低限以下の項目を含める。

- 重要度: `P0（重大）`, `P1（重要）`, `P2（改善推奨）`, `P3（軽微）`
- タイトル
- 対象ファイル
- 該当箇所
- 問題
- 理由
- 修正案

## 重要度表現

重要度は `review-guidelines.md` に合わせて `P0`〜`P3` を使い、表示上は日本語補足を添える。

- `P0（重大）`: 即修正が必要な重大問題
- `P1（重要）`: リリース前に修正したい重要問題
- `P2（改善推奨）`: 品質向上のために修正したい問題
- `P3（軽微）`: 任意で改善してよい軽微な問題

## AIレビュア特有の制約

- `review_target` は他機能より長くなりやすいため、MVPでは 12000文字を上限候補とする
- 将来的には `AI_MAX_INPUT_LENGTH` を機能別に制御する
- 将来的には `OPENAI_MODEL_REVIEW` を利用し、通常生成機能とレビュー機能のモデルを分ける
- 初回実装では共通 `POST /api/ai/generate` と Markdown表示を優先し、モデル分岐や入力上限制御は後続でもよい
- レビュー対象が大きすぎる場合は、差分や対象ファイルを絞る案内を出す

## UI方針

- 必須項目には必須表示を付ける
- レビュー対象は長文入力しやすいtextareaを利用する
- レビュー観点は初回MVPではtextareaで実装し、後続でチェックボックス化してもよい
- `review_focus` は、レビュー観点だけでなく「どう見てほしいか」も書ける説明にする
- レビュー対象ごとのサンプル入力プリセットを用意し、要件定義レビュー、タスク分解レビュー、コード差分レビューへすぐ切り替えられるようにする
- バリデーションエラーは項目の近くに表示する
- 送信中はLoading表示を出す
- 生成失敗時はError表示を出す
- MVPではMarkdown結果表示を優先する
- 6.6 では `P0（重大）`〜`P3（軽微）` の見出しが読み取れるMarkdown表示で完了扱いにできる

## 6.1〜6.6 着手前に確定すべきこと

### 6.1 レビュー対象入力の設計

- `review_focus` をtextareaのまま始めるか、チェックボックスにするか
- `review_target` の文字数上限を 12000文字で開始するか

### 6.2 レビュー観点の整理

- `review-guidelines.md` を基準ドキュメントとして固定するか
- AIレビュア専用に観点を抜粋した短いプロンプト用基準を作るか

### 6.3 プロンプト設計

- 出力見出しを `Summary / Findings / Good Points / Suggested Refactoring / Test Suggestions` で固定するか
- 指摘がない場合の `Findings` 表現を固定するか

### 6.4 入力フォーム実装

- `/code-review` の既存導線をそのまま使うか
- レビュー観点のプリセットUIを初回から入れるか

### 6.5 AIレビュー処理実装

- 初回は共通モデルを使うか
- `OPENAI_MODEL_REVIEW` を同時に導入するか

### 6.6 指摘結果表示

- MVPではMarkdown表示のみで完了とするか
- P0-P3 の日本語補足表示や簡易フィルタを追加するか

## 備考

将来的にAIレビュア専用APIを作る場合は、`input` 文字列ではなく、構造化JSONをBackend側で直接受け取る形に変更する可能性がある。

構造化 findings、保存、履歴、修正提案のIssue化は、MVPのAIレビュア完了後に検討する。
