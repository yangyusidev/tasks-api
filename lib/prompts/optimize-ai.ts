import { readFile } from "node:fs/promises";
import path from "node:path";
import { getDeepSeekClient, getDeepSeekModel } from "@/lib/openai/deepseek";

const META_PROMPT_PATH = path.join(process.cwd(), "prompts", "第四讲-元提示词.md");

let cachedMetaPrompt: string | null = null;

async function getMetaPrompt(): Promise<string> {
  if (cachedMetaPrompt) return cachedMetaPrompt;
  cachedMetaPrompt = await readFile(META_PROMPT_PATH, "utf8");
  return cachedMetaPrompt;
}

function fillMetaPrompt(template: string, userPrompt: string): string {
  return template
    .replaceAll("{{user_request}}", userPrompt)
    .replaceAll("{{user_input}}", userPrompt);
}

export async function optimizeUserPrompt(userPrompt: string): Promise<string> {
  const client = getDeepSeekClient();
  const model = getDeepSeekModel();
  const metaPrompt = fillMetaPrompt(await getMetaPrompt(), userPrompt);

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "你是提示词优化助手。请严格依据用户提供的元提示词生成优化后的 Prompt，只输出最终可复制使用的 Prompt，不要输出闲聊或额外解释。",
      },
      {
        role: "user",
        content: metaPrompt,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("模型未返回内容");
  }

  return content;
}
