async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("响应不是合法 JSON");
  }
}

export type OptimizePromptResult = {
  prompt: string;
};

export async function optimizePrompt(userPrompt: string): Promise<OptimizePromptResult> {
  const res = await fetch("/api/prompts/optimize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userPrompt: userPrompt.trim() }),
  });

  const body = await parseJson<{ data?: OptimizePromptResult; details?: string; error?: string }>(res);
  if (!res.ok) {
    const suffix = body.details ? `：${body.details}` : "";
    throw new Error(`${body.error || `优化失败 (${res.status})`}${suffix}`);
  }
  if (!body.data) throw new Error("优化成功但未返回提示词");
  return body.data;
}
