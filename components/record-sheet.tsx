"use client";

import { useState } from "react";
import { copyRecord, downloadRecord, formatRecord } from "@/lib/record";
import type { RoomSnapshot } from "@/lib/types";

export function RecordSheet({
  room,
  onClose,
}: {
  room: RoomSnapshot;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const text = formatRecord(room);

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-black/80 px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-[calc(12px+env(safe-area-inset-top))]">
      <div className="sheet flex min-h-0 flex-1 flex-col rounded-3xl px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="font-display text-xl">记录</div>
          <button type="button" onClick={onClose} className="px-2 py-1 text-sm text-ink/60">
            关闭
          </button>
        </div>
        <pre className="mt-3 min-h-0 flex-1 overflow-auto whitespace-pre-wrap font-sans text-[12px] leading-5">
          {text}
        </pre>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="btn bg-ink/8 py-3 text-sm text-ink"
            onClick={async () => {
              try {
                await copyRecord(room);
              } catch {
                downloadRecord(room);
              }
              setCopied(true);
            }}
          >
            {copied ? "已复制" : "复制"}
          </button>
          <button type="button" className="btn btn-primary py-3 text-sm" onClick={() => downloadRecord(room)}>
            下载
          </button>
        </div>
      </div>
    </div>
  );
}
