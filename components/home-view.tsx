import { OctopusFigure } from "./octopus";

export function HomeView({
  onPlay,
  onRules,
  onScenes,
}: {
  onPlay: () => void;
  onRules: () => void;
  onScenes: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,#1b4b52_0%,#0b1f24_58%)] px-6 pb-8 pt-8 text-white">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="felt-table relative flex h-44 w-44 items-center justify-center rounded-full">
          <OctopusFigure
            priority
            className="relative z-[1] h-28 w-28 object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
          />
        </div>
        <p className="mt-6 text-xs tracking-[0.35em] text-gold/90">
          章鱼 · 丈育 · 围桌接龙
        </p>
        <h1 className="font-display mt-2 text-4xl tracking-widest">
          丈育成语接龙
        </h1>
        <p className="mt-3 max-w-[17rem] text-sm leading-6 text-white/65">
          两到四人围着桌子接。中间是章鱼裁判，接不上掉触手，散场算丈育值。
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onPlay}
          className="rounded-full bg-coral py-3.5 text-base font-semibold text-white shadow-lg shadow-coral/25"
        >
          入座开局
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onRules}
            className="rounded-full bg-white/10 py-3 text-sm text-white"
          >
            怎么玩
          </button>
          <button
            type="button"
            onClick={onScenes}
            className="rounded-full bg-white/10 py-3 text-sm text-white"
          >
            群聊名场面
          </button>
        </div>
      </div>
    </div>
  );
}
