export type LinkMode = "char" | "pinyin";

export type Player = {
  id: string;
  name: string;
  avatarUrl?: string;
  outfit?: string;
  tentacles: number;
  culture: number;
  zhangyu: number;
  fun: number;
  fails: number;
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

export type SeatPlayer = {
  id: string;
  name: string;
  avatarUrl?: string;
  outfit?: string;
};

export type GameConfig = {
  names: string[];
  seatPlayers?: SeatPlayer[];
  mode: LinkMode;
  tentacles: number;
  opening: "random" | "yiming" | "longfei";
  maxRounds: number;
  buzz?: boolean;
};

export type UserPublic = {
  id: string;
  name: string;
  avatarUrl?: string;
  shells: number;
  owned: string[];
  outfit: string;
};

export type RoomMember = {
  id: string;
  name: string;
  avatarUrl?: string;
  outfit?: string;
};

export type Danmaku = {
  id: string;
  userId: string;
  name: string;
  text: string;
  at: number;
};

export type GameTitles = {
  fun: Player;
  uncultured: Player;
  zhangyu: Player;
  culture: Player;
  notes?: {
    zhangyu?: string;
    culture?: string;
  };
};

export type RoomSnapshot = {
  code: string;
  hostId: string;
  members: RoomMember[];
  status: "lobby" | "playing" | "finished";
  mode: LinkMode;
  tentacles: number;
  opening: GameConfig["opening"];
  maxRounds: number;
  buzz?: boolean;
  game: Game | null;
  danmaku: Danmaku[];
};

export type Game = {
  mode: LinkMode;
  players: Player[];
  turn: number;
  maxTentacles: number;
  maxRounds: number;
  buzz?: boolean;
  rounds: number;
  chain: string[];
  used: string[];
  messages: ChatMessage[];
  status: "playing" | "finished";
  winnerId: string | null;
  lastHint: string | null;
  titles: GameTitles | null;
  seq: number;
  payouts?: Record<string, number>;
};

export type SubmitResult = {
  game: Game;
  ok: boolean;
  reason:
    | "ok"
    | "empty"
    | "finished"
    | "not-idiom"
    | "not-four"
    | "used"
    | "unlink"
    | "egg"
    | "late"
    | "dead-end";
};

export type IdiomRow = [word: string, firstPinyin: string, lastPinyin: string];

export type IdiomIndex = {
  byWord: Map<string, { firstPinyin: string; lastPinyin: string }>;
  byFirstChar: Map<string, string[]>;
  byFirstPinyin: Map<string, string[]>;
  byLastCharFanout: Map<string, number>;
};
