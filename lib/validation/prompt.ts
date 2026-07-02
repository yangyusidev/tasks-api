import { z } from "zod";

export const optimizePromptBodySchema = z.object({
  userPrompt: z
    .string()
    .trim()
    .min(1, "请输入要优化的提示词")
    .max(6000, "提示词长度不能超过 6000 字"),
});
