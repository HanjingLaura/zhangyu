"use client";

import { useRef, useState } from "react";
import { SeaCard, SeaField } from "./sea-card";

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
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <SeaCard
      title="加入房间"
      action="加入"
      error={error}
      busy={busy}
      onBack={onBack}
      onSubmit={async () => {
        const next = code.trim().toUpperCase();
        if (next.length < 4) {
          setError("请输入四位房号");
          inputRef.current?.focus();
          return;
        }
        setBusy(true);
        setError("");
        try {
          await onJoin(next);
        } catch (err) {
          setError(err instanceof Error ? err.message : "加入失败");
        } finally {
          setBusy(false);
        }
      }}
    >
      <SeaField label="房号">
        <div className="relative">
          <input
            ref={inputRef}
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
            maxLength={4}
            autoCapitalize="characters"
            autoComplete="off"
            autoFocus
            aria-label="房号"
            className="absolute inset-0 z-[1] cursor-text opacity-0 outline-none"
          />
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <span
                key={index}
                className={`chip flex min-h-[48px] flex-1 items-center justify-center text-center font-display text-lg tracking-[0.2em] ${
                  code[index] ? "chip-on" : ""
                }`}
              >
                {code[index] || " "}
              </span>
            ))}
          </div>
        </div>
      </SeaField>
    </SeaCard>
  );
}
