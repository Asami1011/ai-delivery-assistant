import { PageHeader } from "@/components/layout/page-header";
import { FeaturePlaceholder } from "@/components/features/feature-placeholder";

export default function BusinessImprovementPage() {
  return (
    <main>
      <PageHeader description="業務課題から改善案や自動化候補を整理する画面です。" title="AI業務改善提案" />
      <FeaturePlaceholder inputLabel="業務名" textareaLabel="現状・課題" title="Improvement Brief" />
    </main>
  );
}
