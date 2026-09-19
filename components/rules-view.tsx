import { RoomHeader } from "./shell";
import { OctopusFigure } from "./octopus";

const RULES = [
  {
    title: "围桌怎么坐",
    body: "两到四人共用这张桌子。人少就坐对面，人齐了就东南西北围一圈。轮到谁，谁的座位会亮。",
  },
  {
    title: "中间那只章鱼",
    body: "桌上的章鱼是裁判。上一句的尾巴字摊在它面前。接对了它点头，接成拜年短信或广播体操，它会当场点名。",
  },
  {
    title: "触手和丈育值",
    body: "每人三条触手。接错、不是成语、重复、主动过，都掉一条。查词加丈育值。触手掉光出局。",
  },
  {
    title: "散场怎么算",
    body: "最后还坐着的人算活到最后。丈育值最高的人是丈育王，今晚回群里负责被笑。",
  },
];

export function RulesView({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,#16343c_0%,#0b1f24_58%)] text-white">
      <RoomHeader title="怎么玩" subtitle="围桌手册" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="mb-5 flex items-center gap-3 rounded-3xl bg-white/8 px-4 py-3">
          <OctopusFigure className="h-16 w-16 object-contain" />
          <p className="text-sm leading-6 text-white/70">
            不是刷题，是围着一张桌子轮流接。章鱼坐中间，散场算丈育值。
          </p>
        </div>
        <div className="space-y-3">
          {RULES.map((rule) => (
            <section key={rule.title} className="rounded-3xl bg-white/8 px-4 py-4">
              <h2 className="font-display text-lg text-gold">{rule.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/65">{rule.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
