"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { MarkdownPreview } from "@/components/ui/markdown-preview";
import { Textarea } from "@/components/ui/textarea";
import { generateAi, type AiGenerateResult } from "@/lib/ai-client";
import { cn } from "@/lib/utils";

type OutputLevel = "short" | "standard" | "detailed";

type RequirementsFormValues = {
  product_name: string;
  background: string;
  problem: string;
  target_users: string;
  goal: string;
  constraints: string;
  output_level: OutputLevel;
  notes: string;
};

type FormErrors = Partial<Record<keyof RequirementsFormValues, string>>;

const initialValues: RequirementsFormValues = {
  product_name: "",
  background: "",
  problem: "",
  target_users: "",
  goal: "",
  constraints: "",
  output_level: "standard",
  notes: "",
};

const sampleValues: RequirementsFormValues = {
  product_name: "AI Delivery Assistant",
  background:
    "要件定義からタスク分解、レビュー、業務改善までを一気通貫で支援できるAIプラットフォームを作りたい。まずはポートフォリオ用途で立ち上げ、将来的にはSaaS化も見据えている。",
  problem:
    "ドキュメント作成、タスク整理、レビュー観点整理を人力で行うと時間がかかり、品質のばらつきも出やすい。開発初期に必要な情報整理をもっと早く進めたい。",
  target_users: "個人開発者、小規模開発チーム、要件整理に時間をかけにくいエンジニア",
  goal:
    "AIを使って要件定義の初稿を短時間で作成し、そのまま後続のタスク分解やレビュー工程へつなげられる状態を作る。",
  constraints:
    "初期段階では Next.js / Laravel / PostgreSQL を前提とし、OpenAI APIキーはBackend側の環境変数で管理する。MVPでは保存機能や認証は最小構成にとどめる。",
  output_level: "standard",
  notes:
    "ポートフォリオ用途でも見栄えが良く、後続のAIタスク分解に流し込みやすいMarkdown形式を意識してほしい。",
};

const outputLevelLabels: Record<OutputLevel, string> = {
  short: "簡易",
  standard: "標準",
  detailed: "詳細",
};

const textareaClass = "min-h-36";
const selectClass =
  "h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 shadow-sm outline-none transition-colors focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10";
const storageKey = "ai-delivery-assistant:requirements-form";

function validate(values: RequirementsFormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.product_name.trim().length < 1 || values.product_name.trim().length > 100) {
    errors.product_name = "1文字以上100文字以内で入力してください。";
  }

  if (values.background.trim().length < 10 || values.background.trim().length > 2000) {
    errors.background = "10文字以上2000文字以内で入力してください。";
  }

  if (values.problem.trim().length < 10 || values.problem.trim().length > 2000) {
    errors.problem = "10文字以上2000文字以内で入力してください。";
  }

  if (values.target_users.trim().length < 2 || values.target_users.trim().length > 1000) {
    errors.target_users = "2文字以上1000文字以内で入力してください。";
  }

  if (values.goal.trim().length < 10 || values.goal.trim().length > 2000) {
    errors.goal = "10文字以上2000文字以内で入力してください。";
  }

  if (values.constraints.trim().length > 2000) {
    errors.constraints = "2000文字以内で入力してください。";
  }

  if (values.notes.trim().length > 2000) {
    errors.notes = "2000文字以内で入力してください。";
  }

  return errors;
}

function buildInput(values: RequirementsFormValues) {
  return {
    product_name: values.product_name.trim(),
    background: values.background.trim(),
    problem: values.problem.trim(),
    target_users: values.target_users.trim(),
    goal: values.goal.trim(),
    constraints: values.constraints.trim(),
    output_level: values.output_level,
    notes: values.notes.trim(),
  };
}

function isOutputLevel(value: string): value is OutputLevel {
  return value === "short" || value === "standard" || value === "detailed";
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

export function RequirementsForm() {
  const [values, setValues] = useState<RequirementsFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasValidated, setHasValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<AiGenerateResult | null>(null);
  const [isDraftReady, setIsDraftReady] = useState(false);

  useEffect(() => {
    const savedValue = window.localStorage.getItem(storageKey);

    if (!savedValue) {
      setIsDraftReady(true);
      return;
    }

    try {
      const parsed = JSON.parse(savedValue) as Partial<RequirementsFormValues>;

      setValues({
        product_name: typeof parsed.product_name === "string" ? parsed.product_name : "",
        background: typeof parsed.background === "string" ? parsed.background : "",
        problem: typeof parsed.problem === "string" ? parsed.problem : "",
        target_users: typeof parsed.target_users === "string" ? parsed.target_users : "",
        goal: typeof parsed.goal === "string" ? parsed.goal : "",
        constraints: typeof parsed.constraints === "string" ? parsed.constraints : "",
        output_level:
          typeof parsed.output_level === "string" && isOutputLevel(parsed.output_level)
            ? parsed.output_level
            : "standard",
        notes: typeof parsed.notes === "string" ? parsed.notes : "",
      });
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setIsDraftReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isDraftReady) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(values));
  }, [isDraftReady, values]);

  const payload = useMemo(() => buildInput(values), [values]);

  const requestPayloadPreview = useMemo(
    () =>
      JSON.stringify(
        {
          feature: "requirements",
          input_object: payload,
          note: "実際のAPI送信時は input を JSON文字列化しています。",
        },
        null,
        2,
      ),
    [payload],
  );

  const previewItems = [
    { label: "プロダクト名", value: payload.product_name || "未入力" },
    { label: "背景", value: payload.background || "未入力" },
    { label: "解決したい課題", value: payload.problem || "未入力" },
    { label: "想定ユーザー", value: payload.target_users || "未入力" },
    { label: "実現したいこと", value: payload.goal || "未入力" },
    { label: "制約・前提条件", value: payload.constraints || "未入力" },
    { label: "出力の詳しさ", value: outputLevelLabels[payload.output_level] },
    { label: "補足情報", value: payload.notes || "未入力" },
  ];

  function updateField<Key extends keyof RequirementsFormValues>(
    key: Key,
    nextValue: RequirementsFormValues[Key],
  ) {
    const nextValues = { ...values, [key]: nextValue };
    setValues(nextValues);
    window.localStorage.setItem(storageKey, JSON.stringify(nextValues));
    setSubmitError(null);
    setResult(null);

    if (hasValidated) {
      setErrors(validate(nextValues));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    setHasValidated(true);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const generatedResult = await generateAi({
        feature: "requirements",
        input: JSON.stringify(payload, null, 2),
      });

      setResult(generatedResult);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "AI要件定義の生成に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClear() {
    setValues(initialValues);
    setErrors({});
    setHasValidated(false);
    setSubmitError(null);
    setResult(null);
    window.localStorage.removeItem(storageKey);
  }

  function handleFillSample() {
    setValues(sampleValues);
    window.localStorage.setItem(storageKey, JSON.stringify(sampleValues));
    const sampleErrors = validate(sampleValues);
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
          <CardTitle>AI要件定義 入力フォーム</CardTitle>
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
              <label className="grid gap-2 md:col-span-2">
                <FieldLabel required>プロダクト名</FieldLabel>
                <Input
                  maxLength={100}
                  onChange={(event) => updateField("product_name", event.target.value)}
                  placeholder="AI Delivery Assistant"
                  value={values.product_name}
                />
                <FieldHint error={errors.product_name}>
                  プロダクト名またはサービス名を入力してください。
                </FieldHint>
              </label>

              <label className="grid gap-2 md:col-span-2">
                <FieldLabel required>背景</FieldLabel>
                <Textarea
                  className={textareaClass}
                  maxLength={2000}
                  onChange={(event) => updateField("background", event.target.value)}
                  placeholder="現在の状況、このプロダクトを作る理由、検討に至った背景を入力してください。"
                  value={values.background}
                />
                <FieldHint error={errors.background}>10文字以上2000文字以内。</FieldHint>
              </label>

              <label className="grid gap-2 md:col-span-2">
                <FieldLabel required>解決したい課題</FieldLabel>
                <Textarea
                  className={textareaClass}
                  maxLength={2000}
                  onChange={(event) => updateField("problem", event.target.value)}
                  placeholder="解決したい課題を入力してください。箇条書きでも問題ありません。"
                  value={values.problem}
                />
                <FieldHint error={errors.problem}>10文字以上2000文字以内。</FieldHint>
              </label>

              <label className="grid gap-2 md:col-span-2">
                <FieldLabel required>想定ユーザー</FieldLabel>
                <Textarea
                  className="min-h-28"
                  maxLength={1000}
                  onChange={(event) => updateField("target_users", event.target.value)}
                  placeholder="個人開発者、初学者、小規模チームなど、想定する利用者を入力してください。"
                  value={values.target_users}
                />
                <FieldHint error={errors.target_users}>2文字以上1000文字以内。</FieldHint>
              </label>

              <label className="grid gap-2 md:col-span-2">
                <FieldLabel required>実現したいこと</FieldLabel>
                <Textarea
                  className={textareaClass}
                  maxLength={2000}
                  onChange={(event) => updateField("goal", event.target.value)}
                  placeholder="このプロダクトで実現したいこと、到達したい状態を入力してください。"
                  value={values.goal}
                />
                <FieldHint error={errors.goal}>10文字以上2000文字以内。</FieldHint>
              </label>

              <label className="grid gap-2 md:col-span-2">
                <FieldLabel>制約・前提条件</FieldLabel>
                <Textarea
                  className="min-h-28"
                  maxLength={2000}
                  onChange={(event) => updateField("constraints", event.target.value)}
                  placeholder="MVPの範囲、技術的制約、納期、前提条件などがあれば入力してください。"
                  value={values.constraints}
                />
                <FieldHint error={errors.constraints}>任意、2000文字以内。</FieldHint>
              </label>

              <label className="grid gap-2">
                <FieldLabel>出力の詳しさ</FieldLabel>
                <select
                  className={selectClass}
                  onChange={(event) =>
                    updateField("output_level", event.target.value as OutputLevel)
                  }
                  value={values.output_level}
                >
                  <option value="short">簡易</option>
                  <option value="standard">標準</option>
                  <option value="detailed">詳細</option>
                </select>
                <FieldHint>AIが生成する要件定義の詳しさを指定します。</FieldHint>
              </label>

              <label className="grid gap-2">
                <FieldLabel>補足情報</FieldLabel>
                <Textarea
                  className="min-h-28"
                  maxLength={2000}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="ポートフォリオ用途、文体、AIへの追加指示などがあれば入力してください。"
                  value={values.notes}
                />
                <FieldHint error={errors.notes}>任意、2000文字以内。</FieldHint>
              </label>
            </div>

            <div className="grid gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" className="min-w-36" disabled={isSubmitting}>
                  {isSubmitting ? "AI生成中..." : "AIで要件定義を生成"}
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
                入力内容をもとにLaravel Backend APIへ送信し、AI要件定義を生成します。
              </p>
            </div>

            {showReadyState ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-900">送信準備ができています。</p>
                <p className="mt-1 text-sm leading-6 text-emerald-800">
                  必須項目が入力されており、この内容をそのまま共通AI APIへ渡せる状態です。
                </p>
              </div>
            ) : null}

            {submitError ? (
              <ErrorMessage
                title="AI生成に失敗しました"
                message={submitError}
              />
            ) : null}
          </form>
        </CardBody>
      </Card>

      <div className="grid min-w-0 gap-4 self-start xl:sticky xl:top-6 xl:pr-2">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>生成結果</CardTitle>
          </CardHeader>
          <CardBody className="grid min-w-0 gap-4 overflow-hidden">
            {isSubmitting ? <Loading label="AIが要件定義を生成しています..." /> : null}

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
                左側フォームから「AIで要件定義を生成」を押すと、ここに生成結果が表示されます。
              </p>
            ) : null}
          </CardBody>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>入力内容プレビュー</CardTitle>
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
            <CardTitle>期待される出力</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="grid gap-2 text-sm leading-6 text-neutral-700">
              <li>概要</li>
              <li>背景</li>
              <li>解決すべき課題</li>
              <li>目的</li>
              <li>想定ユーザー</li>
              <li>機能要件</li>
              <li>非機能要件</li>
              <li>制約条件</li>
              <li>成功指標</li>
              <li>未確定事項</li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
