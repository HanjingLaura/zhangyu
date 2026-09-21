"use client";

import { useState } from "react";
import { ROUND_OPTIONS } from "@/lib/seats";
import type { LinkMode } from "@/lib/types";
import { SeaCard, SeaField } from "./sea-card";

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
    <SeaCard
      title="创建房间"
      action="创建"
      error={error}
      busy={busy}
      onBack={onBack}
      onSubmit={async () => {
        setBusy(true);
        try {
          await onCreate({ mode, maxRounds });
        } finally {
          setBusy(false);
        }
      }}
    >
      <SeaField label="玩法">
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
              className={`chip flex min-h-[42px] flex-1 items-center justify-center py-2.5 text-center ${mode === id ? "chip-on" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      </SeaField>
      <SeaField label="轮数">
        <div className="flex gap-2">
          {ROUND_OPTIONS.map((rounds) => (
            <button
              key={rounds}
              type="button"
              onClick={() => setMaxRounds(rounds)}
              className={`chip flex min-h-[42px] flex-1 items-center justify-center py-2.5 text-center ${maxRounds === rounds ? "chip-on" : ""}`}
            >
              {rounds} 轮
            </button>
          ))}
        </div>
      </SeaField>
    </SeaCard>
  );
}
