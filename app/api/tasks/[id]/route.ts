import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { handleRouteError, jsonError } from "@/lib/api/errors";
import { patchTaskBodySchema } from "@/lib/validation/task";
import type { Task } from "@/lib/types/task";

const idParamSchema = z.string().uuid("id 必须是有效 UUID");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const idResult = idParamSchema.safeParse(rawId);
    if (!idResult.success) {
      return jsonError(400, "路径参数无效", idResult.error.flatten());
    }
    const id = idResult.data;

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return jsonError(400, "请求体必须是 JSON");
    }

    const parsed = patchTaskBodySchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(400, "请求体验证失败", parsed.error.flatten());
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("tasks")
      .update({ status: parsed.data.status })
      .eq("id", id)
      .select("id, parent_id, title, status, created_at")
      .maybeSingle();

    if (error) {
      console.error("[PATCH /api/tasks/[id]]", error);
      return jsonError(502, "更新任务失败", error.message);
    }

    if (!data) {
      return jsonError(404, "任务不存在");
    }

    return NextResponse.json({ data: data as Task });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const idResult = idParamSchema.safeParse(rawId);
    if (!idResult.success) {
      return jsonError(400, "路径参数无效", idResult.error.flatten());
    }
    const id = idResult.data;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[DELETE /api/tasks/[id]]", error);
      return jsonError(502, "删除任务失败", error.message);
    }

    if (!data) {
      return jsonError(404, "任务不存在");
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleRouteError(err);
  }
}
