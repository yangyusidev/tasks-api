"use client";

import { useMemo, useState } from "react";
import { optimizePrompt } from "@/lib/prompts/api";

const EXAMPLE_PROMPT = "帮我写一个周报，内容包括本周进展、遇到的问题和下周计划，语气专业一点。";

export function PromptGenerator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const handleGenerate = async () => {
    const userPrompt = input.trim();
    if (!userPrompt) return;

    setLoading(true);
    setCopied(false);
    setError(null);
    try {
      const result = await optimizePrompt(userPrompt);
      setOutput(result.prompt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "优化失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("复制失败，请手动选择文本复制");
    }
  };

  return (
    <div className="paper-texture noise-overlay relative overflow-hidden rounded-lg border border-ink/15 p-5 shadow-sheet">
      <div className="relative z-[1] grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="flex min-h-[420px] flex-col">
          <div className="mb-3 flex items-end justify-between gap-3">
            <label htmlFor="prompt-input" className="font-journal text-2xl text-sepia">
              原始提示词
            </label>
            <button
              type="button"
              onClick={() => setInput(EXAMPLE_PROMPT)}
              disabled={loading}
              className="rounded-md border border-ink/15 bg-white/45 px-3 py-1 font-journal text-lg text-ink-muted shadow-lift transition hover:bg-white/65 disabled:cursor-not-allowed disabled:opacity-50"
            >
              试一条
            </button>
          </div>
          <textarea
            id="prompt-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="写下你想交给 AI 的原始需求..."
            disabled={loading}
            className="min-h-[280px] flex-1 resize-none rounded-md border border-sepia/35 bg-white/55 px-4 py-3 font-hand text-2xl leading-9 text-ink shadow-inner outline-none ring-ink/10 placeholder:text-ink-muted/45 focus:border-sepia focus:ring-2 disabled:opacity-60"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-journal text-base text-ink-muted/75">
              {input.trim().length > 0 ? `${input.trim().length} 字` : "— blank page —"}
            </p>
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={!canSubmit}
              className="rounded-md border-2 border-dashed border-sepia bg-tape/25 px-6 py-2 font-journal text-2xl text-sepia shadow-sm transition hover:bg-tape/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "生成中..." : "生成"}
            </button>
          </div>
        </section>

        <section className="flex min-h-[420px] flex-col">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="font-journal text-2xl text-sepia">优化结果</h2>
            <button
              type="button"
              onClick={() => void handleCopy()}
              disabled={!output || loading}
              className="rounded-md border border-ink/15 bg-white/45 px-3 py-1 font-journal text-lg text-ink-muted shadow-lift transition hover:bg-white/65 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied ? "已复制" : "复制"}
            </button>
          </div>

          <div className="min-h-[280px] flex-1 whitespace-pre-wrap rounded-md border border-ink/15 bg-[#fffaf0]/70 px-4 py-3 font-mono text-sm leading-6 text-ink shadow-inner">
            {output ? (
              output
            ) : (
              <span className="font-hand text-2xl leading-9 text-ink-muted/55">
                优化后的提示词会写在这里。
              </span>
            )}
          </div>

          {error ? (
            <p
              className="mt-4 rounded border border-red-300/60 bg-red-50/80 px-3 py-2 font-journal text-lg text-red-900"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
