import { bailianChat, bailianEnabled, clipText, parseJsonObject } from "./bailian";
import type { ChatMessage, Game, GameTitles, SubmitResult } from "./types";

export type TitleNotes = NonNullable<GameTitles["notes"]>;

const ROAST_SYSTEM = `你是自己家里的章鱼哥，裁判成语接龙。
说话像群里随口一句：短、损、口语，有点嫌弃。
禁止卖萌、禁止解释、禁止自称 AI、禁止感叹号堆砌。
只输出 JSON：{"roast":"最多16个字"}`;

const SETTLE_SYSTEM = `你是自己家里的章鱼哥，散场打分。
只评两个人：最丈育、最有文化。
最丈育：胡话、假成语、接不上、老看提示。
最有文化：正经接上、成语像样。
说话短、损、口语。禁止卖萌，禁止自称 AI。
只输出 JSON：{"roast":"最多22个字","zhangyu":"玩家名","culture":"玩家名","notes":{"zhangyu":"最多10字","culture":"最多10字"}}`;

export type RoastContext = {
  action: "submit" | "hint" | "pass" | "finish";
  reason?: SubmitResult["reason"] | "hint";
  player: string;
  word: string;
  need: string;
  prev: string;
  chain: string[];
  fallback: string;
  scores: { name: string; culture: number; zhangyu: number; fun: number; fails: number }[];
  titles?: { zhangyu: string; culture: string };
};

function lastOf(game: Game, kind: ChatMessage["kind"]) {
  return [...game.messages].reverse().find((message) => message.kind === kind);
}

function replaceLastOctopus(game: Game, text: string): Game {
  const index = game.messages.map((message) => message.kind).lastIndexOf("octopus");
  if (index < 0) return game;
  const messages = game.messages.slice();
  messages[index] = { ...messages[index], text };
  return { ...game, messages };
}

function readNote(value: unknown) {
  return typeof value === "string" && value.trim() ? clipText(value, 10) : "";
}

export function parseRoast(raw: string | null, fallback: string) {
  const data = raw ? parseJsonObject(raw) : null;
  return {
    roast:
      typeof data?.roast === "string" && data.roast.trim()
        ? clipText(data.roast, 16)
        : fallback,
  };
}

export function parseSettle(raw: string | null, fallback: string) {
  const data = raw ? parseJsonObject(raw) : null;
  const notesRaw =
    data?.notes && typeof data.notes === "object" ? (data.notes as Record<string, unknown>) : {};
  return {
    roast:
      typeof data?.roast === "string" && data.roast.trim()
        ? clipText(data.roast, 22)
        : fallback,
    zhangyu: typeof data?.zhangyu === "string" ? data.zhangyu.trim() : "",
    culture: typeof data?.culture === "string" ? data.culture.trim() : "",
    notes: {
      zhangyu: readNote(notesRaw.zhangyu),
      culture: readNote(notesRaw.culture),
    } satisfies TitleNotes,
  };
}

function reasonLabel(reason?: RoastContext["reason"]) {
  switch (reason) {
    case "ok":
      return "接上了";
    case "egg":
      return "群里的假成语，也算一轮";
    case "not-idiom":
      return "不是成语，四个字也算";
    case "not-four":
      return "不是四个字";
    case "unlink":
      return "没接上";
    case "used":
      return "用过了";
    case "empty":
      return "空的或跳过";
    case "late":
      return "慢了";
    case "dead-end":
      return "这个字没词了";
    case "hint":
      return "看了提示";
    case "finished":
      return "散场";
    default:
      return "过了一手";
  }
}

export async function octopusRoast(context: RoastContext) {
  if (!bailianEnabled()) {
    return { roast: context.fallback };
  }
  const content = await bailianChat(
    [
      { role: "system", content: ROAST_SYSTEM },
      {
        role: "user",
        content: [
          `${context.player} 说了「${context.word || "（没写）"}」`,
          `要接「${context.need}」，上一句「${context.prev}」`,
          `结果：${reasonLabel(context.reason)}`,
          `桌上：${context.chain.slice(-6).join(" → ")}`,
        ].join("\n"),
      },
    ],
    { maxTokens: 60, temperature: 0.8 },
  );
  return parseRoast(content, context.fallback);
}

export async function octopusSettle(context: RoastContext) {
  if (!bailianEnabled()) {
    return {
      roast: context.fallback,
      zhangyu: context.titles?.zhangyu ?? "",
      culture: context.titles?.culture ?? "",
      notes: { zhangyu: "", culture: "" },
    };
  }
  const content = await bailianChat(
    [
      { role: "system", content: SETTLE_SYSTEM },
      {
        role: "user",
        content: [
          `接龙：${context.chain.join(" → ") || "还没接"}`,
          `共 ${context.chain.length ? context.chain.length - 1 : 0} 轮`,
          "玩家：",
          ...context.scores.map(
            (player) =>
              `${player.name} 文化${player.culture} 丈育${player.zhangyu} 失误${player.fails}`,
          ),
        ].join("\n"),
      },
    ],
    { maxTokens: 140, temperature: 0.5 },
  );
  return parseSettle(content, context.fallback);
}

export function gameContext(
  game: Game,
  action: RoastContext["action"],
  word: string,
  reason?: RoastContext["reason"],
): RoastContext {
  const spoken = lastOf(game, "player");
  const player = spoken?.playerId
    ? game.players.find((item) => item.id === spoken.playerId)?.name
    : game.players[game.turn]?.name;
  const titles = game.titles;
  const linked =
    (reason === "ok" || reason === "not-idiom" || reason === "egg") && game.chain.length >= 2;
  const prev = (linked ? game.chain[game.chain.length - 2] : game.chain[game.chain.length - 1]) ?? "";
  return {
    action,
    reason,
    player: player ?? "有人",
    word,
    need: prev.slice(-1),
    prev,
    chain: game.chain,
    fallback: lastOf(game, "octopus")?.text ?? "",
    scores: game.players.map((item) => ({
      name: item.name,
      culture: item.culture,
      zhangyu: item.zhangyu,
      fun: item.fun,
      fails: item.fails,
    })),
    titles: titles
      ? {
          zhangyu: titles.zhangyu.name,
          culture: titles.culture.name,
        }
      : undefined,
  };
}

export async function narrateGame(
  game: Game,
  action: RoastContext["action"],
  word: string,
  reason?: RoastContext["reason"],
): Promise<Game> {
  const context = gameContext(game, action, word, reason);
  if (action === "finish" || game.status === "finished") {
    const settled = await octopusSettle(context);
    let next = replaceLastOctopus(game, settled.roast);
    if (next.titles) {
      next = {
        ...next,
        titles: {
          ...next.titles,
          notes: settled.notes,
        },
      };
    }
    return next;
  }
  const roasted = await octopusRoast(context);
  return replaceLastOctopus(game, roasted.roast);
}
