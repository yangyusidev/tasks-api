import type { Task, TaskStatus } from "@/lib/types/task";

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("响应不是合法 JSON");
  }
}

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch("/api/tasks", { cache: "no-store" });
  const body = await parseJson<{ data?: Task[]; error?: string }>(res);
  if (!res.ok) throw new Error(body.error || `加载失败 (${res.status})`);
  return body.data ?? [];
}

export async function createTask(title: string): Promise<Task> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title.trim(), status: "pending" }),
  });
  const body = await parseJson<{ data?: Task; error?: string }>(res);
  if (!res.ok) throw new Error(body.error || `创建失败 (${res.status})`);
  if (!body.data) throw new Error("创建成功但未返回任务");
  return body.data;
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const body = await parseJson<{ data?: Task; error?: string }>(res);
  if (!res.ok) throw new Error(body.error || `更新失败 (${res.status})`);
  if (!body.data) throw new Error("更新成功但未返回任务");
  return body.data;
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (res.status === 204) return;
  const body = await parseJson<{ error?: string }>(res);
  throw new Error(body.error || `删除失败 (${res.status})`);
}

export type BreakdownResult = {
  parent: Task;
  steps: string[];
  subtasks: Task[];
};

export async function breakdownTask(taskId: string, taskName?: string): Promise<BreakdownResult> {
  const res = await fetch("/api/tasks/breakdown", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      taskId,
      ...(taskName ? { taskName } : {}),
    }),
  });
  const body = await parseJson<{ data?: BreakdownResult; error?: string }>(res);
  if (!res.ok) throw new Error(body.error || `拆解失败 (${res.status})`);
  if (!body.data) throw new Error("拆解成功但未返回数据");
  return body.data;
}
