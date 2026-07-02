import { NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api/errors";
import { describeDeepSeekError } from "@/lib/openai/deepseek";
import { optimizeUserPrompt } from "@/lib/prompts/optimize-ai";
import { optimizePromptBodySchema } from "@/lib/validation/prompt";

export async function POST(request: Request) {
  try {
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return jsonError(400, "请求体必须是 JSON");
    }

    const parsed = optimizePromptBodySchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(400, "请求体验证失败", parsed.error.flatten());
    }

    let prompt: string;
    try {
      prompt = await optimizeUserPrompt(parsed.data.userPrompt);
    } catch (e) {
      console.error("[POST /api/prompts/optimize] AI", e);
      return jsonError(502, "提示词优化失败", describeDeepSeekError(e));
    }

    return NextResponse.json({
      data: {
        prompt,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
