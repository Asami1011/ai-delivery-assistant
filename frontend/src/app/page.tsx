import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { features } from "@/lib/features";

export default function Home() {
  return (
    <main>
      <PageHeader
        description="要件定義、タスク分解、レビュー、業務改善提案の4領域へ移動できます。"
        title="ホーム"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <Card className={`border-l-4 ${feature.accent}`} key={feature.href}>
            <CardBody>
              <div className="flex min-h-44 flex-col justify-between gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-950">{feature.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">{feature.summary}</p>
                </div>
                <ButtonLink className="w-fit" href={feature.href} variant="secondary">
                  開く
                </ButtonLink>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </main>
  );
}
