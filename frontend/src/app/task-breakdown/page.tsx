import { PageHeader } from "@/components/layout/page-header";
import { FeaturePlaceholder } from "@/components/features/feature-placeholder";

export default function TaskBreakdownPage() {
  return (
    <main>
      <PageHeader description="要件からタスク、優先順位、工数見積を整理する画面です。" title="AIタスク分解" />
      <FeaturePlaceholder inputLabel="対象プロジェクト" textareaLabel="要件定義テキスト" title="Task Breakdown" />
    </main>
  );
}
