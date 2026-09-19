import { useEffect, useRef } from "react";
import { currentNeed, rankPlayers } from "@/lib/engine";
import type { ChatMessage, Game, Player } from "@/lib/types";
import { OctopusMark, TentacleDots } from "./octopus";
import { ChatHeader } from "./shell";

const PLAYER_TINT = ["#ff6a4d", "#1f6b63", "#d39a2a", "#6b4c9a"];

function avatarColor(playerId?: string) {
  const index = Number((playerId ?? "p1").replace("p", "")) - 1;
  return PLAYER_TINT[Math.max(0, index) % PLAYER_TINT.length];
}

function Bubble({
  message,
  players,
}: {
  message: ChatMessage;
  players: Player[];
}) {
  if (message.kind === "system") {
    return (
      <div className="py-1 text-center text-[11px] text-ink/35">
        {message.text}
      </div>
    );
  }

  const player = players.find((item) => item.id === message.playerId);
  const isOctopus = message.kind === "octopus";
  const name = isOctopus ? "章鱼裁判" : (player?.name ?? "匿名丈育");

  return (
    <article className="flex gap-2">
      {isOctopus ? (
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sea">
          <OctopusMark
            mood={message.tone === "win" ? "win" : "judge"}
            className="h-8 w-8"
          />
        </div>
      ) : (
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs text-white"
          style={{ background: avatarColor(message.playerId) }}
        >
          {name.slice(0, 1)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-[11px] text-ink/40">{name}</div>
        <div
          className={`w-fit max-w-[88%] rounded-2xl px-3 py-2 text-[15px] leading-6 ${
            message.tone === "egg" || message.tone === "fail"
              ? "bg-white text-ink"
              : isOctopus
                ? "bg-[#fff4ee] text-ink"
                : "bg-white text-ink"
          }`}
        >
          {message.quote ? (
            <div className="mb-1 border-l-2 border-coral/50 pl-2 text-xs text-ink/45">
              {message.quote}
            </div>
          ) : null}
          {message.text}
        </div>
      </div>
    </article>
  );
}

export function PlayView({
  game,
  draft,
  onDraft,
  onSubmit,
  onHint,
  onPass,
  onBack,
  onAgain,
}: {
  game: Game;
  draft: string;
  onDraft: (value: string) => void;
  onSubmit: () => void;
  onHint: () => void;
  onPass: () => void;
  onBack: () => void;
  onAgain: () => void;
}) {
  const need = currentNeed(game);
  const current = game.players[game.turn];
  const endRef = useRef<HTMLDivElement>(null);
  const finished = game.status === "finished";
  const winner = game.players.find((player) => player.id === game.winnerId);
  const ranked = rankPlayers(game);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [game.messages.length]);

  return (
    <div className="flex h-full flex-col bg-foam">
      <ChatHeader
        title="丈育成语接龙"
        subtitle={game.mode === "char" ? "字接字" : "音接音"}
        onBack={onBack}
      />

      <div className="grid grid-cols-2 gap-2 px-3 pt-3">
        {game.players.map((player, index) => (
          <div
            key={player.id}
            className={`min-w-0 rounded-2xl px-3 py-2 ${
              !player.out && index === game.turn && !finished
                ? "bg-sea text-white"
                : "bg-white text-ink"
            }`}
          >
            <div className="flex items-center justify-between gap-2 text-sm">
              <span
                className={`min-w-0 truncate ${player.out ? "line-through opacity-50" : ""}`}
              >
                {player.name}
              </span>
              <span className="shrink-0">
                <TentacleDots
                  current={player.tentacles}
                  max={game.maxTentacles}
                  light={!player.out && index === game.turn && !finished}
                />
              </span>
            </div>
            <div
              className={`mt-1 text-[10px] ${
                !player.out && index === game.turn && !finished
                  ? "text-white/60"
                  : "text-ink/40"
              }`}
            >
              文化 {player.culture} · 丈育 {player.zhangyu}
            </div>
          </div>
        ))}
      </div>

      <div className="mx-3 mt-3 rounded-2xl bg-sea px-4 py-3 text-white">
        <div className="text-[11px] tracking-widest text-white/50">接到</div>
        <div className="mt-1 flex items-end justify-between">
          <div className="font-display text-4xl">{need.char}</div>
          <div className="text-right text-xs text-white/60">
            上一句 {need.word}
            <div className="mt-1">
              {finished ? "终局" : `轮到 ${current.name}`}
            </div>
          </div>
        </div>
      </div>

      <div className="chat-scroll mt-3 flex-1 space-y-3 overflow-y-auto px-3 pb-3">
        {game.messages.map((message) => (
          <Bubble key={message.id} message={message} players={game.players} />
        ))}
        <div ref={endRef} />
      </div>

      {finished ? (
        <div className="border-t border-ink/8 bg-white px-5 py-4">
          <div className="mb-3 flex items-center gap-3">
            <OctopusMark mood="win" className="h-14 w-14" />
            <div>
              <div className="font-display text-xl">
                {winner?.name ?? "章鱼"} 赢了
              </div>
              <div className="text-xs text-ink/45">
                文化榜第一可以在群里装一下
              </div>
            </div>
          </div>
          <ol className="mb-4 space-y-1 text-sm">
            {ranked.map((player, index) => (
              <li key={player.id} className="flex justify-between">
                <span>
                  {index + 1}. {player.name}
                </span>
                <span className="text-ink/45">
                  文化 {player.culture} / 丈育 {player.zhangyu}
                </span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={onAgain}
            className="w-full rounded-full bg-coral py-3 font-semibold text-white"
          >
            再来一局
          </button>
        </div>
      ) : (
        <form
          className="border-t border-ink/8 bg-white px-3 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label className="sr-only" htmlFor="idiom-input">
            输入成语
          </label>
          <div className="flex gap-2">
            <input
              id="idiom-input"
              value={draft}
              onChange={(event) => onDraft(event.target.value)}
              placeholder={`接「${need.char}」……`}
              className="min-w-0 flex-1 rounded-full bg-foam px-4 py-3 text-base outline-none ring-coral/30 focus:ring-2"
              autoComplete="off"
              enterKeyHint="send"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white"
            >
              接
            </button>
          </div>
          {game.lastHint ? (
            <button
              type="button"
              onClick={() => onDraft(game.lastHint ?? "")}
              className="mt-2 w-full rounded-full bg-[#fff4ee] py-2 text-xs text-coral"
            >
              用提示「{game.lastHint}」
            </button>
          ) : null}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={onHint}
              className="flex-1 rounded-full bg-foam py-2 text-xs text-ink/60"
            >
              查了吧
            </button>
            <button
              type="button"
              onClick={onPass}
              className="flex-1 rounded-full bg-foam py-2 text-xs text-ink/60"
            >
              接不上
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
