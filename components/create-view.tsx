"use client";

import { useState } from "react";
import { ROUND_OPTIONS } from "@/lib/seats";
import type { LinkMode } from "@/lib/types";
import { TopBar } from "./shell";

export function CreateView({
  error,
  onBack,
  onCreate,
}: {
  error?: string;
  onBack: () => void;
  onCreate: (options: { mode: LinkMode; maxRounds: number }) => Promise<void>;
}) {
  const [mode, setMode] = useState<LinkMode>("char");
  const [maxRounds, setMaxRounds] = useState(100);
  const [busy, setBusy] = useState(false);

  return (
    <div className="screen screen-sea">
      <TopBar title="创建房间" onBack={onBack} />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-8">
        <form
          className="w-full max-w-sm space-y-4 rounded-3xl bg-black/25 px-4 py-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            try {
              await onCreate({ mode, maxRounds });
            } finally {
              setBusy(false);
            }
          }}
        >
          <div>
            <div className="mb-2 text-xs text-foam/50">玩法</div>
            <div className="flex gap-2">
              {(
                [
                  ["char", "字接字"],
                  ["pinyin", "音接音"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={`chip flex-1 text-center ${mode === id ? "chip-on" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs text-foam/50">轮数</div>
            <div className="flex gap-2">
              {ROUND_OPTIONS.map((rounds) => (
                <button
                  key={rounds}
                  type="button"
                  onClick={() => setMaxRounds(rounds)}
                  className={`chip flex-1 text-center ${maxRounds === rounds ? "chip-on" : ""}`}
                >
                  {rounds} 轮
                </button>
              ))}
            </div>
          </div>
          {error ? <p className="text-center text-sm text-coral">{error}</p> : null}
          <button type="submit" disabled={busy} className="btn btn-primary w-full">
            创建
          </button>
        </form>
      </div>
    </div>
  );
}
