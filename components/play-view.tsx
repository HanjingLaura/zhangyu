import { currentNeed, rankPlayers, zhangyuKing } from "@/lib/engine";
import type { Game, Player } from "@/lib/types";
import { OctopusFigure } from "./octopus";
import { assignSeats, Seat, type SeatSide } from "./seat";
import { RoomHeader } from "./shell";

function lastOctopusLine(game: Game) {
  return [...game.messages]
    .reverse()
    .find((message) => message.kind === "octopus")?.text;
}

function SeatSlot({
  player,
  side,
  game,
  settled,
  kingId,
}: {
  player?: Player;
  side: SeatSide;
  game: Game;
  settled: boolean;
  kingId?: string;
}) {
  if (!player) return <div />;
  const compact = side === "west" || side === "east";
  return (
    <div className="flex items-center justify-center">
      <Seat
        player={player}
        active={!settled && !player.out && game.players[game.turn]?.id === player.id}
        compact={compact}
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
  const line = lastOctopusLine(game);
  const recent = game.chain.slice(-3);

  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,#16343c_0%,#0b1f24_58%)]">
      <RoomHeader
        title="丈育成语接龙"
        subtitle={game.mode === "char" ? "字接字 · 围桌" : "音接音 · 围桌"}
        onBack={onBack}
      />

      <div className="grid min-h-0 flex-1 grid-cols-[4.7rem_minmax(0,1fr)_4.7rem] grid-rows-[auto_minmax(0,1fr)_auto] gap-1 px-2 pb-2">
        <div />
        <SeatSlot
          player={seats.north}
          side="north"
          game={game}
          settled={finished}
          kingId={finished ? king?.id : undefined}
        />
        <div />

        <SeatSlot
          player={seats.west}
          side="west"
          game={game}
          settled={finished}
          kingId={finished ? king?.id : undefined}
        />

        <div className="relative flex min-h-0 items-center justify-center">
          {line ? (
            <div className="absolute top-0 z-20 mx-1 line-clamp-2 max-w-[92%] rounded-2xl bg-[#fff6e4] px-3 py-1.5 text-[11px] leading-5 text-ink shadow-md">
              {line}
            </div>
          ) : null}
          <div className="felt-table relative mt-8 flex aspect-square w-full max-w-[250px] flex-col items-center justify-center rounded-full px-5 text-center">
            <OctopusFigure
              priority
              className="relative z-[1] h-[6.8rem] w-[6.8rem] object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.35)]"
            />

            <div className="relative z-[1] mt-1 font-display text-5xl leading-none text-[#f8e7b0]">
              {need.char}
            </div>
            <div className="relative z-[1] mt-1 text-[10px] tracking-[0.2em] text-gold/70">
              {finished ? "本局结束" : "接到这个字"}
            </div>

            <div className="relative z-[1] mt-2 flex flex-wrap justify-center gap-1">
              {recent.map((word) => (
                <span
                  key={word}
                  className="rounded-md border border-[#c9a44a]/40 bg-[#f3e2b3] px-1.5 py-0.5 text-[10px] text-[#4a3012]"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>

        <SeatSlot
          player={seats.east}
          side="east"
          game={game}
          settled={finished}
          kingId={finished ? king?.id : undefined}
        />

        <div />
        <SeatSlot
          player={seats.south}
          side="south"
          game={game}
          settled={finished}
          kingId={finished ? king?.id : undefined}
        />
        <div />
      </div>

      {finished ? (
        <div className="border-t border-white/10 bg-black/30 px-4 py-3">
          <div className="text-center">
            <div className="font-display text-xl text-gold">本局结算</div>
            <p className="mt-1 text-xs text-white/60">
              {winner?.name ?? "章鱼"} 活到最后 · {king?.name ?? "无人"} 是丈育王
            </p>
          </div>
          <ol className="mt-3 space-y-1 text-sm text-white/80">
            {[...ranked].sort((a, b) => b.zhangyu - a.zhangyu).map((player, index) => (
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
            <button
              type="button"
              onClick={onReseat}
              className="rounded-full bg-white/10 py-3 text-sm text-white"
            >
              换人入座
            </button>
            <button
              type="button"
              onClick={onAgain}
              className="rounded-full bg-coral py-3 text-sm font-semibold text-white"
            >
              再来一局
            </button>
          </div>
        </div>
      ) : (
        <form
          className="border-t border-white/10 bg-black/25 px-3 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div className="mb-2 text-center text-[11px] text-white/45">
            轮到 {current.name} · 上一句 {need.word}
          </div>
          <label className="sr-only" htmlFor="idiom-input">
            输入成语
          </label>
          <div className="flex gap-2">
            <input
              id="idiom-input"
              value={draft}
              onChange={(event) => onDraft(event.target.value)}
              placeholder={`接「${need.char}」……`}
              className="min-w-0 flex-1 rounded-full bg-white/10 px-4 py-3 text-base text-white outline-none ring-gold/40 placeholder:text-white/35 focus:ring-2"
              autoComplete="off"
              enterKeyHint="send"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white"
            >
              接上
            </button>
          </div>
          {game.lastHint ? (
            <button
              type="button"
              onClick={() => onDraft(game.lastHint ?? "")}
              className="mt-2 w-full rounded-full bg-gold/15 py-2 text-xs text-gold"
            >
              用提示「{game.lastHint}」
            </button>
          ) : null}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={onHint}
              className="flex-1 rounded-full bg-white/8 py-2 text-xs text-white/60"
            >
              查了吧
            </button>
            <button
              type="button"
              onClick={onPass}
              className="flex-1 rounded-full bg-white/8 py-2 text-xs text-white/60"
            >
              接不上
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
