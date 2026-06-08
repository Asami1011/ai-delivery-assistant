export type AiGenerateFeature =
  | "requirements"
  | "task_breakdown"
  | "code_review"
  | "business_improvement";

export type AiGenerateResult = {
  feature: string;
  mode: string;
  model: string;
  output_markdown: string;
};

type AiGenerateResponse = {
  data: AiGenerateResult;
  meta: {
    stored: boolean;
  };
};

type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

function resolveApiBaseUrl() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL が設定されていません。");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

function buildErrorMessage(payload: ApiErrorPayload | null, status: number) {
  if (payload?.errors) {
    const firstError = Object.values(payload.errors)[0];

    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0];
    }

    if (typeof firstError === "string" && firstError.length > 0) {
      return firstError;
    }
  }

  if (payload?.message) {
    return payload.message;
  }

  return `AI生成に失敗しました。(${status})`;
}

export async function generateAi({
  feature,
  input,
}: {
  feature: AiGenerateFeature;
  input: string;
}) {
  const response = await fetch(`${resolveApiBaseUrl()}/ai/generate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      feature,
      input,
    }),
  });

  const payload = (await response.json().catch(() => null)) as AiGenerateResponse | ApiErrorPayload | null;

  if (!response.ok) {
    throw new Error(buildErrorMessage(payload as ApiErrorPayload | null, response.status));
  }

  return (payload as AiGenerateResponse).data;
}
