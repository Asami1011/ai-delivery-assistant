import { PageHeader } from "@/components/layout/page-header";
import { FeaturePlaceholder } from "@/components/features/feature-placeholder";

export default function CodeReviewPage() {
  return (
    <main>
      <PageHeader description="コードや設計メモに対するレビュー観点を整理する画面です。" title="AIレビュア" />
      <FeaturePlaceholder inputLabel="使用技術" textareaLabel="レビュー対象" title="Review Request" />
    </main>
  );
}
