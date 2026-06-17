"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { MarkdownPreview } from "@/components/ui/markdown-preview";
import { Textarea } from "@/components/ui/textarea";
import { generateAi, type AiGenerateResult } from "@/lib/ai-client";
import {
  outputLevelLabels,
  type AiFeatureFormConfig,
  type AiFeatureFormField,
  type AiFeatureFormValues,
  type OutputLevel,
} from "@/lib/ai-feature-form-configs";
import { cn } from "@/lib/utils";

type FormErrors = Record<string, string>;

const selectClass =
  "h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 shadow-sm outline-none transition-colors focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10";

function buildValues(config: AiFeatureFormConfig, parsed?: Partial<AiFeatureFormValues>) {
  return config.fields.reduce<AiFeatureFormValues>((values, field) => {
    const fallback = config.initialValues[field.name] ?? "";
    const parsedValue = parsed?.[field.name];

    if (field.type === "select" && field.options) {
      const optionValues = field.options.map((option) => option.value);
      values[field.name] =
        typeof parsedValue === "string" && optionValues.includes(parsedValue)
          ? parsedValue
          : fallback;
      return values;
    }

    values[field.name] = typeof parsedValue === "string" ? parsedValue : fallback;
    return values;
  }, {});
}

function validate(values: AiFeatureFormValues, fields: AiFeatureFormField[]): FormErrors {
  const errors: FormErrors = {};

  fields.forEach((field) => {
    const value = values[field.name]?.trim() ?? "";
    const length = value.length;

    if (field.required && length < 1) {
      errors[field.name] = "必須項目です。";
      return;
    }

    if (length > 0 && field.minLength && length < field.minLength) {
      errors[field.name] = `${field.minLength}文字以上で入力してください。`;
      return;
    }

    if (field.maxLength && length > field.maxLength) {
      errors[field.name] = `${field.maxLength}文字以内で入力してください。`;
    }
  });

  return errors;
}

function buildInput(values: AiFeatureFormValues) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, value.trim()]),
  ) as AiFeatureFormValues;
}

function FieldLabel({
  children,
  required = false,
}: {
  children: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-neutral-800">
      <span>{children}</span>
      {required ? (
        <span className="rounded bg-red-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
          必須
        </span>
      ) : (
        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-500">
          任意
        </span>
      )}
    </div>
  );
}

function FieldHint({
  children,
  error,
}: {
  children: string;
  error?: string;
}) {
  return (
    <p className={cn("text-xs leading-5 text-neutral-500", error ? "text-red-700" : undefined)}>
      {error ?? children}
    </p>
  );
}

function previewValue(field: AiFeatureFormField, value: string) {
  if (field.type === "select" && field.name === "output_level") {
    return outputLevelLabels[value as OutputLevel] ?? value;
  }

  if (field.type === "select" && field.options) {
    return field.options.find((option) => option.value === value)?.label ?? value;
  }

  return value || "未入力";
}

export function AiFeatureForm({ config }: { config: AiFeatureFormConfig }) {
  const [values, setValues] = useState<AiFeatureFormValues>(() => buildValues(config));
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasValidated, setHasValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<AiGenerateResult | null>(null);
  const [isDraftReady, setIsDraftReady] = useState(false);

  useEffect(() => {
    const savedValue = window.localStorage.getItem(config.storageKey);

    if (!savedValue) {
      setIsDraftReady(true);
      return;
    }

    try {
      const parsed = JSON.parse(savedValue) as Partial<AiFeatureFormValues>;
      setValues(buildValues(config, parsed));
    } catch {
      window.localStorage.removeItem(config.storageKey);
    } finally {
      setIsDraftReady(true);
    }
  }, [config]);

  useEffect(() => {
    if (!isDraftReady) {
      return;
    }

    window.localStorage.setItem(config.storageKey, JSON.stringify(values));
  }, [config.storageKey, isDraftReady, values]);

  const payload = useMemo(() => buildInput(values), [values]);

  const requestPayloadPreview = useMemo(
    () =>
      JSON.stringify(
        {
          feature: config.feature,
          input_object: payload,
          note: "実際のAPI送信時は input を JSON文字列化しています。",
        },
        null,
        2,
      ),
    [config.feature, payload],
  );

  const previewItems = config.fields.map((field) => ({
    label: field.label,
    value: previewValue(field, payload[field.name] ?? ""),
  }));

  function updateField(key: string, nextValue: string) {
    const nextValues = { ...values, [key]: nextValue };
    setValues(nextValues);
    window.localStorage.setItem(config.storageKey, JSON.stringify(nextValues));
    setSubmitError(null);
    setResult(null);

    if (hasValidated) {
      setErrors(validate(nextValues, config.fields));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values, config.fields);
    setHasValidated(true);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const generatedResult = await generateAi({
        feature: config.feature,
        input: JSON.stringify(payload, null, 2),
      });

      setResult(generatedResult);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "AI生成に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClear() {
    setValues(buildValues(config));
    setErrors({});
    setHasValidated(false);
    setSubmitError(null);
    setResult(null);
    window.localStorage.removeItem(config.storageKey);
  }

  function handleFillSample() {
    const sampleValues = buildValues(config, config.sampleValues);
    setValues(sampleValues);
    window.localStorage.setItem(config.storageKey, JSON.stringify(sampleValues));
    const sampleErrors = validate(sampleValues, config.fields);
    setErrors(sampleErrors);
    setHasValidated(true);
    setSubmitError(null);
    setResult(null);
  }

  const isValid = Object.keys(errors).length === 0;
  const showValidationSummary = hasValidated && !isValid;
  const showReadyState =
    hasValidated && isValid && !isSubmitting && !submitError && result === null;

  return (
    <div className="grid items-start gap-6 overflow-x-hidden xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>{config.formTitle}</CardTitle>
        </CardHeader>
        <CardBody>
          <form className="grid gap-6" onSubmit={handleSubmit} noValidate>
            {showValidationSummary ? (
              <ErrorMessage
                title="入力内容を確認してください"
                message="ハイライトされた項目を修正してから、次のAI生成に進んでください。"
              />
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              {config.fields.map((field) => (
                <label key={field.name} className={cn("grid gap-2", field.className)}>
                  <FieldLabel required={field.required}>{field.label}</FieldLabel>
                  {field.type === "input" ? (
                    <Input
                      maxLength={field.maxLength}
                      onChange={(event) => updateField(field.name, event.target.value)}
                      placeholder={field.placeholder}
                      value={values[field.name] ?? ""}
                    />
                  ) : null}
                  {field.type === "textarea" ? (
                    <Textarea
                      className={field.className}
                      maxLength={field.maxLength}
                      onChange={(event) => updateField(field.name, event.target.value)}
                      placeholder={field.placeholder}
                      value={values[field.name] ?? ""}
                    />
                  ) : null}
                  {field.type === "select" ? (
                    <select
                      className={selectClass}
                      onChange={(event) => updateField(field.name, event.target.value)}
                      value={values[field.name] ?? ""}
                    >
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  <FieldHint error={errors[field.name]}>{field.hint}</FieldHint>
                </label>
              ))}
            </div>

            <div className="grid gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" className="min-w-36" disabled={isSubmitting}>
                  {isSubmitting ? config.submittingLabel : config.submitLabel}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleFillSample}
                  className="min-w-32 border border-dashed border-neutral-300 bg-white text-neutral-700"
                  disabled={isSubmitting}
                >
                  サンプル入力
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClear}
                  className="min-w-32 border border-neutral-400 bg-neutral-50 text-neutral-900 shadow-sm"
                  disabled={isSubmitting}
                >
                  入力をクリア
                </Button>
              </div>

              <p className="text-sm text-neutral-500">
                入力内容をもとにLaravel Backend APIへ送信し、AI生成結果を表示します。
              </p>
            </div>

            {showReadyState ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-900">{config.readyTitle}</p>
                <p className="mt-1 text-sm leading-6 text-emerald-800">
                  {config.readyMessage}
                </p>
              </div>
            ) : null}

            {submitError ? (
              <ErrorMessage title="AI生成に失敗しました" message={submitError} />
            ) : null}
          </form>
        </CardBody>
      </Card>

      <div className="grid min-w-0 gap-4 self-start xl:sticky xl:top-6 xl:pr-2">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>{config.resultTitle}</CardTitle>
          </CardHeader>
          <CardBody className="grid min-w-0 gap-4 overflow-hidden">
            {isSubmitting ? <Loading label={config.resultLoadingLabel} /> : null}

            {!isSubmitting && result ? (
              <>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span
                    className={cn(
                      "rounded px-2 py-1 font-medium",
                      result.mode === "demo"
                        ? "bg-amber-100 text-amber-900"
                        : "bg-emerald-100 text-emerald-900",
                    )}
                  >
                    {result.mode === "demo" ? "デモモード" : "OpenAI応答"}
                  </span>
                  <span className="rounded bg-neutral-100 px-2 py-1 font-medium text-neutral-700">
                    {result.model}
                  </span>
                </div>
                <div className="min-w-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 p-4">
                  <div className="max-h-[26rem] overflow-auto">
                    <MarkdownPreview content={result.output_markdown} />
                  </div>
                </div>
                {result.mode === "demo" ? (
                  <p className="text-xs leading-5 text-neutral-500">
                    OPENAI_API_KEY が未設定のため、現在はデモレスポンスを表示しています。
                  </p>
                ) : null}
              </>
            ) : null}

            {!isSubmitting && !result && !submitError ? (
              <p className="text-sm leading-6 text-neutral-500">
                {config.resultEmptyMessage}
              </p>
            ) : null}
          </CardBody>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>{config.previewTitle}</CardTitle>
          </CardHeader>
          <CardBody className="grid min-w-0 gap-4 overflow-hidden">
            <div className="min-w-0 overflow-auto rounded-md border border-neutral-200 bg-neutral-50 p-4 max-h-[24rem]">
              <div className="grid gap-3">
                {previewItems.map((item) => (
                  <div
                    key={item.label}
                    className="grid gap-1 border-b border-neutral-200 pb-3 last:border-b-0 last:pb-0"
                  >
                    <p className="text-xs font-semibold text-neutral-500">{item.label}</p>
                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-neutral-800">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <details className="min-w-0 max-w-full overflow-hidden rounded-md border border-dashed border-neutral-200 p-4">
              <summary className="cursor-pointer text-xs font-semibold tracking-wide text-neutral-500">
                開発者向け: API送信用データを表示
              </summary>
              <div className="mt-3 min-w-0 max-w-full overflow-auto rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <pre className="w-max min-w-full text-xs leading-6 text-neutral-700">
                  {requestPayloadPreview}
                </pre>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-neutral-500">
                詳細確認用です。実際の送信では <code>input</code> に JSON文字列を渡しています。
              </p>
            </details>
          </CardBody>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>{config.expectedOutputTitle}</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="grid gap-2 text-sm leading-6 text-neutral-700">
              {config.expectedOutputs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
