"use client";

import { useState } from "react";
import { TopBar } from "./shell";
import { TableScene } from "./table-scene";

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
    <div className="screen screen-room">
      <TopBar title="加入房间" onBack={onBack} />
      <TableScene />
      <form
        className="drawer space-y-3"
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
  );
}
