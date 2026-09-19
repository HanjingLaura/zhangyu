import type { ReactNode } from "react";

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-sea px-3 py-4 sm:px-6">
      <div className="relative flex h-[min(100dvh-2rem,860px)] w-full max-w-[390px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-foam shadow-[0_24px_80px_rgba(8,20,24,0.45)]">
        {children}
      </div>
    </div>
  );
}

export function ChatHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  return (
    <header className="shrink-0 border-b border-ink/8 bg-white/90 px-3 pb-2.5 pt-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink/70 hover:bg-ink/5"
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
          <div className="font-display text-[17px] tracking-wide text-ink">
            {title}
          </div>
          {subtitle ? (
            <div className="text-[11px] text-ink/45">{subtitle}</div>
          ) : null}
        </div>
        <div className="flex h-9 w-9 items-center justify-center text-ink/40">
          ···
        </div>
      </div>
    </header>
  );
}
