import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { Textarea } from "@/components/ui/textarea";

export function FeaturePlaceholder({
  title,
  inputLabel,
  textareaLabel,
}: {
  title: string;
  inputLabel: string;
  textareaLabel: string;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardBody>
          <form className="grid gap-5">
            <label className="grid gap-2 text-sm font-medium text-neutral-700">
              {inputLabel}
              <Input disabled placeholder="Not connected yet" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-neutral-700">
              {textareaLabel}
              <Textarea disabled placeholder="Not connected yet" />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled>生成</Button>
              <Loading label="Standby" />
            </div>
          </form>
        </CardBody>
      </Card>

      <div className="grid gap-4">
        <ErrorMessage message="OpenAI API and database persistence are intentionally not wired in this milestone." />
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="min-h-40 rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-500">
              Empty
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
