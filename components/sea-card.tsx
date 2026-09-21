import type { FormEvent, ReactNode } from "react";
import { TopBar } from "./shell";

export function SeaCard({
  title,
  action,
  error,
  busy = false,
  disabled = false,
  onBack,
  onSubmit,
  children,
}: {
  title: string;
  action: string;
  error?: string;
  busy?: boolean;
  disabled?: boolean;
  onBack: () => void;
  onSubmit: () => void | Promise<void>;
  children: ReactNode;
}) {
  return (
    <div className="screen screen-sea">
      <TopBar title={title} onBack={onBack} />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-8">
        <form
          className="w-full max-w-sm space-y-3 rounded-3xl bg-black/25 px-4 py-4"
          onSubmit={async (event: FormEvent) => {
            event.preventDefault();
            await onSubmit();
          }}
        >
          {children}
          {error ? <p className="text-center text-sm text-coral">{error}</p> : null}
          <button type="submit" disabled={busy || disabled} className="btn btn-primary w-full">
            {action}
          </button>
        </form>
      </div>
    </div>
  );
}

export function SeaField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs text-foam/50">{label}</div>
      {children}
    </div>
  );
}
