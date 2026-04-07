/** 和纸胶带条（斜纹，叠在已完成任务上） */
export function WashiTape({ className = "" }: { className?: string }) {
  return (
    <span
      className={`pointer-events-none absolute left-0 top-1/2 z-0 block h-7 w-[calc(100%+0.5rem)] -translate-y-1/2 -rotate-[1.2deg] ${className}`}
      aria-hidden
    >
      <span
        className="absolute inset-0 rounded-[2px] opacity-[0.55]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            125deg,
            rgba(212, 165, 116, 0.55) 0px,
            rgba(212, 165, 116, 0.55) 10px,
            rgba(245, 228, 198, 0.45) 10px,
            rgba(245, 228, 198, 0.45) 20px
          )`,
          boxShadow: "0 1px 0 rgba(255,255,255,0.35) inset",
        }}
      />
      <span className="absolute inset-x-0 top-0 h-px bg-white/40" />
    </span>
  );
}
