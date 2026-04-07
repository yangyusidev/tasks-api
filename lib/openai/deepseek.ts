import OpenAI from "openai";

const BASE_URL = "https://sg.uiuiapi.com/v1";

export function getDeepSeekClient(): OpenAI {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error("缺少环境变量：请设置 DEEPSEEK_API_KEY");
  }
  return new OpenAI({
    apiKey,
    baseURL: BASE_URL,
  });
}

export function getDeepSeekModel(): string {
  return process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";
}
