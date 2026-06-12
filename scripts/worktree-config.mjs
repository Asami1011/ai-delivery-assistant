export const DEFAULT_PROJECT_NAME = "ai-delivery-assistant";

export const FEATURE_PRESETS = new Map([
  [
    "main",
    {
      branch: "main",
      database: "ai_delivery_assistant_main",
      directoryName: "ai-delivery-assistant-main",
      description: "統合確認用",
    },
  ],
  [
    "common",
    {
      branch: "feature/common-foundation",
      database: "ai_delivery_assistant_common",
      directoryName: "ai-delivery-assistant-common",
      description: "共通基盤用",
    },
  ],
  [
    "requirements",
    {
      branch: "feature/requirements-ai",
      database: "ai_delivery_assistant_requirements",
      directoryName: "ai-delivery-assistant",
      description: "AI要件定義機能",
    },
  ],
  [
    "task-breakdown",
    {
      branch: "feature/task-breakdown-ai",
      database: "ai_delivery_assistant_task_breakdown",
      directoryName: "ai-delivery-assistant-task",
      description: "AIタスク分解機能",
    },
  ],
  [
    "review",
    {
      branch: "feature/review-ai",
      database: "ai_delivery_assistant_review",
      directoryName: "ai-delivery-assistant-review",
      description: "AIレビュア機能",
    },
  ],
  [
    "business-improvement",
    {
      branch: "feature/business-improvement-ai",
      database: "ai_delivery_assistant_business_improvement",
      directoryName: "ai-delivery-assistant-business",
      description: "AI業務改善提案機能",
    },
  ],
  [
    "history-export",
    {
      branch: "feature/history-and-export",
      database: "ai_delivery_assistant_history_export",
      directoryName: "ai-delivery-assistant-history",
      description: "履歴・保存・エクスポート機能",
    },
  ],
]);

export const BRANCH_TO_DATABASE = new Map(
  Array.from(FEATURE_PRESETS.values()).map((preset) => [preset.branch, preset.database]),
);

export function normalizeBranchToDatabase(branch) {
  const mapped = BRANCH_TO_DATABASE.get(branch);

  if (mapped) {
    return mapped;
  }

  const fallback = branch
    .toLowerCase()
    .replace(/^feature\//, "")
    .replace(/^hotfix\//, "")
    .replace(/^bugfix\//, "")
    .replace(/^release\//, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!fallback) {
    throw new Error(`Could not derive DB_DATABASE from branch: ${branch}`);
  }

  return `ai_delivery_assistant_${fallback}`;
}

export function resolvePreset(featureKey) {
  const preset = FEATURE_PRESETS.get(featureKey);

  if (!preset) {
    throw new Error(`Unknown feature preset: ${featureKey}`);
  }

  return preset;
}
