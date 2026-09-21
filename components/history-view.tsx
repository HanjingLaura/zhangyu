"use client";

import { useEffect, useState } from "react";
import { apiHistory } from "@/lib/client";
import { historyToRoom, type HistoryRecord } from "@/lib/history";
import { SettleView } from "./settle-view";
import { TopBar } from "./shell";

function formatWhen(at: number) {
  const date = new Date(at);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hour}:${minute}`;
}

export function HistoryView({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<HistoryRecord[] | null>(null);
  const [open, setOpen] = useState<HistoryRecord | null>(null);

  useEffect(() => {
    apiHistory()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  if (open) {
    return <SettleView room={historyToRoom(open)} onBack={() => setOpen(null)} />;
  }

  return (
    <div className="screen">
      <TopBar title="历史记录" onBack={onBack} />
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-2">
        {!items ? (
          <p className="py-8 text-center text-sm text-foam/50">加载中</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-foam/50">还没有对局</p>
        ) : (
          <div className="mx-auto w-full max-w-sm space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpen(item)}
                className="flex w-full items-center justify-between gap-3 rounded-3xl bg-black/25 px-3.5 py-3 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm">{item.scores.map((score) => score.name).join("、")}</span>
                  <span className="mt-0.5 block text-[11px] text-foam/45">
                    {item.mode === "char" ? "字接字" : "音接音"}
                    {item.buzz ? " · 抢答" : ""} · {item.rounds} 轮 · {item.code}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] text-foam/40">{formatWhen(item.at)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
