"use client";

import { useState } from "react";
import { RoomHeader } from "./shell";

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
    <div className="tavern-screen">
      <RoomHeader title="加入房间" subtitle="问开桌的人要四位房号" onBack={onBack} />
      <form
        className="relative z-10 flex flex-1 flex-col justify-center px-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          try {
            await onJoin(code.trim().toUpperCase());
          } catch (err) {
            setError(err instanceof Error ? err.message : "进不去");
          } finally {
            setBusy(false);
          }
        }}
      >
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="K8YM"
          className="w-full rounded-2xl bg-white/8 px-4 py-5 text-center font-display text-4xl tracking-[0.45em] outline-none ring-gold/40 focus:ring-2"
          maxLength={4}
        />
        {error ? <p className="mt-3 text-center text-sm text-coral">{error}</p> : null}
        <button
          type="submit"
          disabled={busy || code.length < 4}
          className="wood-btn mt-6 py-3.5"
        >
          入座
        </button>
      </form>
    </div>
  );
}
