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
    <div className="screen">
      <TopBar title={title} onBack={onBack} />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-5">
        <form
          className="h-fit w-full max-w-sm space-y-2.5 rounded-3xl bg-black/25 px-3.5 py-3"
          onSubmit={async (event: FormEvent) => {
            event.preventDefault();
            await onSubmit();
          }}
        >
          {children}
          {error ? <p className="text-center text-sm text-coral">{error}</p> : null}
          <button type="submit" disabled={busy || disabled} className="btn btn-primary h-12 w-full py-0">
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
