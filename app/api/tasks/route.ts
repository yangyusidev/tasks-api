import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { handleRouteError, jsonError } from "@/lib/api/errors";
import { createTaskBodySchema } from "@/lib/validation/task";
import type { Task } from "@/lib/types/task";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("tasks")
      .select("id, parent_id, title, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/tasks]", error);
      return jsonError(502, "数据库查询失败", error.message);
    }

    return NextResponse.json({ data: data as Task[] });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return jsonError(400, "请求体必须是 JSON");
    }

    const parsed = createTaskBodySchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(400, "请求体验证失败", parsed.error.flatten());
    }

    const { title, status } = parsed.data;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("tasks")
      .insert({ title, status })
      .select("id, parent_id, title, status, created_at")
      .single();

    if (error) {
      console.error("[POST /api/tasks]", error);
      return jsonError(502, "创建任务失败", error.message);
    }

    return NextResponse.json({ data: data as Task }, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
