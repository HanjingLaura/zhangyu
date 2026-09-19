import { RoomHeader } from "./shell";
import { OctopusFigure } from "./octopus";

const RULES = [
  {
    title: "注册入座",
    body: "先注册或登录，头像可以上传一张照片。开房间或加入房间，两到四人围着酒桌坐。",
  },
  {
    title: "顺时针接",
    body: "从自己的下一家开始，顺时针一个个接。没有时间限制。上一句最后一个字，等于下一句第一个字。",
  },
  {
    title: "默认一百轮",
    body: "默认每局接一百轮。开桌的人也可以改成二十或五十轮。接满就散场，中途也能提前散场。",
  },
  {
    title: "弹幕和结算",
    body: "谁都可以发弹幕。散场看谁最有意思、最没文化、最丈育、分最高。记录可以导出。",
  },
];

export function RulesView({ onBack }: { onBack: () => void }) {
  return (
    <div className="tavern-screen">
      <RoomHeader title="怎么玩" subtitle="围桌手册" onBack={onBack} />
      <div className="relative z-10 flex-1 overflow-y-auto px-5 py-5">
        <div className="mb-5 flex items-center gap-3 rounded-3xl bg-white/8 px-4 py-3">
          <OctopusFigure className="h-16 w-16" />
          <p className="text-sm leading-6 text-white/70">
            人围着酒桌坐，章鱼坐中间。接错不加手枪，只记账。散场看谁最丈育。
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
