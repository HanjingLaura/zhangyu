import { currentNeed, rankPlayers, zhangyuKing } from "@/lib/engine";
import type { Game } from "@/lib/types";
import { CardBack, FlippingCard, SuitCard } from "./idiom-card";
import { OctopusFigure } from "./octopus";
import { currentSeatSide, Revolver } from "./revolver";
import { assignSeats, Seat, type SeatSide } from "./seat";
import { RoomHeader } from "./shell";

function lastOctopus(game: Game) {
  return [...game.messages].reverse().find((message) => message.kind === "octopus");
}

function SeatSlot({
  player,
  side,
  game,
  settled,
  kingId,
}: {
  player?: Game["players"][number];
  side: SeatSide;
  game: Game;
  settled: boolean;
  kingId?: string;
}) {
  if (!player) return <div />;
  return (
    <div className="flex items-center justify-center">
      <Seat
        player={player}
        active={!settled && !player.out && game.players[game.turn]?.id === player.id}
        compact={side === "west" || side === "east"}
        settled={settled}
        king={kingId === player.id}
        winner={game.winnerId === player.id}
        maxTentacles={game.maxTentacles}
      />
    </div>
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
  onReseat,
}: {
  game: Game;
  draft: string;
  onDraft: (value: string) => void;
  onSubmit: () => void;
  onHint: () => void;
  onPass: () => void;
  onBack: () => void;
  onAgain: () => void;
  onReseat: () => void;
}) {
  const need = currentNeed(game);
  const current = game.players[game.turn];
  const finished = game.status === "finished";
  const seats = assignSeats(game.players);
  const king = zhangyuKing(game);
  const winner = game.players.find((player) => player.id === game.winnerId);
  const ranked = rankPlayers(game);
  const octopus = lastOctopus(game);
  const previous = game.chain.slice(-3, -1);
  const latest = game.chain.at(-1) ?? "";
  const gunSide = currentSeatSide(game.turn, game.players.length);
  const firing = octopus?.tone === "fail" || octopus?.tone === "egg";
  const aimAtYou = gunSide === "south" && !finished;

  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,#4a2a18_0%,#120b08_64%)]">
      <RoomHeader
        title="丈育酒馆"
        subtitle={game.mode === "char" ? "翻牌接龙 · 字接字" : "翻牌接龙 · 音接音"}
        onBack={onBack}
      />

      <div className="grid min-h-0 flex-1 grid-cols-[4.6rem_minmax(0,1fr)_4.6rem] grid-rows-[auto_minmax(0,1fr)_auto] gap-1 px-2">
        <div />
        <SeatSlot player={seats.north} side="north" game={game} settled={finished} kingId={finished ? king?.id : undefined} />
        <div />
        <SeatSlot player={seats.west} side="west" game={game} settled={finished} kingId={finished ? king?.id : undefined} />

        <div className="relative flex min-h-0 items-center justify-center">
          {octopus ? (
            <div className="absolute top-0 z-30 mx-1 line-clamp-2 max-w-[94%] rounded-2xl bg-[#fff6e4] px-3 py-1.5 text-[11px] leading-5 text-ink shadow-md">
              {octopus.text}
            </div>
          ) : null}

          <div className="wood-table relative mt-8 flex aspect-[1.15/1] w-full max-w-[300px] items-center justify-center rounded-[46%]">
            <OctopusFigure
              priority
              className="absolute left-1/2 top-3 z-[1] h-14 w-14 -translate-x-1/2 object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.45)]"
            />

            {!finished && !aimAtYou ? (
              <Revolver side={gunSide} firing={firing} />
            ) : null}
            {firing ? (
              <div className="muzzle-flash pointer-events-none absolute inset-0 z-20 rounded-[46%] bg-[#ff6a4d]/25" />
            ) : null}

            <div className="relative z-[2] mt-6 flex items-end justify-center gap-2">
              {previous.map((word, index) => (
                <div key={`${word}-${index}`} className="-rotate-6">
                  <FlippingCard word={word} size="sm" />
                </div>
              ))}
              <SuitCard char={need.char} label={finished ? "终局" : "要接"} />
              {latest ? (
                <div className="rotate-6">
                  <FlippingCard word={latest} size="md" />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <SeatSlot player={seats.east} side="east" game={game} settled={finished} kingId={finished ? king?.id : undefined} />
        <div />
        <SeatSlot player={seats.south} side="south" game={game} settled={finished} kingId={finished ? king?.id : undefined} />
        <div />
      </div>

      {finished ? (
        <div className="border-t border-[#c9a44a]/20 bg-black/35 px-4 py-3">
          <div className="text-center">
            <div className="font-display text-xl text-gold">本局结算</div>
            <p className="mt-1 text-xs text-white/60">
              {winner?.name ?? "章鱼"} 活到最后 · {king?.name ?? "无人"} 是丈育王
            </p>
          </div>
          <ol className="mt-3 space-y-1 text-sm text-white/80">
            {[...ranked]
              .sort((a, b) => b.zhangyu - a.zhangyu)
              .map((player, index) => (
                <li key={player.id} className="flex items-center justify-between">
                  <span>
                    {index + 1}. {player.name}
                    {king?.id === player.id ? " · 丈育王" : ""}
                  </span>
                  <span className="text-gold">{player.zhangyu} 丈育</span>
                </li>
              ))}
          </ol>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={onReseat} className="rounded-full bg-white/10 py-3 text-sm text-white">
              换人入座
            </button>
            <button type="button" onClick={onAgain} className="rounded-full bg-coral py-3 text-sm font-semibold text-white">
              再来一局
            </button>
          </div>
        </div>
      ) : (
        <form
          className="border-t border-[#c9a44a]/20 bg-black/40 px-3 pb-3 pt-2"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          {aimAtYou ? (
            <div className="mb-2 flex items-center justify-center gap-3">
              <Revolver side="south" firing={firing} large />
              <p className="text-[11px] leading-5 text-[#e6c98a]">
                左轮对着 {current.name}。
                <br />
                接不上就朝自己开。
              </p>
            </div>
          ) : (
            <p className="mb-2 text-center text-[11px] text-[#e6c98a]/70">
              枪口对着 {current.name} · 上一张「{need.word}」
            </p>
          )}

          <div className="flex items-end gap-3">
            <div className="relative">
              {draft.trim() ? (
                <div className="idiom-card flex h-[6.4rem] w-[4.6rem] flex-col items-center justify-center font-display text-[15px] leading-4">
                  {draft.replace(/\s+/g, "").slice(0, 4).split("").map((char, index) => (
                    <span key={`${char}-${index}`}>{char}</span>
                  ))}
                </div>
              ) : (
                <CardBack size="lg" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <label className="sr-only" htmlFor="idiom-input">
                输入成语
              </label>
              <input
                id="idiom-input"
                value={draft}
                onChange={(event) => onDraft(event.target.value)}
                placeholder={`接「${need.char}」的牌`}
                className="w-full rounded-2xl bg-[#fff6e4]/10 px-4 py-3 text-base text-[#fff6e4] outline-none ring-gold/40 placeholder:text-white/30 focus:ring-2"
                autoComplete="off"
                enterKeyHint="send"
              />
              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-coral py-3 text-sm font-semibold text-white"
              >
                翻牌拍上桌
              </button>
            </div>
          </div>

          {game.lastHint ? (
            <button
              type="button"
              onClick={() => onDraft(game.lastHint ?? "")}
              className="mt-2 w-full rounded-full bg-gold/15 py-2 text-xs text-gold"
            >
              偷看底牌「{game.lastHint}」
            </button>
          ) : null}
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={onHint} className="flex-1 rounded-full bg-white/8 py-2 text-xs text-white/60">
              查了吧
            </button>
            <button type="button" onClick={onPass} className="flex-1 rounded-full bg-white/8 py-2 text-xs text-white/60">
              对着自己开
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
