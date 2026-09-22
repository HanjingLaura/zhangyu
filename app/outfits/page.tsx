import { withBase } from "@/lib/base-path";
import { OUTFITS } from "@/lib/wardrobe";

export default function OutfitsPage() {
  return (
    <main className="min-h-dvh bg-[#04202c] text-[#f4f7f2]">
      <div className="mx-auto max-w-[480px] px-4 pb-10 pt-6">
        <a href={withBase("/")} className="text-sm text-[#e8d48a]">
          回游戏
        </a>
        <h1 className="mt-3 font-display text-3xl text-[#e8d48a]">商店服装</h1>
        <p className="mt-1 text-sm text-white/55">游戏右上角房子 → 服装，用贝壳换</p>
        <div className="mt-5 space-y-5">
          {OUTFITS.map((item) => (
            <section key={item.id} className="overflow-hidden rounded-[28px] bg-black/25">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt={item.name} className="w-full bg-white" />
              <div className="px-4 py-3 text-lg">
                {item.name}
                <span className="ml-2 text-sm text-white/45">{item.price ? `${item.price} 贝壳` : "免费"}</span>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
