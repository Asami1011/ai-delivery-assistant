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
  quickPicks?: { label: string; value: string }[];
};

export type AiFeatureFormConfig = {
  feature: AiGenerateFeature;
  formTitle: string;
  submitLabel: string;
  submittingLabel: string;
  storageKey: string;
  initialValues: AiFeatureFormValues;
  sampleValues: AiFeatureFormValues;
  samplePresets?: {
    label: string;
    values: AiFeatureFormValues;
  }[];
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

const reviewTypeOptions = [
  { value: "requirements", label: "要件定義" },
  { value: "task_breakdown", label: "タスク分解" },
  { value: "code_diff", label: "コード差分" },
  { value: "design_note", label: "設計メモ" },
  { value: "other", label: "その他" },
];

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
  expectedOutputs: ["タスク一覧", "優先度", "依存関係", "見積もり", "マイルストーン", "未確定事項"],
};

export const codeReviewFormConfig: AiFeatureFormConfig = {
  feature: "code_review",
  formTitle: "AIレビュア 入力フォーム",
  submitLabel: "AIでレビューを生成",
  submittingLabel: "AI生成中...",
  storageKey: "ai-delivery-assistant:code-review-form",
  initialValues: {
    review_type: "requirements",
    technology: "",
    review_target: "",
    review_focus: "",
    context: "",
    output_level: "standard",
    notes: "",
  },
  sampleValues: {
    review_type: "requirements",
    technology: "Next.js / Laravel / PostgreSQL",
    review_target:
      "AI要件定義機能で生成した要件定義の初稿。概要、背景、目的、想定ユーザー、機能要件、非機能要件、制約条件、成功指標、未確定事項を含む。MVPとして過不足がないかを見直したい。",
    review_focus:
      "要件の抜け漏れ、曖昧な表現、MVPとしてのスコープ妥当性、未決事項の整理不足を重点的にレビューしてほしい。",
    context:
      "MVP開発中。要件定義、タスク分解、レビュー、業務改善提案の4機能を段階的につなげていきたい。過剰設計より、次工程へ渡しやすい叩き台になっているかを知りたい。",
    output_level: "standard",
    notes: "P0-P3 の重要度順に、何を直すべきかとその理由が分かるように整理してほしい。",
  },
  samplePresets: [
    {
      label: "要件定義レビュー",
      values: {
        review_type: "requirements",
        technology: "Next.js / Laravel / PostgreSQL",
        review_target:
          "AI要件定義機能で生成した要件定義の初稿。概要、背景、目的、想定ユーザー、機能要件、非機能要件、制約条件、成功指標、未確定事項を含む。MVPとして過不足がないかを見直したい。",
        review_focus:
          "要件の抜け漏れ、曖昧な表現、MVPとしてのスコープ妥当性、未決事項の整理不足を重点的にレビューしてほしい。",
        context:
          "MVP開発中。要件定義、タスク分解、レビュー、業務改善提案の4機能を段階的につなげていきたい。過剰設計より、次工程へ渡しやすい叩き台になっているかを知りたい。",
        output_level: "standard",
        notes: "P0-P3 の重要度順に、何を直すべきかとその理由が分かるように整理してほしい。",
      },
    },
    {
      label: "設計メモレビュー",
      values: {
        review_type: "design_note",
        technology: "Next.js / TypeScript / Laravel",
        review_target:
          "AIレビュア機能の画面遷移、入力フォーム、レビュー結果表示、保存の将来拡張をまとめた設計メモ。UIは共通フォームを使い、レビュー対象の種類ごとにサンプルを切り替える方針を検討している。",
        review_focus:
          "画面構成の分かりやすさ、責務分離、拡張性、命名の妥当性、将来の保存機能や構造化出力へのつなぎやすさを重点的にレビューしてほしい。",
        context:
          "MVP段階では Markdown 表示までを優先し、構造化 findings や保存は後回しにしたい。設計の見通しが良いかを知りたい。",
        output_level: "standard",
        notes: "設計の過不足と、次に直すべき順が分かるようにしてほしい。",
      },
    },
    {
      label: "その他レビュー",
      values: {
        review_type: "other",
        technology: "Next.js / Laravel / PostgreSQL",
        review_target:
          "要件定義、タスク分解、コード差分、設計メモのいずれにも当てはまらない、検討中のメモや整理途中の成果物。",
        review_focus:
          "何をどうレビューしてほしいかを整理しながら、抜け漏れ、曖昧さ、優先度、実行可能性を幅広く見てほしい。",
        context:
          "まだレビュー対象の種類が固まり切っていないため、汎用的に使える観点を知りたい。",
        output_level: "standard",
        notes: "レビューの前提を整理するところから手伝ってほしい。",
      },
    },
    {
      label: "タスク分解レビュー",
      values: {
        review_type: "task_breakdown",
        technology: "Next.js / Laravel / PostgreSQL",
        review_target:
          "AIタスク分解機能で生成したタスク一覧。各タスクに優先度、依存関係、見積もり、完了条件を付けているが、粒度や順序が実装しやすいかを見直したい。",
        review_focus:
          "タスク粒度、優先度の妥当性、依存関係の抜け、完了条件の曖昧さ、今回やらないことの切り分けを重点的にレビューしてほしい。",
        context:
          "2週間でMVPを動かす前提。画面、API、デモ表示を先に成立させたいので、過剰に細かいタスクより実装順が見えることを優先している。",
        output_level: "standard",
        notes: "最初に着手すべき順が分かるようにしてほしい。",
      },
    },
    {
      label: "コード差分レビュー",
      values: {
        review_type: "code_diff",
        technology: "Next.js / TypeScript / Laravel",
        review_target:
          "AI生成フォームの入力値を localStorage に保存し、送信時に Backend API へ JSON文字列で渡す実装差分。共通UIを使いながら各機能で同じ操作感を維持したい。",
        review_focus:
          "入力検証、責務分離、エラー表示、保守性、テスト不足を重点的にレビューしてほしい。",
        context:
          "ポートフォリオ用MVP。保存や認証より、まずはデモしやすい画面とAPI連携を優先している。",
        output_level: "standard",
        notes: "リリース前に直すべき項目から順に整理してほしい。",
      },
    },
  ],
  fields: [
    {
      name: "review_type",
      label: "レビュー対象の種類",
      type: "select",
      required: true,
      hint: "何をレビューするのかを選ぶと、AIが観点を合わせやすくなります。",
      options: reviewTypeOptions,
      className: "md:col-span-2",
    },
    {
      name: "technology",
      label: "技術スタック",
      type: "input",
      required: true,
      minLength: 1,
      maxLength: 200,
      placeholder: "Next.js / Laravel / PostgreSQL",
      hint: "レビュー対象に関係する技術、業務領域、実行環境などを入力してください。",
      className: "md:col-span-2",
    },
    {
      name: "review_target",
      label: "レビュー対象",
      type: "textarea",
      required: true,
      minLength: 20,
      maxLength: 12000,
      placeholder: "要件定義、タスク分解、コード差分、設計メモ、実装メモなどレビューしたい内容を貼り付けてください。",
      hint: "20文字以上12000文字以内。全文ではなく抜粋でも構いません。",
      className: "min-h-48 md:col-span-2",
    },
    {
      name: "review_focus",
      label: "何をどうレビューしてほしいか",
      type: "textarea",
      required: true,
      minLength: 2,
      maxLength: 2000,
      placeholder: "抜け漏れ、曖昧さ、優先度の妥当性、セキュリティ、保守性など、見てほしい観点やレビューのしかたを入力してください。",
      hint: "2文字以上2000文字以内。観点、期待するレビュー方法、重視したい判断軸を書けます。",
      className: "min-h-28 md:col-span-2",
      quickPicks: [
        { label: "抜け漏れ", value: "抜け漏れ" },
        { label: "曖昧さ", value: "曖昧さ" },
        { label: "MVP妥当性", value: "MVP妥当性" },
        { label: "優先度", value: "優先度" },
        { label: "依存関係", value: "依存関係" },
        { label: "セキュリティ", value: "セキュリティ" },
        { label: "保守性", value: "保守性" },
        { label: "テスト", value: "テスト" },
      ],
    },
    {
      name: "context",
      label: "背景・前提",
      type: "textarea",
      maxLength: 3000,
      placeholder: "実装の目的、制約、判断済み事項、MVP前提などを入力してください。",
      hint: "任意、3000文字以内。",
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
  expectedOutputs: [
    "概要",
    "指摘事項",
    "良い点",
    "改善提案",
    "テスト観点",
    "次に直すべき順",
  ],
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
