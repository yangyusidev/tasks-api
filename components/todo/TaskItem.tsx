"use client";

import { useMemo } from "react";
import type { Task } from "@/lib/types/task";
import { HandCheckbox, statusBadgeClass } from "@/components/todo/HandCheckbox";
import { WashiTape } from "@/components/todo/WashiTape";
import { PushPin } from "@/components/todo/PushPin";
import { STATUS_LABELS } from "@/lib/todo/status-cycle";

export type DecorationMode = "journal" | "minimal";

type Props = {
  task: Task;
  tasks: Task[];
  depth: number;
  busy: boolean;
  breakdownTaskId: string | null;
  decorationMode: DecorationMode;
  onStatusAdvance: (task: Task) => void;
  onDelete: (task: Task) => void;
  onBreakdown: (task: Task) => void;
};

function sortByCreatedDesc(a: Task, b: Task) {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export function TaskItem({
  task,
  tasks,
  depth,
  busy,
  breakdownTaskId,
  decorationMode,
  onStatusAdvance,
  onDelete,
  onBreakdown,
}: Props) {
  const breakdownBusy = breakdownTaskId === task.id;

  const children = useMemo(() => {
    return tasks.filter((t) => t.parent_id === task.id).sort(sortByCreatedDesc);
  }, [tasks, task.id]);

  const isDone = task.status === "completed";
  const isProgress = task.status === "in_progress";
  const showJournalDecor = decorationMode === "journal" && isDone;

  return (
    <li className="list-none">
      <div
        className={`relative mb-2 flex items-stretch gap-2 rounded-md border border-ink/10 bg-paper/40 px-2 py-2 shadow-lift backdrop-blur-[1px] ${
          isProgress ? "ring-1 ring-amber-400/35" : ""
        }`}
        style={{ marginLeft: depth * 20 }}
      >
        {showJournalDecor ? <WashiTape /> : null}

        <div className="relative z-[1] flex min-w-0 flex-1 items-center gap-2">
          <HandCheckbox
            status={task.status}
            disabled={busy}
            onAdvance={() => onStatusAdvance(task)}
          />

          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex flex-wrap items-center gap-2">
              <span
                className={`font-journal rounded px-1.5 py-0.5 text-sm ${statusBadgeClass(task.status)}`}
              >
                {STATUS_LABELS[task.status]}
              </span>
            </div>
            <p
              className={`font-hand text-xl leading-snug tracking-wide text-ink md:text-2xl ${
                isDone
                  ? "text-ink-muted line-through decoration-2 decoration-sepia/60"
                  : ""
              } ${isProgress ? "italic text-amber-950 underline decoration-dashed decoration-amber-600/50 underline-offset-4" : ""}`}
            >
              {task.title}
            </p>
            <p className="font-journal text-sm text-ink-muted/80">
              {new Date(task.created_at).toLocaleString("zh-CN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {showJournalDecor ? (
            <span className="relative z-[1] shrink-0 self-start pt-1">
              <PushPin />
            </span>
          ) : null}
        </div>

        <div className="relative z-[1] flex shrink-0 flex-col justify-center gap-1 sm:flex-row sm:items-center">
          <button
            type="button"
            disabled={busy || breakdownBusy}
            onClick={() => onBreakdown(task)}
            className="font-journal rounded border border-sepia/40 bg-paper-dark/60 px-2 py-1 text-base text-sepia shadow-sm transition hover:bg-tape/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {breakdownBusy ? "…" : "拆解"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete(task)}
            className="font-journal rounded border border-ink/15 bg-white/30 px-2 py-1 text-base text-ink-muted transition hover:bg-red-100/50 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            删除
          </button>
        </div>
      </div>

      {children.length > 0 ? (
        <ul className="border-l-2 border-dashed border-sepia/25 pl-1">
          {children.map((c) => (
            <TaskItem
              key={c.id}
              task={c}
              tasks={tasks}
              depth={depth + 1}
              busy={busy}
              breakdownTaskId={breakdownTaskId}
              decorationMode={decorationMode}
              onStatusAdvance={onStatusAdvance}
              onDelete={onDelete}
              onBreakdown={onBreakdown}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
