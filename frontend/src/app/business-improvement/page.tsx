import { PageHeader } from "@/components/layout/page-header";
import { AiFeatureForm } from "@/components/features/ai-feature-form";
import { businessImprovementFormConfig } from "@/lib/ai-feature-form-configs";

export default function BusinessImprovementPage() {
  return (
    <main>
      <PageHeader description="業務課題から改善案や自動化候補を整理する画面です。" title="AI業務改善提案" />
      <AiFeatureForm config={businessImprovementFormConfig} />
    </main>
  );
}
