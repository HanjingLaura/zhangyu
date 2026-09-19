import { ChatHeader } from "./shell";
import type { GameConfig, LinkMode } from "@/lib/types";

const OPENINGS = [
  { id: "yiming", label: "一鸣惊人" },
  { id: "longfei", label: "龙飞凤舞" },
  { id: "random", label: "随机正经开局" },
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
    <div className="flex h-full flex-col bg-foam">
      <ChatHeader title="组一桌" subtitle="两到四个人轮流接" onBack={onBack} />
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
        <section>
          <div className="mb-2 flex items-center justify-between text-sm text-ink/60">
            <span>谁来挨骂</span>
            <span>{config.names.length} 人</span>
          </div>
          <div className="space-y-2">
            {config.names.map((name, index) => (
              <input
                key={index}
                value={name}
                onChange={(event) => updateName(index, event.target.value)}
                className="w-full rounded-2xl border border-ink/8 bg-white px-4 py-3 text-base outline-none ring-coral/30 focus:ring-2"
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
              className="rounded-full bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
              加人
            </button>
            <button
              type="button"
              disabled={config.names.length <= 2}
              onClick={() =>
                onChange({ ...config, names: config.names.slice(0, -1) })
              }
              className="rounded-full bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
              减人
            </button>
          </div>
        </section>

        <section>
          <div className="mb-2 text-sm text-ink/60">接法</div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["char", "字接字", "最后一个字对上"],
                ["pinyin", "音接音", "读音对上就行，更丈育"],
              ] as const
            ).map(([mode, title, desc]) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange({ ...config, mode: mode as LinkMode })}
                className={`rounded-2xl px-3 py-3 text-left ${
                  config.mode === mode
                    ? "bg-sea text-white"
                    : "bg-white text-ink"
                }`}
              >
                <div className="text-sm font-medium">{title}</div>
                <div
                  className={`mt-1 text-[11px] ${
                    config.mode === mode ? "text-white/70" : "text-ink/45"
                  }`}
                >
                  {desc}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 text-sm text-ink/60">开局成语</div>
          <div className="flex flex-wrap gap-2">
            {OPENINGS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange({ ...config, opening: item.id })}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  config.opening === item.id
                    ? "bg-coral text-white"
                    : "bg-white text-ink/70"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>
      </div>
      <div className="border-t border-ink/8 bg-white px-5 py-4">
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-full bg-coral py-3.5 text-base font-semibold text-white"
        >
          开始挨骂
        </button>
      </div>
    </div>
  );
}
