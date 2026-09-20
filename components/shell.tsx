import type { ReactNode } from "react";

export function GameCabinet({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh justify-center bg-[#04202c]">
      <div className="relative h-full w-full max-w-[480px] overflow-hidden bg-bg sm:border-x sm:border-white/10">
        {children}
      </div>
    </div>
  );
}

export function TopBar({
  title,
  right,
  onBack,
}: {
  title: ReactNode;
  right?: ReactNode;
  onBack?: () => void;
}) {
  return (
    <header className="relative z-10 flex shrink-0 items-center justify-between px-3 pb-1 pt-[calc(10px+env(safe-area-inset-top))]">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foam/70 active:bg-white/10"
          aria-label="返回"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 5 8 12l7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <div className="h-10 w-10" />
      )}
      <div className="text-center text-[15px] text-foam/85">{title}</div>
      <div className="flex h-10 min-w-10 items-center justify-end text-xs text-foam/50">{right}</div>
    </header>
  );
}
