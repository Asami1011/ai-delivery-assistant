export type Feature = {
  title: string;
  href: string;
  summary: string;
  accent: string;
};

export const features: Feature[] = [
  {
    title: "AI要件定義",
    href: "/requirements",
    summary: "アイデアや課題を要件定義の下書きへ整理する領域です。",
    accent: "border-l-emerald-500",
  },
  {
    title: "AIタスク分解",
    href: "/task-breakdown",
    summary: "要件からタスク、優先順位、工数見積を整理する領域です。",
    accent: "border-l-amber-500",
  },
  {
    title: "AIレビュア",
    href: "/code-review",
    summary: "コードや設計メモに対するレビュー観点を扱う領域です。",
    accent: "border-l-rose-500",
  },
  {
    title: "AI業務改善提案",
    href: "/business-improvement",
    summary: "業務課題から改善案や自動化候補を整理する領域です。",
    accent: "border-l-indigo-500",
  },
];
