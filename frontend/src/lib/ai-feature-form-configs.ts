import type { AiGenerateFeature } from "@/lib/ai-client";

export type OutputLevel = "short" | "standard" | "detailed";

export type AiFeatureFormValues = Record<string, string>;

export type AiFeatureFormField = {
  name: string;
  label: string;
  type: "input" | "textarea" | "select";
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  hint: string;
  className?: string;
  options?: { value: string; label: string }[];
};

export type AiFeatureFormConfig = {
  feature: AiGenerateFeature;
  formTitle: string;
  submitLabel: string;
  submittingLabel: string;
  storageKey: string;
  initialValues: AiFeatureFormValues;
  sampleValues: AiFeatureFormValues;
  fields: AiFeatureFormField[];
  previewTitle: string;
  resultTitle: string;
  resultLoadingLabel: string;
  resultEmptyMessage: string;
  readyTitle: string;
  readyMessage: string;
  expectedOutputTitle: string;
  expectedOutputs: string[];
};

const outputLevelOptions = [
  { value: "short", label: "簡易" },
  { value: "standard", label: "標準" },
  { value: "detailed", label: "詳細" },
];

export const outputLevelLabels: Record<OutputLevel, string> = {
  short: "簡易",
  standard: "標準",
  detailed: "詳細",
};

const outputLevelField: AiFeatureFormField = {
  name: "output_level",
  label: "出力の詳しさ",
  type: "select",
  hint: "AIが生成する内容の詳しさを指定します。",
  options: outputLevelOptions,
};

const notesField: AiFeatureFormField = {
  name: "notes",
  label: "補足情報",
  type: "textarea",
  maxLength: 2000,
  placeholder: "文体、重視したい観点、AIへの追加指示などがあれば入力してください。",
  hint: "任意、2000文字以内。",
  className: "min-h-28",
};

export const requirementsFormConfig: AiFeatureFormConfig = {
  feature: "requirements",
  formTitle: "AI要件定義 入力フォーム",
  submitLabel: "AIで要件定義を生成",
  submittingLabel: "AI生成中...",
  storageKey: "ai-delivery-assistant:requirements-form",
  initialValues: {
    product_name: "",
    background: "",
    problem: "",
    target_users: "",
    goal: "",
    constraints: "",
    output_level: "standard",
    notes: "",
  },
  sampleValues: {
    product_name: "AI Delivery Assistant",
    background:
      "要件定義からタスク分解、レビュー、業務改善までを一気通貫で支援できるAIプラットフォームを作りたい。まずはポートフォリオ用途で立ち上げ、将来的にはSaaS化も見据えている。",
    problem:
      "ドキュメント作成、タスク整理、レビュー観点整理を人力で行うと時間がかかり、品質のばらつきも出やすい。開発初期に必要な情報整理をもっと早く進めたい。",
    target_users: "個人開発者、小規模開発チーム、要件整理に時間をかけにくいエンジニア",
    goal:
      "AIを使って要件定義の初稿を短時間で作成し、そのまま後続のタスク分解やレビュー工程へつなげられる状態を作る。",
    constraints:
      "初期段階では Next.js / Laravel / PostgreSQL を前提とし、OpenAI APIキーはBackend側の環境変数で管理する。MVPでは保存機能や認証は最小構成にとどめる。",
    output_level: "standard",
    notes:
      "ポートフォリオ用途でも見栄えが良く、後続のAIタスク分解に流し込みやすいMarkdown形式を意識してほしい。",
  },
  fields: [
    {
      name: "product_name",
      label: "プロダクト名",
      type: "input",
      required: true,
      minLength: 1,
      maxLength: 100,
      placeholder: "AI Delivery Assistant",
      hint: "プロダクト名またはサービス名を入力してください。",
      className: "md:col-span-2",
    },
    {
      name: "background",
      label: "背景",
      type: "textarea",
      required: true,
      minLength: 10,
      maxLength: 2000,
      placeholder: "現在の状況、このプロダクトを作る理由、検討に至った背景を入力してください。",
      hint: "10文字以上2000文字以内。",
      className: "min-h-36 md:col-span-2",
    },
    {
      name: "problem",
      label: "解決したい課題",
      type: "textarea",
      required: true,
      minLength: 10,
      maxLength: 2000,
      placeholder: "解決したい課題を入力してください。箇条書きでも問題ありません。",
      hint: "10文字以上2000文字以内。",
      className: "min-h-36 md:col-span-2",
    },
    {
      name: "target_users",
      label: "想定ユーザー",
      type: "textarea",
      required: true,
      minLength: 2,
      maxLength: 1000,
      placeholder: "個人開発者、初学者、小規模チームなど、想定する利用者を入力してください。",
      hint: "2文字以上1000文字以内。",
      className: "min-h-28 md:col-span-2",
    },
    {
      name: "goal",
      label: "実現したいこと",
      type: "textarea",
      required: true,
      minLength: 10,
      maxLength: 2000,
      placeholder: "このプロダクトで実現したいこと、到達したい状態を入力してください。",
      hint: "10文字以上2000文字以内。",
      className: "min-h-36 md:col-span-2",
    },
    {
      name: "constraints",
      label: "制約・前提条件",
      type: "textarea",
      maxLength: 2000,
      placeholder: "MVPの範囲、技術的制約、納期、前提条件などがあれば入力してください。",
      hint: "任意、2000文字以内。",
      className: "min-h-28 md:col-span-2",
    },
    outputLevelField,
    notesField,
  ],
  previewTitle: "入力内容プレビュー",
  resultTitle: "生成結果",
  resultLoadingLabel: "AIが要件定義を生成しています...",
  resultEmptyMessage:
    "左側フォームから「AIで要件定義を生成」を押すと、ここに生成結果が表示されます。",
  readyTitle: "送信準備ができています。",
  readyMessage: "必須項目が入力されており、この内容をそのまま共通AI APIへ渡せる状態です。",
  expectedOutputTitle: "期待される出力",
  expectedOutputs: [
    "概要",
    "背景",
    "解決すべき課題",
    "目的",
    "想定ユーザー",
    "機能要件",
    "非機能要件",
    "制約条件",
    "成功指標",
    "未確定事項",
  ],
};

export const taskBreakdownFormConfig: AiFeatureFormConfig = {
  feature: "task_breakdown",
  formTitle: "AIタスク分解 入力フォーム",
  submitLabel: "AIでタスク分解を生成",
  submittingLabel: "AI生成中...",
  storageKey: "ai-delivery-assistant:task-breakdown-form",
  initialValues: {
    project_name: "",
    requirements_text: "",
    delivery_goal: "",
    team_context: "",
    constraints: "",
    output_level: "standard",
    notes: "",
  },
  sampleValues: {
    project_name: "AI Delivery Assistant",
    requirements_text:
      "要件定義フォームで入力した背景、課題、目的をもとに、AIがMarkdown形式の要件定義を生成できる。生成結果は後続工程へ流用しやすい構成にする。",
    delivery_goal: "2週間でMVPとして要件定義、タスク分解、レビュー、業務改善提案の主要画面を確認できる状態にする。",
    team_context: "個人開発。Next.js、Laravel、PostgreSQL を利用し、AI API連携はBackendに閉じる。",
    constraints: "保存機能と認証は後続。まずは画面入力、API連携、デモレスポンス確認を優先する。",
    output_level: "standard",
    notes: "WBSに貼り付けやすいよう、優先度、依存関係、見積もりを含めてほしい。",
  },
  fields: [
    {
      name: "project_name",
      label: "対象プロジェクト",
      type: "input",
      required: true,
      minLength: 1,
      maxLength: 100,
      placeholder: "AI Delivery Assistant",
      hint: "タスク分解したいプロジェクト名を入力してください。",
      className: "md:col-span-2",
    },
    {
      name: "requirements_text",
      label: "要件定義テキスト",
      type: "textarea",
      required: true,
      minLength: 20,
      maxLength: 8000,
      placeholder: "要件定義、仕様メモ、実現したい機能を貼り付けてください。",
      hint: "20文字以上8000文字以内。",
      className: "min-h-48 md:col-span-2",
    },
    {
      name: "delivery_goal",
      label: "到達目標",
      type: "textarea",
      required: true,
      minLength: 10,
      maxLength: 2000,
      placeholder: "いつまでに、どの状態まで進めたいかを入力してください。",
      hint: "10文字以上2000文字以内。",
      className: "min-h-28 md:col-span-2",
    },
    {
      name: "team_context",
      label: "体制・技術前提",
      type: "textarea",
      maxLength: 2000,
      placeholder: "人数、担当範囲、利用技術、既存資産などを入力してください。",
      hint: "任意、2000文字以内。",
      className: "min-h-28 md:col-span-2",
    },
    {
      name: "constraints",
      label: "制約・優先条件",
      type: "textarea",
      maxLength: 2000,
      placeholder: "納期、スコープ、品質、避けたい作業などがあれば入力してください。",
      hint: "任意、2000文字以内。",
      className: "min-h-28 md:col-span-2",
    },
    outputLevelField,
    notesField,
  ],
  previewTitle: "入力内容プレビュー",
  resultTitle: "生成結果",
  resultLoadingLabel: "AIがタスク分解を生成しています...",
  resultEmptyMessage:
    "左側フォームから「AIでタスク分解を生成」を押すと、ここに生成結果が表示されます。",
  readyTitle: "タスク分解の送信準備ができています。",
  readyMessage: "必須項目が入力されており、共通AI APIへ渡せる状態です。",
  expectedOutputTitle: "期待される出力",
  expectedOutputs: [
    "タスク一覧",
    "優先度",
    "依存関係",
    "見積もり",
    "WBS表示",
    "想定成果物",
    "リスク・注意点",
    "今回やらないこと",
    "確認観点",
    "マイルストーン",
    "未確定事項",
  ],
};

export const codeReviewFormConfig: AiFeatureFormConfig = {
  feature: "code_review",
  formTitle: "AIレビュア 入力フォーム",
  submitLabel: "AIでレビューを生成",
  submittingLabel: "AI生成中...",
  storageKey: "ai-delivery-assistant:code-review-form",
  initialValues: {
    technology: "",
    review_target: "",
    review_focus: "",
    context: "",
    output_level: "standard",
    notes: "",
  },
  sampleValues: {
    technology: "Next.js / TypeScript / Laravel",
    review_target:
      "AI生成フォームの入力値をlocalStorageに保存し、送信時にBackend APIへJSON文字列で渡す実装。共通化後も各機能で同じUI体験にしたい。",
    review_focus: "バグ、保守性、入力検証、ユーザー体験、テスト観点",
    context: "ポートフォリオ用MVP。まずは保存や認証より、デモしやすい画面とAPI連携を優先している。",
    output_level: "standard",
    notes: "重大度と修正方針が分かる形で整理してほしい。",
  },
  fields: [
    {
      name: "technology",
      label: "使用技術",
      type: "input",
      required: true,
      minLength: 1,
      maxLength: 200,
      placeholder: "Next.js / TypeScript / Laravel",
      hint: "レビュー対象の主要技術や言語を入力してください。",
      className: "md:col-span-2",
    },
    {
      name: "review_target",
      label: "レビュー対象",
      type: "textarea",
      required: true,
      minLength: 20,
      maxLength: 10000,
      placeholder: "コード、設計メモ、差分概要などを貼り付けてください。",
      hint: "20文字以上10000文字以内。",
      className: "min-h-48 md:col-span-2",
    },
    {
      name: "review_focus",
      label: "レビュー観点",
      type: "textarea",
      maxLength: 2000,
      placeholder: "セキュリティ、保守性、パフォーマンス、テストなど重視したい観点を入力してください。",
      hint: "任意、2000文字以内。",
      className: "min-h-28 md:col-span-2",
    },
    {
      name: "context",
      label: "背景・前提",
      type: "textarea",
      maxLength: 2000,
      placeholder: "実装の目的、制約、判断に迷っている点などを入力してください。",
      hint: "任意、2000文字以内。",
      className: "min-h-28 md:col-span-2",
    },
    outputLevelField,
    notesField,
  ],
  previewTitle: "入力内容プレビュー",
  resultTitle: "生成結果",
  resultLoadingLabel: "AIがレビューを生成しています...",
  resultEmptyMessage:
    "左側フォームから「AIでレビューを生成」を押すと、ここに生成結果が表示されます。",
  readyTitle: "レビュー生成の送信準備ができています。",
  readyMessage: "必須項目が入力されており、共通AI APIへ渡せる状態です。",
  expectedOutputTitle: "期待される出力",
  expectedOutputs: ["指摘一覧", "重大度", "修正方針", "確認すべきテスト", "残るリスク"],
};

export const businessImprovementFormConfig: AiFeatureFormConfig = {
  feature: "business_improvement",
  formTitle: "AI業務改善提案 入力フォーム",
  submitLabel: "AIで改善提案を生成",
  submittingLabel: "AI生成中...",
  storageKey: "ai-delivery-assistant:business-improvement-form",
  initialValues: {
    business_name: "",
    current_state: "",
    problem: "",
    target_state: "",
    constraints: "",
    output_level: "standard",
    notes: "",
  },
  sampleValues: {
    business_name: "開発初期のドキュメント作成",
    current_state:
      "要件定義、タスク分解、レビュー観点整理を個別のメモや手作業で進めており、情報の転記や粒度調整に時間がかかっている。",
    problem:
      "初稿作成に時間がかかる。成果物の形式がばらつく。後続工程に渡す情報が不足しやすい。",
    target_state:
      "AIで初稿を生成し、同じ入力情報を要件定義、タスク分解、レビュー、改善提案へ再利用できる状態にしたい。",
    constraints: "まずはポートフォリオMVPとして、保存や権限管理よりも入力から生成までの体験を優先する。",
    output_level: "standard",
    notes: "効果、実装難易度、最初に着手すべき改善案を含めてほしい。",
  },
  fields: [
    {
      name: "business_name",
      label: "業務名",
      type: "input",
      required: true,
      minLength: 1,
      maxLength: 100,
      placeholder: "開発初期のドキュメント作成",
      hint: "改善したい業務や作業の名前を入力してください。",
      className: "md:col-span-2",
    },
    {
      name: "current_state",
      label: "現状",
      type: "textarea",
      required: true,
      minLength: 10,
      maxLength: 3000,
      placeholder: "現在の進め方、関係者、使っているツールなどを入力してください。",
      hint: "10文字以上3000文字以内。",
      className: "min-h-36 md:col-span-2",
    },
    {
      name: "problem",
      label: "課題・ボトルネック",
      type: "textarea",
      required: true,
      minLength: 10,
      maxLength: 3000,
      placeholder: "時間がかかる、属人化している、ミスが起きやすいなどの課題を入力してください。",
      hint: "10文字以上3000文字以内。",
      className: "min-h-36 md:col-span-2",
    },
    {
      name: "target_state",
      label: "目指したい状態",
      type: "textarea",
      required: true,
      minLength: 10,
      maxLength: 2000,
      placeholder: "改善後にどうなっていたいかを入力してください。",
      hint: "10文字以上2000文字以内。",
      className: "min-h-28 md:col-span-2",
    },
    {
      name: "constraints",
      label: "制約・前提条件",
      type: "textarea",
      maxLength: 2000,
      placeholder: "予算、期間、利用できるツール、変更できない業務ルールなどがあれば入力してください。",
      hint: "任意、2000文字以内。",
      className: "min-h-28 md:col-span-2",
    },
    outputLevelField,
    notesField,
  ],
  previewTitle: "入力内容プレビュー",
  resultTitle: "生成結果",
  resultLoadingLabel: "AIが改善提案を生成しています...",
  resultEmptyMessage:
    "左側フォームから「AIで改善提案を生成」を押すと、ここに生成結果が表示されます。",
  readyTitle: "改善提案の送信準備ができています。",
  readyMessage: "必須項目が入力されており、共通AI APIへ渡せる状態です。",
  expectedOutputTitle: "期待される出力",
  expectedOutputs: ["現状整理", "ボトルネック", "改善案", "期待効果", "実装難易度", "最初の一手"],
};
