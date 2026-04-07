import { ZodError } from "zod";
import { NextResponse } from "next/server";

export function jsonError(
  status: number,
  message: string,
  details?: unknown
): NextResponse {
  const body: { error: string; details?: unknown } = { error: message };
  if (details !== undefined) body.details = details;
  return NextResponse.json(body, { status });
}

export function handleRouteError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return jsonError(400, "请求体验证失败", err.flatten());
  }

  if (err instanceof Error) {
    if (err.message.includes("缺少环境变量")) {
      return jsonError(500, "服务器配置错误");
    }
    console.error("[api]", err);
    return jsonError(500, err.message || "服务器内部错误");
  }

  console.error("[api]", err);
  return jsonError(500, "服务器内部错误");
}
