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
    <div className="absolute inset-0 z-30 flex flex-col bg-[#0b0705]/88 px-3 py-4">
      <div className="parchment flex min-h-0 flex-1 flex-col rounded-3xl px-4 py-4">
        <div className="text-center font-display text-xl">本局记录</div>
        <pre className="mt-3 min-h-0 flex-1 overflow-auto whitespace-pre-wrap text-[12px] leading-5">
          {text}
        </pre>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-full bg-[#2a160e]/10 py-3 text-sm text-[#2a160e]"
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
          <button
            type="button"
            className="wood-btn py-3 text-sm"
            onClick={() => downloadRecord(room)}
          >
            下载
          </button>
        </div>
        <button type="button" onClick={onClose} className="mt-2 py-2 text-sm text-[#8a5a28]">
          关上
        </button>
      </div>
    </div>
  );
}
