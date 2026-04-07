"use client";

import type { TaskStatus } from "@/lib/types/task";
import { STATUS_LABELS, nextTaskStatus } from "@/lib/todo/status-cycle";

type Props = {
  status: TaskStatus;
  onAdvance: () => void;
  disabled?: boolean;
};

function nextHint(status: TaskStatus): string {
  const next = nextTaskStatus(status);
  return `当前：${STATUS_LABELS[status]}。点击进入「${STATUS_LABELS[next]}」`;
}

/** 手绘风格三态：待办 → 进行中 → 已完成 → 待办 */
export function HandCheckbox({ status, onAdvance, disabled }: Props) {
  return (
    <button
      type="button"
      aria-label={nextHint(status)}
      disabled={disabled}
      onClick={onAdvance}
      className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-sm outline-none ring-ink/20 transition hover:ring-2 focus-visible:ring-2 disabled:opacity-40"
    >
      <svg
        viewBox="0 0 48 48"
        className="h-9 w-9 text-ink drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M6 10c4-2 10-3 16-2 6 1 14 0 20 2 2 6 3 14 2 22-1 6-2 12-6 14-5 2-12 2-18 1C12 45 6 40 5 32 4 24 4 16 6 10z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-90"
        />
        {status === "in_progress" ? (
          <>
            <path
              d="M14 26c3-2 6-3 10-2s8 2 12 1"
              stroke="#a16207"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />
            <circle cx="24" cy="22" r="3.2" fill="#ca8a04" opacity="0.35" />
          </>
        ) : null}
        {status === "completed" ? (
          <path
            d="M12 24c4 4 6 8 8 12 2-6 6-14 14-22"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-sepia"
          />
        ) : null}
      </svg>
    </button>
  );
}

export function statusBadgeClass(status: TaskStatus): string {
  switch (status) {
    case "pending":
      return "bg-stone-200/70 text-ink-muted ring-1 ring-stone-300/80";
    case "in_progress":
      return "bg-amber-100/90 text-amber-900 ring-1 ring-amber-300/70";
    case "completed":
      return "bg-emerald-100/70 text-emerald-900 ring-1 ring-emerald-300/60";
    default:
      return "";
  }
}
