import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { handleRouteError, jsonError } from "@/lib/api/errors";
import { describeDeepSeekError } from "@/lib/openai/deepseek";
import { breakdownTaskBodySchema } from "@/lib/validation/task";
import { breakTaskTitleIntoSteps } from "@/lib/tasks/breakdown-ai";
import type { Task } from "@/lib/types/task";

export async function POST(request: Request) {
  try {
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return jsonError(400, "请求体必须是 JSON");
    }

    const parsed = breakdownTaskBodySchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(400, "请求体验证失败", parsed.error.flatten());
    }

    const { taskId, taskName: nameOverride } = parsed.data;
    const supabase = getSupabaseAdmin();

    const { data: parent, error: parentErr } = await supabase
      .from("tasks")
      .select("id, parent_id, title, status, created_at")
      .eq("id", taskId)
      .maybeSingle();

    if (parentErr) {
      console.error("[POST /api/tasks/breakdown]", parentErr);
      return jsonError(502, "查询父任务失败", parentErr.message);
    }

    if (!parent) {
      return jsonError(404, "父任务不存在");
    }

    const labelForAi = nameOverride ?? parent.title;

    let steps: string[];
    try {
      steps = await breakTaskTitleIntoSteps(labelForAi);
    } catch (e) {
      console.error("[POST /api/tasks/breakdown] AI", e);
      return jsonError(502, "任务拆解失败", describeDeepSeekError(e));
    }

    const rows = steps.map((title) => ({
      title,
      parent_id: taskId,
      status: "pending" as const,
    }));

    const { data: subtasks, error: insertErr } = await supabase
      .from("tasks")
      .insert(rows)
      .select("id, parent_id, title, status, created_at");

    if (insertErr) {
      console.error("[POST /api/tasks/breakdown] insert", insertErr);
      return jsonError(502, "保存子任务失败", insertErr.message);
    }

    return NextResponse.json({
      data: {
        parent: parent as Task,
        steps,
        subtasks: subtasks as Task[],
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
