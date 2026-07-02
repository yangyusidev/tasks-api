"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Task } from "@/lib/types/task";
import {
  breakdownTask,
  createTask,
  deleteTask,
  fetchTasks,
  updateTaskStatus,
} from "@/lib/todo/api";
import { TaskItem, type DecorationMode } from "@/components/todo/TaskItem";
import { nextTaskStatus } from "@/lib/todo/status-cycle";
import { PromptGenerator } from "@/components/prompts/PromptGenerator";

const DECO_STORAGE_KEY = "todo-decoration-mode";

function sortByCreatedDesc(a: Task, b: Task) {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [breakdownTaskId, setBreakdownTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [decorationMode, setDecorationMode] = useState<DecorationMode>("journal");
  const [activeTab, setActiveTab] = useState<"tasks" | "prompt">("prompt");
  const [tasksLoaded, setTasksLoaded] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(DECO_STORAGE_KEY);
      if (v === "minimal" || v === "journal") setDecorationMode(v);
    } catch {
      /* ignore */
    }
  }, []);

  const setDeco = useCallback((mode: DecorationMode) => {
    setDecorationMode(mode);
    try {
      localStorage.setItem(DECO_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    const list = await fetchTasks();
    setTasks(list);
    setTasksLoaded(true);
  }, []);

  useEffect(() => {
    if (activeTab !== "tasks" || tasksLoaded) return;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await refresh();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "加载失败");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, refresh, tasksLoaded]);

  const rootTasks = useMemo(() => {
    return tasks.filter((t) => !t.parent_id).sort(sortByCreatedDesc);
  }, [tasks]);

  const handleAdd = async () => {
    const title = input.trim();
    if (!title) return;
    setBusy(true);
    setError(null);
    try {
      await createTask(title);
      setInput("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "添加失败");
    } finally {
      setBusy(false);
    }
  };

  const handleStatusAdvance = async (task: Task) => {
    const next = nextTaskStatus(task.status);
    setBusy(true);
    setError(null);
    try {
      await updateTaskStatus(task.id, next);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新失败");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (task: Task) => {
    if (!window.confirm(`确定删除「${task.title}」？子任务会一并删除。`)) return;
    setBusy(true);
    setError(null);
    try {
      await deleteTask(task.id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    } finally {
      setBusy(false);
    }
  };

  const handleBreakdown = async (task: Task) => {
    setBusy(true);
    setBreakdownTaskId(task.id);
    setError(null);
    try {
      await breakdownTask(task.id, task.title);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "拆解失败");
    } finally {
      setBreakdownTaskId(null);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 text-center">
        <p className="font-journal text-lg text-sepia md:text-xl">— today&apos;s note —</p>
        <h1 className="font-hand text-4xl text-ink drop-shadow-sm md:text-5xl">待办手账</h1>
        <p className="mt-2 font-journal text-lg text-ink-muted">
          {activeTab === "tasks" ? "把心事写进纸里，一点点划掉。" : "把零散想法压成一张好用的提示词纸条。"}
        </p>

        <div
          className="mx-auto mt-5 flex w-full max-w-md rounded-lg border border-ink/15 bg-white/35 p-1 shadow-lift"
          role="tablist"
          aria-label="首页功能"
        >
          <button
            type="button"
            onClick={() => setActiveTab("tasks")}
            role="tab"
            aria-selected={activeTab === "tasks"}
            className={`min-h-10 flex-1 rounded-md px-3 font-journal text-xl transition ${
              activeTab === "tasks"
                ? "bg-tape/35 text-sepia shadow-sm"
                : "text-ink-muted hover:bg-white/45"
            }`}
          >
            待办清单
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("prompt")}
            role="tab"
            aria-selected={activeTab === "prompt"}
            className={`min-h-10 flex-1 rounded-md px-3 font-journal text-xl transition ${
              activeTab === "prompt"
                ? "bg-tape/35 text-sepia shadow-sm"
                : "text-ink-muted hover:bg-white/45"
            }`}
          >
            提示词生成
          </button>
        </div>

        {activeTab === "tasks" ? (
          <>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="font-journal text-base text-ink-muted">外观：</span>
              <button
                type="button"
                onClick={() => setDeco("journal")}
                className={`rounded-md border px-3 py-1 font-journal text-lg transition ${
                  decorationMode === "journal"
                    ? "border-sepia bg-tape/30 text-sepia shadow-sm"
                    : "border-ink/15 bg-white/40 text-ink-muted hover:bg-white/60"
                }`}
              >
                手账装饰
              </button>
              <button
                type="button"
                onClick={() => setDeco("minimal")}
                className={`rounded-md border px-3 py-1 font-journal text-lg transition ${
                  decorationMode === "minimal"
                    ? "border-sepia bg-tape/30 text-sepia shadow-sm"
                    : "border-ink/15 bg-white/40 text-ink-muted hover:bg-white/60"
                }`}
              >
                简洁
              </button>
            </div>
            <p className="mt-2 font-journal text-sm text-ink-muted/80">
              点左侧手绘框可循环：待办 → 进行中 → 已完成
            </p>
          </>
        ) : null}
      </header>

      {activeTab === "tasks" ? (
        <div className="paper-texture noise-overlay relative mx-auto max-w-2xl overflow-hidden rounded-lg border border-ink/15 p-5 shadow-sheet">
          <div className="relative z-[1] flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 font-journal text-lg text-ink-muted">
              新任务
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleAdd();
                }}
                placeholder="写下一行待办…"
                disabled={busy || loading}
                className="mt-1 w-full rounded-md border border-sepia/35 bg-white/50 px-3 py-2 font-hand text-xl text-ink shadow-inner outline-none ring-ink/10 placeholder:text-ink-muted/50 focus:border-sepia focus:ring-2 disabled:opacity-60"
              />
            </label>
            <button
              type="button"
              onClick={() => void handleAdd()}
              disabled={busy || loading || !input.trim()}
              className="h-11 shrink-0 rounded-md border-2 border-dashed border-sepia bg-tape/25 px-6 font-journal text-2xl text-sepia shadow-sm transition hover:bg-tape/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              添加
            </button>
          </div>

          {error ? (
            <p
              className="relative z-[1] mt-4 rounded border border-red-300/60 bg-red-50/80 px-3 py-2 font-journal text-lg text-red-900"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="relative z-[1] mt-8">
            {loading ? (
              <p className="font-journal text-xl text-ink-muted">正在翻开本子…</p>
            ) : rootTasks.length === 0 ? (
              <p className="font-hand text-2xl text-ink-muted">这一页还是空的，写点什么吧。</p>
            ) : (
              <ul className="space-y-1">
                {rootTasks.map((t) => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    tasks={tasks}
                    depth={0}
                    busy={busy}
                    breakdownTaskId={breakdownTaskId}
                    decorationMode={decorationMode}
                    onStatusAdvance={handleStatusAdvance}
                    onDelete={handleDelete}
                    onBreakdown={handleBreakdown}
                  />
                ))}
              </ul>
            )}
          </div>

          <div className="relative z-[1] mt-8 flex justify-end">
            <span className="font-journal text-base text-ink-muted/70">— end —</span>
          </div>
        </div>
      ) : (
        <PromptGenerator />
      )}
    </div>
  );
}
