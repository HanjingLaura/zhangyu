import { getOutfit } from "@/lib/wardrobe";

function Face({
  name,
  src,
  box,
}: {
  name: string;
  src?: string;
  box: { cx: number; cy: number; rw: number; rh: number };
}) {
  const style = {
    left: `${box.cx - box.rw}%`,
    top: `${box.cy - box.rh}%`,
    width: `${box.rw * 2}%`,
    height: `${box.rh * 2}%`,
  };
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className="absolute object-cover object-[center_28%]"
        style={style}
      />
    );
  }
  return (
    <span
      className="absolute flex items-center justify-center text-[11px] font-semibold text-[#f4f7f2]"
      style={style}
    >
      {name.slice(0, 1)}
    </span>
  );
}

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
  if (!outfit.src || !outfit.aspect) {
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
  const hole = outfit.hole ?? { cx: 50, cy: 18, rw: 16, rh: 10 };

  return (
    <span className="relative inline-block" style={{ width, height }}>
      <span
        className="visor-hole absolute inset-0 bg-[#1a120c]"
        style={
          outfit.mask
            ? {
                WebkitMaskImage: `url(${outfit.mask})`,
                maskImage: `url(${outfit.mask})`,
              }
            : {
                clipPath: `ellipse(${hole.rw}% ${hole.rh}% at ${hole.cx}% ${hole.cy}%)`,
              }
        }
      >
        <Face name={name} src={src} box={hole} />
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={outfit.src} alt="" className="relative z-[1] h-full w-full object-contain" />
    </span>
  );
}
