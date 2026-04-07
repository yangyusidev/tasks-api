/** 小图钉装饰（完成任务旁） */
export function PushPin({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex select-none ${className}`}
      aria-hidden
      title=""
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 32 32"
        className="drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="16" cy="9" rx="7" ry="5" fill="#c75c5c" opacity="0.95" />
        <ellipse cx="16" cy="8" rx="4" ry="2.5" fill="#e88888" opacity="0.7" />
        <path
          d="M16 14v12"
          stroke="#5a4a42"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 26h8"
          stroke="#5a4a42"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
