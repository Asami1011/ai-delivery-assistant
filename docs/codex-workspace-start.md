# Codex Workspace Start

Codexがこのプロジェクトで新しいチャットを開始した場合、最初に以下を確認すること。

1. 現在のワークスペースが `C:\Users\asami\projects` か確認する。
2. `C:\Users\asami\projects\ai-delivery-assistant-common\docs\ai-development-rules.md` を確認する。
3. `C:\Users\asami\projects\ai-delivery-assistant-common\docs\git-worktree-development.md` を確認する。
4. 対象機能に対応するWorktree、ブランチ、`.env.worktree`、DBを確認する。

推奨ワークスペース:

`C:\Users\asami\projects`

理由:

- `ai-delivery-assistant-common` を同時に参照できる
- Worktree群を同じ親ディレクトリで扱える
- 新しいチャットでも共通ルールの見落としを減らせる

現在のチャットが `C:\Users\asami\projects\ai-delivery-assistant` のような単一repoワークスペースで始まっている場合でも、共通repo側のドキュメントを先に確認してから開発を始めること。
