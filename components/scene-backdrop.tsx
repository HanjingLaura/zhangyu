"use client";

import { withBase } from "@/lib/base-path";
import type { BackdropKind } from "@/lib/assets";

const SAND = withBase("/sand.webp");
const SEA = withBase("/sea.webp");
const ROOM = withBase("/interior.webp?v=8");
const HOUSE = withBase("/house.webp?v=4");

export function SceneBackdrop({ kind }: { kind: BackdropKind }) {
  const sand = kind === "sand" || kind === "home";
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SAND}
        alt=""
        decoding="sync"
        fetchPriority="high"
        className={`absolute inset-0 h-full w-full object-cover ${sand ? "opacity-100" : "opacity-0"}`}
        style={{ objectPosition: kind === "home" ? "center 42%" : "center 28%" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SEA}
        alt=""
        decoding="sync"
        fetchPriority="high"
        className={`absolute inset-0 h-full w-full object-cover ${kind === "sea" ? "opacity-100" : "opacity-0"}`}
        style={{ objectPosition: "78% 60%" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ROOM}
        alt=""
        decoding="sync"
        fetchPriority="high"
        className={`absolute inset-0 h-full w-full object-cover ${kind === "room" ? "opacity-100" : "opacity-0"}`}
        style={{ objectPosition: "center top" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HOUSE}
        alt=""
        width={543}
        height={753}
        decoding="sync"
        fetchPriority="high"
        className={`absolute left-1/2 top-[46%] w-[78%] -translate-x-1/2 -translate-y-1/2 select-none ${kind === "home" ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
