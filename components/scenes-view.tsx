import { OFFICE_SCENE } from "@/lib/scenes";
import { ChatHeader } from "./shell";

export function ScenesView({
  onBack,
  onPlay,
}: {
  onBack: () => void;
  onPlay: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-foam">
      <ChatHeader
        title="群聊的聊天记录"
        subtitle="2026年9月18日"
        onBack={onBack}
      />
      <div className="chat-scroll flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {OFFICE_SCENE.map((line, index) => (
          <article key={`${line.name}-${index}`} className="flex gap-2">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sea text-xs text-white">
              {line.name.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-[11px] text-ink/40">{line.name}</div>
              <div className="w-fit max-w-[85%] rounded-2xl bg-white px-3 py-2 text-[15px] leading-6 text-ink">
                {line.quote ? (
                  <div className="mb-1 border-l-2 border-ink/15 pl-2 text-xs text-ink/45">
                    {line.quote}
                  </div>
                ) : null}
                {line.image ? "「看吓着」门牌照片" : line.text}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="border-t border-ink/8 bg-white px-5 py-4">
        <button
          type="button"
          onClick={onPlay}
          className="w-full rounded-full bg-coral py-3 text-sm font-semibold text-white"
        >
          现在正经玩一局
        </button>
      </div>
    </div>
  );
}
