import OpenAI from "openai";

const DEFAULT_BASE_URL = "https://api.deepseek.com";

export function getDeepSeekBaseUrl(): string {
  return process.env.DEEPSEEK_BASE_URL?.trim() || DEFAULT_BASE_URL;
}

function getDeepSeekTimeoutMs(): number {
  const raw = process.env.DEEPSEEK_TIMEOUT_MS?.trim();
  if (!raw) return 30000;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : 30000;
}

export function getDeepSeekClient(): OpenAI {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error("缺少环境变量：请设置 DEEPSEEK_API_KEY");
  }
  return new OpenAI({
    apiKey,
    baseURL: getDeepSeekBaseUrl(),
    maxRetries: 1,
    timeout: getDeepSeekTimeoutMs(),
  });
}

export function getDeepSeekModel(): string {
  return process.env.DEEPSEEK_MODEL?.trim() || "deepseek-v4-flash";
}

export function describeDeepSeekError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);

  const cause = (error as { cause?: unknown }).cause;
  const causeCode =
    cause && typeof cause === "object" && "code" in cause
      ? String((cause as { code?: unknown }).code)
      : "";

  if (
    error.message === "Connection error." ||
    causeCode === "ETIMEDOUT" ||
    causeCode === "ENOTFOUND" ||
    causeCode === "ECONNREFUSED"
  ) {
    return `DeepSeek API 连接失败：无法访问 ${getDeepSeekBaseUrl()}。请检查 DEEPSEEK_BASE_URL、网络或服务状态。`;
  }

  return error.message;
}
