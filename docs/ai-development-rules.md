# AI Development Rules

## Canonical Source

このドキュメントの正本は `C:\Users\asami\projects\ai-delivery-assistant-common\docs\ai-development-rules.md` とする。

Codexは開発着手前に、可能であればワークスペースを `C:\Users\asami\projects` として開始し、`ai-delivery-assistant-common` を同時に参照できる状態にすること。

ワークスペースが `C:\Users\asami\projects\ai-delivery-assistant` のように単一repo配下で開始された場合でも、このローカルコピーだけで判断せず、共通repo側の正本も確認してから作業すること。

## 着手前の提案

ユーザーから「着手前に何をするか提案して」と依頼された場合、Codexは実装方針だけでなく、開発着手前の準備手順も提案に含めること。

提案には、少なくとも以下を含めること。

1. 現在のワークスペース確認と、必要に応じた `C:\Users\asami\projects` での作業前提の共有
2. `C:\Users\asami\projects\ai-delivery-assistant-common\docs\ai-development-rules.md` と `C:\Users\asami\projects\ai-delivery-assistant-common\docs\git-worktree-development.md` の確認
3. 対象機能に対応するブランチ名とWorktreeの作成または確認
4. `.env.worktree` と `DB_DATABASE` の確認または生成
5. 必要に応じた Docker 起動、`migrate`、`api/health` 確認
6. その後に実施する実装・確認・検証の流れ

着手前提案では、「どの docs を確認するか」「どの branch / Worktree / DB を使うか」が読み取れる状態にすること。

着手前提案を文章で返す場合は、原則として以下の順に並べること。

1. 確認する docs
2. 使用する branch / Worktree
3. 使用する `.env.worktree` / `DB_DATABASE`
4. 起動・確認コマンド
5. その後に進む実装対象

ワークスペースが `C:\Users\asami\projects` ではない場合は、その事実を最初に伝えたうえで、共通repo側の正本確認を提案に含めること。

ユーザーから実装着手の許可を得る前であっても、以下の準備作業を提案対象に含めてよい。

- docs確認
- branch / Worktree の確認または作成
- `.env.worktree` の生成
- Docker 起動
- `migrate`
- `api/health` 確認

ただし、削除系操作、既存branchの履歴改変、不要DBの削除、他Worktreeのcleanupは、別途ユーザー確認が必要な操作として扱うこと。

## コミット依頼時

Codexはコミットを実行する前に、現在のブランチ名を確認すること。

現在の作業内容がそのブランチでコミットするのに適切かを判断し、ユーザーへ簡潔に伝えてからコミットすること。

ブランチが不適切な可能性がある場合は、コミット前にユーザーへ確認すること。

今後Codexが本プロジェクトで作業を行う際は、このドキュメントのルールを参照し、作業完了時の報告形式を統一する。

コミット、push、Pull Request作成の前には、対象変更に必要な検証を必ず完了させること。

検証が未実施、失敗中、または結果が未確認の状態では、勝手にcommit、push、PR作成を進めないこと。

commit、push、PR作成へ進む前に、実施した確認内容と結果をユーザーに共有すること。

実装依頼を受けた場合は、実装完了後にまず変更内容をまとめたテキストを返し、その時点ではcommit、push、PR作成を行わないこと。

ユーザーによる検証完了とOKの確認後に、commit、push、必要に応じてPR作成へ進むこと。

## 作業完了時

必ず以下を報告すること。

### 実施内容

何を実装したか。

### 変更ファイル

変更したファイル一覧。

### 追加ファイル

新規作成ファイル一覧。

### 削除ファイル

削除ファイル一覧。

### 設計判断

なぜその設計にしたか。

### 確認内容

実行したコマンド。

### 確認結果

以下の観点で結果を報告する。

- lint
- build
- test
- api

### リスク

懸念事項。

### 次の推奨タスク

WBS上の次タスク。

## Push後のPR対応

Codexがブランチをpushした場合は、その時点でpushした内容をまとめ、可能な限りPull Requestの作成まで実施すること。

Worktreeで並行開発する場合は、原則として `1 Worktree = 1機能 = 1ブランチ = 1PR` とする。

機能ごとのWorktreeで作業した変更は、それぞれ別のPull Requestとして作成する。

共通基盤の変更が必要な場合は、共通基盤用Worktreeと共通基盤用ブランチで作業し、機能PRとは分離する。

共通基盤PRがある場合の推奨順序は以下とする。

- 共通基盤PRを先に `main` へmergeする
- 各機能Worktreeで `main` を取り込む
- 各機能PRを原則 `base = main` で作成する

stacked PR が必要な場合を除き、機能PR同士を直接依存させないこと。

PRのbaseブランチは、原則として最終的なマージ先である `main` とする。

ただし、別PRで先にmainへ入れる前提の共通基盤ブランチや先行機能ブランチに依存している場合は、PR作成前に以下を確認すること。

- `main` をbaseにしたときに意図しない差分が含まれていないか
- 先行ブランチを先にmainへmergeすべきか
- 一時的に先行ブランチをbaseにしたstacked PRにすべきか

最終的にmainへ入れるPRでは、mainとの差分がレビュー対象になる。差分が大きい場合でも、意図した依存差分であればmain baseで問題ない。

PR作成直前のファイル確認は、GitHub画面の折り畳み表示や目視だけに頼らないこと。

必ずGitHub API、`git diff --name-status <base>...HEAD`、またはGitHub connectorのchanged files取得結果を使い、実際の変更ファイル一覧を確認してからPR本文へ反映する。

PR作成時は、以下を含むMarkdown形式の本文を作成してGitHub Pull Requestへ設定する。

- PRタイトル
- PR本文
- 実施内容
- 変更ファイル
- 追加ファイル
- 削除ファイル
- 確認内容
- 確認結果
- リスクまたは補足

PR作成後は、作業結果としてPR URL、対象ブランチ、baseブランチ、確認結果を報告する。

PRを作成できない場合のみ、理由を明記したうえで、GitHubのPull Request本文へそのまま貼れるMarkdown形式のPR本文案を提示する。
