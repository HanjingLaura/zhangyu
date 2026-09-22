import { withBase } from "@/lib/base-path";

const ITEMS = [
  { id: "1", name: "铜盔潜水员" },
  { id: "2", name: "蟹老板" },
  { id: "3", name: "骑士" },
  { id: "4", name: "熊猫" },
  { id: "5", name: "机甲" },
  { id: "6", name: "蜜蜂" },
  { id: "7", name: "粉海星" },
  { id: "8", name: "海绵厨师" },
] as const;

export default function OutfitsPage() {
  return (
    <main className="min-h-dvh bg-[#04202c] text-[#f4f7f2]">
      <div className="mx-auto max-w-[480px] px-4 pb-10 pt-6">
        <a href={withBase("/")} className="text-sm text-[#e8d48a]">
          回游戏
        </a>
        <h1 className="mt-3 font-display text-3xl text-[#e8d48a]">候选服装</h1>
        <p className="mt-1 text-sm text-white/55">转给姐夫看，回编号就行</p>
        <div className="mt-5 space-y-5">
          {ITEMS.map((item) => (
            <section key={item.id} className="overflow-hidden rounded-[28px] bg-black/25">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={withBase(`/outfits/${item.id}.webp`)}
                alt={`${item.id} ${item.name}`}
                className="w-full bg-white"
              />
              <div className="px-4 py-3 text-lg">
                {item.id}　{item.name}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
