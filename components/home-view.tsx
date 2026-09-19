import { OctopusMark } from "./octopus";

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
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,#1b4b52_0%,#12343b_55%)] px-6 pb-8 pt-10 text-white">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="relative">
          <div className="absolute inset-x-6 -bottom-2 h-8 rounded-full bg-black/20 blur-md" />
          <OctopusMark mood="laugh" className="relative h-36 w-36" />
        </div>
        <p className="mt-6 text-xs tracking-[0.35em] text-gold/90">
          章鱼 · 丈育 · 谐音成立
        </p>
        <h1 className="font-display mt-2 text-4xl tracking-widest">
          丈育成语接龙
        </h1>
        <p className="mt-3 max-w-[16rem] text-sm leading-6 text-white/70">
          上班群里接不上的，拿到这儿来接。接错掉触手，查词记丈育值。
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onPlay}
          className="rounded-full bg-coral py-3.5 text-base font-semibold text-white shadow-lg shadow-coral/25"
        >
          开一局
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
        <p className="text-center text-[11px] text-white/40">
          有点文化行吗 · 接不上就输吧
        </p>
      </div>
    </div>
  );
}
