import { OFFICE_SCENE } from "@/lib/scenes";
import { Avatar } from "./avatar";
import { TopBar } from "./shell";

export function ScenesView({
  onBack,
  onPlay,
}: {
  onBack: () => void;
  onPlay: () => void;
}) {
  return (
    <div className="screen">
      <TopBar title="聊天记录" right={<span>2026-09-18</span>} onBack={onBack} />
      <div className="relative z-10 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {OFFICE_SCENE.map((line, index) => (
          <article key={`${line.name}-${index}`} className="flex gap-2.5">
            <Avatar name={line.name} size={34} />
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-[11px] text-foam/40">{line.name}</div>
              <div className="w-fit max-w-[88%] rounded-2xl rounded-tl-md bg-white/8 px-3 py-2 text-[15px] leading-6">
                {line.quote ? (
                  <div className="mb-1 border-l-2 border-gold/40 pl-2 text-xs text-foam/45">
                    {line.quote}
                  </div>
                ) : null}
                {line.image ? "[图片] 看吓着" : line.text}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="drawer">
        <button type="button" onClick={onPlay} className="btn btn-primary w-full">
          创建房间
        </button>
      </div>
    </div>
  );
}
