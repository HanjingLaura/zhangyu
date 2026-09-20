import { getOutfit } from "@/lib/wardrobe";

export function Figure({
  name,
  src,
  outfitId,
  size = 128,
}: {
  name: string;
  src?: string;
  outfitId?: string;
  size?: number;
}) {
  const outfit = getOutfit(outfitId);
  if (!outfit.src || !outfit.hole || !outfit.aspect) {
    return (
      <span
        className="inline-flex overflow-hidden rounded-full bg-[#2f8f8a]"
        style={{ width: size * 0.42, height: size * 0.42 }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-ink">
            {name.slice(0, 1)}
          </span>
        )}
      </span>
    );
  }

  const width = size * outfit.aspect;
  const height = size;

  return (
    <span className="relative inline-block" style={{ width, height }}>
      <span
        className="absolute overflow-hidden rounded-full bg-[#1a120c]"
        style={{
          left: `${outfit.hole.cx}%`,
          top: `${outfit.hole.cy}%`,
          width: `${outfit.hole.rw * 2}%`,
          height: `${outfit.hole.rh * 2}%`,
          transform: "translate(-50%, -50%)",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)",
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover object-[center_28%]" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-[#f4f7f2]">
            {name.slice(0, 1)}
          </span>
        )}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={outfit.src} alt="" className="relative z-[1] h-full w-full object-contain" />
    </span>
  );
}
