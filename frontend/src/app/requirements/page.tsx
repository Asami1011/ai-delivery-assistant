import { RequirementsForm } from "@/components/features/requirements-form";
import { PageHeader } from "@/components/layout/page-header";

export default function RequirementsPage() {
  return (
    <main>
      <PageHeader
        title="AI要件定義"
        description="プロダクトの背景、目的、制約を整理して入力し、次のステップで再利用しやすい要件定義を生成できる状態を作ります。"
      />
      <RequirementsForm />
    </main>
  );
}
