import { RoomHeader } from "./shell";
import type { GameConfig, LinkMode } from "@/lib/types";

const OPENINGS = [
  { id: "yiming", label: "一鸣惊人" },
  { id: "longfei", label: "龙飞凤舞" },
  { id: "random", label: "随机开局" },
] as const;

export function SetupView({
  config,
  onChange,
  onBack,
  onStart,
}: {
  config: GameConfig;
  onChange: (next: GameConfig) => void;
  onBack: () => void;
  onStart: () => void;
}) {
  const updateName = (index: number, name: string) => {
    const names = [...config.names];
    names[index] = name;
    onChange({ ...config, names });
  };

  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,#16343c_0%,#0b1f24_58%)] text-white">
      <RoomHeader title="入座" subtitle="几个人就围几边" onBack={onBack} />
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
        <section>
          <div className="mb-2 flex items-center justify-between text-sm text-white/50">
            <span>谁坐这桌</span>
            <span>{config.names.length} 人</span>
          </div>
          <div className="space-y-2">
            {config.names.map((name, index) => (
              <input
                key={index}
                value={name}
                onChange={(event) => updateName(index, event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-base text-white outline-none ring-gold/30 focus:ring-2"
                maxLength={12}
                aria-label={`玩家 ${index + 1}`}
              />
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={config.names.length >= 4}
              onClick={() =>
                onChange({
                  ...config,
                  names: [...config.names, `玩家${config.names.length + 1}`],
                })
              }
              className="rounded-full bg-white/10 px-4 py-2 text-sm disabled:opacity-40"
            >
              加人
            </button>
            <button
              type="button"
              disabled={config.names.length <= 2}
              onClick={() =>
                onChange({ ...config, names: config.names.slice(0, -1) })
              }
              className="rounded-full bg-white/10 px-4 py-2 text-sm disabled:opacity-40"
            >
              减人
            </button>
          </div>
        </section>

        <section>
          <div className="mb-2 text-sm text-white/50">接法</div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["char", "字接字", "最后一个字对上"],
                ["pinyin", "音接音", "读音对上就行"],
              ] as const
            ).map(([mode, title, desc]) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange({ ...config, mode: mode as LinkMode })}
                className={`rounded-2xl px-3 py-3 text-left ${
                  config.mode === mode
                    ? "bg-gold text-[#2a1c08]"
                    : "bg-white/8 text-white"
                }`}
              >
                <div className="text-sm font-medium">{title}</div>
                <div
                  className={`mt-1 text-[11px] ${
                    config.mode === mode ? "text-[#2a1c08]/70" : "text-white/40"
                  }`}
                >
                  {desc}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 text-sm text-white/50">每人几条触手</div>
          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange({ ...config, tentacles: n })}
                className={`flex-1 rounded-full py-2 text-sm ${
                  config.tentacles === n
                    ? "bg-gold text-[#2a1c08]"
                    : "bg-white/8 text-white/70"
                }`}
              >
                {n} 条
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 text-sm text-white/50">桌上第一句</div>
          <div className="flex flex-wrap gap-2">
            {OPENINGS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange({ ...config, opening: item.id })}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  config.opening === item.id
                    ? "bg-coral text-white"
                    : "bg-white/8 text-white/70"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>
      </div>
      <div className="border-t border-white/10 px-5 py-4">
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-full bg-coral py-3.5 text-base font-semibold text-white"
        >
          入座开局
        </button>
      </div>
    </div>
  );
}
