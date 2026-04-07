import type { TaskStatus } from "@/lib/types/task";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "待办",
  in_progress: "进行中",
  completed: "已完成",
};

const ORDER: TaskStatus[] = ["pending", "in_progress", "completed"];

export function nextTaskStatus(current: TaskStatus): TaskStatus {
  const i = ORDER.indexOf(current);
  if (i === -1) return "pending";
  return ORDER[(i + 1) % ORDER.length];
}
