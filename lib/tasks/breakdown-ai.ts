import { z } from "zod";
import { getDeepSeekClient, getDeepSeekModel } from "@/lib/openai/deepseek";

const stepsResponseSchema = z.object({
  steps: z.array(z.string().min(1)).min(3).max(5),
});

function stripJsonFence(text: string): string {
  const t = text.trim();
  const m = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(t);
  return m ? m[1].trim() : t;
}

/**
 * 调用 DeepSeek（OpenAI 兼容），将任务名拆解为 3–5 条可执行步骤。
 */
export async function breakTaskTitleIntoSteps(taskTitle: string): Promise<string[]> {
  const client = getDeepSeekClient();
  const model = getDeepSeekModel();

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content:
          "你是任务规划助手。用户给出一个任务名称，你要把它拆成 3 到 5 个具体、可执行的小步骤（每条一句中文短句）。只输出 JSON，不要 Markdown，不要解释。严格使用格式：{\"steps\":[\"步骤1\",\"步骤2\",...]}，steps 数组长度必须在 3 到 5 之间。",
      },
      {
        role: "user",
        content: `任务名称：${taskTitle}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("模型未返回内容");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFence(content));
  } catch {
    throw new Error("模型返回不是合法 JSON");
  }

  const result = stepsResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("模型 JSON 结构不符合要求（需 3–5 条非空步骤）");
  }

  const trimmed = result.data.steps.map((s) => s.trim()).filter(Boolean);
  if (trimmed.length < 3 || trimmed.length > 5) {
    throw new Error("拆解步骤去重后数量须在 3–5 之间");
  }
  return trimmed;
}
