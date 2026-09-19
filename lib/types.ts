export type LinkMode = "char" | "pinyin";

export type Player = {
  id: string;
  name: string;
  tentacles: number;
  culture: number;
  zhangyu: number;
  out: boolean;
};

export type ChatTone = "ok" | "fail" | "hint" | "win" | "egg" | "turn";

export type ChatMessage = {
  id: string;
  kind: "player" | "octopus" | "system";
  playerId?: string;
  text: string;
  quote?: string;
  tone?: ChatTone;
};

export type GameConfig = {
  names: string[];
  mode: LinkMode;
  tentacles: number;
  opening: "random" | "yiming" | "longfei";
};

export type Game = {
  mode: LinkMode;
  players: Player[];
  turn: number;
  maxTentacles: number;
  chain: string[];
  used: string[];
  messages: ChatMessage[];
  status: "playing" | "finished";
  winnerId: string | null;
  lastHint: string | null;
  seq: number;
};

export type SubmitResult = {
  game: Game;
  ok: boolean;
  reason:
    | "ok"
    | "empty"
    | "finished"
    | "not-idiom"
    | "used"
    | "unlink"
    | "egg"
    | "dead-end";
};

export type IdiomRow = [word: string, firstPinyin: string, lastPinyin: string];

export type IdiomIndex = {
  byWord: Map<string, { firstPinyin: string; lastPinyin: string }>;
  byFirstChar: Map<string, string[]>;
  byFirstPinyin: Map<string, string[]>;
  byLastCharFanout: Map<string, number>;
};
