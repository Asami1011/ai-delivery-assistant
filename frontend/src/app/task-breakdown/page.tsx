import { PageHeader } from "@/components/layout/page-header";
import { AiFeatureForm } from "@/components/features/ai-feature-form";
import { taskBreakdownFormConfig } from "@/lib/ai-feature-form-configs";

export default function TaskBreakdownPage() {
  return (
    <main>
      <PageHeader description="要件からタスク、優先順位、工数見積を整理する画面です。" title="AIタスク分解" />
      <AiFeatureForm config={taskBreakdownFormConfig} />
    </main>
  );
}
