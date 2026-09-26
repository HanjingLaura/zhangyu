"use client";

import { useEffect, useRef, useState } from "react";

export const SEAT_COLORS = ["#6ec8c0", "#f4d35e", "#ff7f6a", "#b98bf5"];

export function colorFor(id: string) {
  const n = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return SEAT_COLORS[n % SEAT_COLORS.length];
}

export async function compressAvatar(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("请选择图片");
  }
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("图片处理失败");
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, 256, 256);
  return canvas.toDataURL("image/jpeg", 0.86);
}

export function Avatar({
  name,
  src,
  size = 44,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const showPhoto = Boolean(src) && brokenSrc !== src;

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        background: showPhoto ? "#2a160e" : colorFor(name || "座"),
      }}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          decoding="sync"
          className="h-full w-full object-cover"
          onError={() => setBrokenSrc(src ?? null)}
        />
      ) : (
        <span className="font-semibold text-ink" style={{ fontSize: size * 0.4 }}>
          {name.slice(0, 1)}
        </span>
      )}
    </span>
  );
}

export function AvatarPicker({
  name,
  src,
  size = 88,
  onPick,
  confirmFirst = false,
  onLogout,
}: {
  name: string;
  src?: string;
  size?: number;
  onPick: (dataUrl: string) => Promise<void> | void;
  confirmFirst?: boolean;
  onLogout?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!confirmFirst || !open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [confirmFirst, open]);

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        setOpen(false);
        if (!file) return;
        await onPick(await compressAvatar(file));
      }}
    />
  );

  if (confirmFirst) {
    return (
      <div ref={rootRef} className="relative shrink-0">
        <button type="button" onClick={() => setOpen((value) => !value)} aria-label="头像">
          <span className="block rounded-full ring-2 ring-gold/70 ring-offset-2 ring-offset-transparent">
            <Avatar name={name || "我"} src={src} size={size} />
          </span>
        </button>
        {open ? (
          <div className="absolute left-0 top-[calc(100%+10px)] z-20 flex flex-col items-start gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs text-black shadow"
            >
              更换头像
            </button>
            {onLogout ? (
              <button
                type="button"
                onClick={onLogout}
                className="whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs text-black shadow"
              >
                退出
              </button>
            ) : null}
          </div>
        ) : null}
        {input}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="relative shrink-0"
      aria-label="上传头像"
    >
      <span className="block rounded-full ring-2 ring-gold/70 ring-offset-2 ring-offset-bg">
        <Avatar name={name || "我"} src={src} size={size} />
      </span>
      <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-ink shadow">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 8h3l2-3h6l2 3h3v11H4z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="2" />
        </svg>
      </span>
      {input}
    </button>
  );
}
