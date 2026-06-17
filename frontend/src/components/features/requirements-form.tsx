import { AiFeatureForm } from "@/components/features/ai-feature-form";
import { requirementsFormConfig } from "@/lib/ai-feature-form-configs";

export function RequirementsForm() {
  return <AiFeatureForm config={requirementsFormConfig} />;
}
