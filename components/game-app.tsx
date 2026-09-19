"use client";

import { useMemo, useState } from "react";
import { idiomIndex } from "@/lib/dictionary";
import { createGame, hint, pass, submit } from "@/lib/engine";
import { DEFAULT_NAMES } from "@/lib/scenes";
import type { Game, GameConfig } from "@/lib/types";
import { HomeView } from "./home-view";
import { PlayView } from "./play-view";
import { RulesView } from "./rules-view";
import { ScenesView } from "./scenes-view";
import { SetupView } from "./setup-view";
import { PhoneShell } from "./shell";

type View = "home" | "setup" | "play" | "rules" | "scenes";

const INITIAL_CONFIG: GameConfig = {
  names: DEFAULT_NAMES,
  mode: "char",
  tentacles: 3,
  opening: "yiming",
};

export function GameApp() {
  const [view, setView] = useState<View>("home");
  const [config, setConfig] = useState<GameConfig>(INITIAL_CONFIG);
  const [game, setGame] = useState<Game | null>(null);
  const [draft, setDraft] = useState("");
  const index = useMemo(() => idiomIndex, []);

  const startGame = () => {
    const names = config.names.map((name) => name.trim()).filter(Boolean);
    const next = createGame(index, {
      ...config,
      names: names.length >= 2 ? names : DEFAULT_NAMES.slice(0, 2),
    });
    setGame(next);
    setDraft("");
    setView("play");
  };

  return (
    <PhoneShell>
      {view === "home" ? (
        <HomeView
          onPlay={() => setView("setup")}
          onRules={() => setView("rules")}
          onScenes={() => setView("scenes")}
        />
      ) : null}
      {view === "setup" ? (
        <SetupView
          config={config}
          onChange={setConfig}
          onBack={() => setView("home")}
          onStart={startGame}
        />
      ) : null}
      {view === "rules" ? (
        <RulesView onBack={() => setView("home")} />
      ) : null}
      {view === "scenes" ? (
        <ScenesView
          onBack={() => setView("home")}
          onPlay={() => setView("setup")}
        />
      ) : null}
      {view === "play" && game ? (
        <PlayView
          game={game}
          draft={draft}
          onDraft={setDraft}
          onSubmit={() => {
            const result = submit(index, game, draft);
            setGame(result.game);
            setDraft("");
          }}
          onHint={() => setGame(hint(index, game))}
          onPass={() => {
            setGame(pass(index, game).game);
            setDraft("");
          }}
          onBack={() => setView("home")}
          onAgain={startGame}
        />
      ) : null}
    </PhoneShell>
  );
}
