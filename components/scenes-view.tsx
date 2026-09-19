import { OFFICE_SCENE } from "@/lib/scenes";
import { RoomHeader } from "./shell";

export function ScenesView({
  onBack,
  onPlay,
}: {
  onBack: () => void;
  onPlay: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,#16343c_0%,#0b1f24_58%)] text-white">
      <RoomHeader
        title="群聊的聊天记录"
        subtitle="2026年9月18日"
        onBack={onBack}
      />
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {OFFICE_SCENE.map((line, index) => (
          <article key={`${line.name}-${index}`} className="flex gap-2">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral text-xs text-white">
              {line.name.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-[11px] text-white/40">{line.name}</div>
              <div className="w-fit max-w-[85%] rounded-2xl bg-white/10 px-3 py-2 text-[15px] leading-6 text-white">
                {line.quote ? (
                  <div className="mb-1 border-l-2 border-gold/40 pl-2 text-xs text-white/45">
                    {line.quote}
                  </div>
                ) : null}
                {line.image ? "「看吓着」门牌照片" : line.text}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="border-t border-white/10 px-5 py-4">
        <button
          type="button"
          onClick={onPlay}
          className="w-full rounded-full bg-coral py-3 text-sm font-semibold text-white"
        >
          入座开局
        </button>
      </div>
    </div>
  );
}
