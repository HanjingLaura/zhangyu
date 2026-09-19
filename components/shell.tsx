import type { ReactNode } from "react";

export function GameCabinet({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#071116] px-2 py-2 sm:px-6 sm:py-4">
      <div className="relative flex h-[min(100dvh-0.5rem,920px)] w-full max-w-[430px] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1f24] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
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
    <header className="shrink-0 px-3 pb-2 pt-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10"
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
          <div className="font-display text-[17px] tracking-wide text-gold">
            {title}
          </div>
          {subtitle ? (
            <div className="text-[11px] text-white/40">{subtitle}</div>
          ) : null}
        </div>
        <div className="h-9 w-9" />
      </div>
    </header>
  );
}
