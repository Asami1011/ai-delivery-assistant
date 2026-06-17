import { PageHeader } from "@/components/layout/page-header";
import { AiFeatureForm } from "@/components/features/ai-feature-form";
import { codeReviewFormConfig } from "@/lib/ai-feature-form-configs";

export default function CodeReviewPage() {
  return (
    <main>
      <PageHeader description="コードや設計メモに対するレビュー観点を整理する画面です。" title="AIレビュア" />
      <AiFeatureForm config={codeReviewFormConfig} />
    </main>
  );
}
