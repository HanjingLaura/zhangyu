"use client";

import { useRef, useState } from "react";

export const SEAT_COLORS = ["#e46a3a", "#5aa89a", "#e6c37a", "#c084fc"];

export function colorFor(id: string) {
  const n = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return SEAT_COLORS[n % SEAT_COLORS.length];
}

export async function compressAvatar(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("请选一张图片");
  }
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("画不出头像");
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
  ring = false,
  empty = false,
}: {
  name: string;
  src?: string;
  size?: number;
  ring?: boolean;
  empty?: boolean;
}) {
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const showPhoto = Boolean(src) && !empty && brokenSrc !== src;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${
        ring ? "ring-2 ring-[#f0d48a] ring-offset-2 ring-offset-[#1b120c]" : ""
      }`}
      style={{
        width: size,
        height: size,
        background: empty ? "#4a321f" : showPhoto ? "#2a160e" : colorFor(name || "座"),
        color: "#2a160e",
      }}
    >
      {showPhoto ? (
        // User-uploaded seat photo; next/image is not needed for local API blobs.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setBrokenSrc(src ?? null)}
        />
      ) : (
        <span className="text-sm font-semibold text-[#2a160e]">
          {empty ? "+" : name.slice(0, 1)}
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
  label = "换头像",
}: {
  name: string;
  src?: string;
  size?: number;
  onPick: (dataUrl: string) => Promise<void> | void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="group relative"
      aria-label={label}
    >
      <Avatar name={name || "我"} src={src} size={size} ring />
      <span className="absolute -bottom-1 left-1/2 w-max -translate-x-1/2 whitespace-nowrap rounded-full bg-[#2a160e] px-2 py-0.5 text-[10px] text-gold shadow">
        {src ? "换一张" : "上传头像"}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          await onPick(await compressAvatar(file));
        }}
      />
    </button>
  );
}
