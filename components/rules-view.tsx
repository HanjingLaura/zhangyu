import { ChatHeader } from "./shell";
import { OctopusMark } from "./octopus";

const RULES = [
  {
    title: "为啥叫丈育",
    body: "丈育是文盲的写法，章鱼是它的谐音。图标、裁判、命数，全按八条触手来。",
  },
  {
    title: "怎么接",
    body: "字接字：上一句最后一个字，等于下一句第一个字。音接音：读音对上即可，方便你们继续文化事故。",
  },
  {
    title: "什么算赢",
    body: "每人三条触手。接错、不是成语、重复、主动过，都掉一条。最后还剩触手的人赢。查词会加丈育值。",
  },
  {
    title: "名场面会被点名",
    body: "龙年大吉、舞动青春、春天来了、吉祥三宝，章鱼都认。群里演过的，这儿还能再演一遍。",
  },
];

export function RulesView({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex h-full flex-col bg-foam">
      <ChatHeader title="怎么玩" subtitle="章鱼裁判手册" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="mb-5 flex items-center gap-3 rounded-3xl bg-white px-4 py-3">
          <OctopusMark mood="judge" className="h-16 w-16" />
          <p className="text-sm leading-6 text-ink/70">
            正经接龙能玩，丈育接龙更好玩。接不上就输，查了也记账。
          </p>
        </div>
        <div className="space-y-3">
          {RULES.map((rule) => (
            <section key={rule.title} className="rounded-3xl bg-white px-4 py-4">
              <h2 className="font-display text-lg text-ink">{rule.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/65">{rule.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
