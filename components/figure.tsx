import { Avatar } from "./avatar";
import { getOutfit } from "@/lib/wardrobe";

export function Figure({
  name,
  src,
  outfitId,
  size = 92,
}: {
  name: string;
  src?: string;
  outfitId?: string;
  size?: number;
}) {
  const outfit = getOutfit(outfitId);
  if (!outfit.src || !outfit.hole) {
    return <Avatar name={name} src={src} size={Math.round(size * 0.58)} />;
  }

  return (
    <span className="relative inline-block" style={{ width: size, height: size }}>
      <span
        className="absolute overflow-hidden rounded-full bg-[#1b120c]"
        style={{
          left: `${outfit.hole.cx}%`,
          top: `${outfit.hole.cy}%`,
          width: `${outfit.hole.rw * 2}%`,
          height: `${outfit.hole.rh * 2}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-ink">
            {name.slice(0, 1)}
          </span>
        )}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={outfit.src} alt="" className="relative z-[1] h-full w-full object-contain" />
    </span>
  );
}
