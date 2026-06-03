import { PageHeader } from "@/components/layout/page-header";
import { FeaturePlaceholder } from "@/components/features/feature-placeholder";

export default function RequirementsPage() {
  return (
    <main>
      <PageHeader description="アイデアや課題から要件定義を整理する画面です。" title="AI要件定義" />
      <FeaturePlaceholder inputLabel="プロダクト名" textareaLabel="背景・課題" title="Requirement Draft" />
    </main>
  );
}
