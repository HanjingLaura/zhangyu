"use client";

import { useState } from "react";
import { TopBar } from "./shell";

export function JoinView({
  onBack,
  onJoin,
}: {
  onBack: () => void;
  onJoin: (code: string) => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="screen">
      <TopBar title="加入房间" onBack={onBack} />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-8">
        <form
          className="w-full max-w-sm space-y-3 rounded-3xl bg-black/25 px-4 py-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            try {
              await onJoin(code.trim().toUpperCase());
            } catch (err) {
              setError(err instanceof Error ? err.message : "加入失败");
            } finally {
              setBusy(false);
            }
          }}
        >
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="房号"
            className="field text-center font-display text-3xl tracking-[0.4em] placeholder:font-sans placeholder:text-base placeholder:tracking-normal"
            maxLength={4}
            autoCapitalize="characters"
            autoComplete="off"
          />
          {error ? <p className="text-center text-sm text-coral">{error}</p> : null}
          <button type="submit" disabled={busy || code.length < 4} className="btn btn-primary w-full">
            加入
          </button>
        </form>
      </div>
    </div>
  );
}
