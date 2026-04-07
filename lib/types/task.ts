export type TaskStatus = "pending" | "in_progress" | "completed";

export interface Task {
  id: string;
  parent_id: string | null;
  title: string;
  status: TaskStatus;
  created_at: string;
}
