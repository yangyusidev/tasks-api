import { z } from "zod";

export const taskStatusSchema = z.enum(["pending", "in_progress", "completed"]);

export const createTaskBodySchema = z.object({
  title: z.string().min(1, "title 不能为空").max(500, "title 过长"),
  status: taskStatusSchema.optional().default("pending"),
});

export const patchTaskBodySchema = z.object({
  status: taskStatusSchema,
});

/** 拆解子任务：用已有任务的 id 作为父任务；可选 taskName 覆盖送给模型的任务描述（默认用库里的 title） */
export const breakdownTaskBodySchema = z
  .object({
    taskId: z.string().uuid("taskId 必须是有效 UUID"),
    taskName: z.string().min(1, "taskName 不能为空").max(500, "taskName 过长").optional(),
  })
  .strict();

export type CreateTaskInput = z.infer<typeof createTaskBodySchema>;
export type PatchTaskInput = z.infer<typeof patchTaskBodySchema>;
export type BreakdownTaskInput = z.infer<typeof breakdownTaskBodySchema>;
