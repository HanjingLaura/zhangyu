import type { ReactNode } from "react";

export function GameCabinet({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0b0705] px-2 py-2 sm:px-6 sm:py-5">
      <div className="relative flex h-[min(100dvh-0.5rem,920px)] w-full max-w-[430px] flex-col overflow-hidden rounded-[34px] border border-[#f0d48a]/25 bg-[#1b120c] shadow-[0_28px_80px_rgba(0,0,0,0.62)]">
        <div className="pointer-events-none absolute inset-x-16 top-0 h-10 bg-gradient-to-b from-[#f0d48a]/15 to-transparent" />
        {children}
      </div>
    </div>
  );
}

export function RoomHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  return (
    <header className="relative z-10 shrink-0 px-3 pb-1 pt-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#f6efe2]/70 hover:bg-white/10"
          aria-label="返回"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 5 8 12l7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="text-center">
          <div className="font-display text-[18px] tracking-wide text-gold">{title}</div>
          {subtitle ? <div className="text-[11px] text-white/40">{subtitle}</div> : null}
        </div>
        <div className="h-9 w-9" />
      </div>
    </header>
  );
}
