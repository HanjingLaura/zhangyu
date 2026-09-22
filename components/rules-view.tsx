import { TopBar } from "./shell";

const RULES = [
  ["人数", "2 到 6 人。创建房间后把房号发给别人。"],
  ["顺序", "默认从房主开始顺时针接。创建时勾选抢答，就看谁快，谁先接上算谁的。"],
  ["规则", "创建时选字接字、音接音或英文。中文四个字接上就算一轮。英文用单词，尾字母接下一个首字母。不能重复。"],
  ["轮数", "创建房间时选 20、50 或 100 轮，也可以提前结束。"],
  ["计分", "正经成语 +1 文化。四个字但不是成语、接错、重复、空发、跳过 +1 丈育；看提示 +2 丈育。"],
  ["贝壳", "打完一局发：底 6 + 文化×3。最有文化和最丈育分开评，再分别加 10 和 4。一局最多 50。"],
  ["服装", "默认宇航服。新号送 20 贝壳。别的衣服用贝壳换，头像嵌在开口里。"],
  ["结算", "文化最高是最有文化。丈育最高是最丈育，且不能跟最有文化是同一个人。"],
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
