import { TopBar } from "./shell";

const RULES = [
  ["人数", "2 到 4 人。创建房间后把房号发给别人。"],
  ["顺序", "从房主开始顺时针接，没有时间限制。"],
  ["规则", "字接字：上一个成语的最后一个字，是下一个成语的第一个字。音接音：读音相同即可。必须是四字成语，不能重复。"],
  ["轮数", "默认 100 轮，房主可以改成 20 或 50 轮，也可以提前结束。"],
  ["计分", "接对加 1 分。接错、不是成语、重复、跳过记 1 丈育。看提示记 2 丈育。发弹幕和接出群里的经典句子加有意思。"],
  ["结算", "最有意思、最没文化、最丈育、最高分。记录可以复制或下载。"],
];

export function RulesView({ onBack }: { onBack: () => void }) {
  return (
    <div className="screen">
      <TopBar title="玩法" onBack={onBack} />
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-8 pt-2">
        <dl className="divide-y divide-white/8">
          {RULES.map(([term, body]) => (
            <div key={term} className="flex gap-4 py-4">
              <dt className="w-10 shrink-0 text-sm text-gold">{term}</dt>
              <dd className="text-sm leading-6 text-foam/75">{body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
