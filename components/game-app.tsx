"use client";

import { useEffect, useMemo, useState } from "react";
import {
  apiCreateRoom,
  apiDanmaku,
  apiJoinRoom,
  apiLeaveRoom,
  apiLogout,
  apiMe,
  apiMove,
  apiRoom,
  apiStartRoom,
  apiShop,
  apiUpdateName,
  apiUploadAvatar,
} from "@/lib/client";
import { backdropKind, warmAssets, warmUrls } from "@/lib/assets";
import { syncFinishedGame } from "@/lib/local-user";
import type { RoomSnapshot, UserPublic } from "@/lib/types";
import { AuthView } from "./auth-view";
import { CreateView } from "./create-view";
import { HomeView } from "./home-view";
import { JoinView } from "./join-view";
import { LobbyView } from "./lobby-view";
import { PlayView } from "./play-view";
import { RulesView } from "./rules-view";
import { HistoryView } from "./history-view";
import { SettingsView } from "./settings-view";
import { ShopView } from "./shop-view";
import { AssetWarm } from "./asset-warm";
import { BgmProvider } from "./bgm";
import { Keep } from "./keep";
import { SceneBackdrop } from "./scene-backdrop";
import { GameCabinet } from "./shell";

type View = "boot" | "auth" | "home" | "create" | "join" | "lobby" | "play" | "rules" | "scenes" | "shop" | "settings";

export function GameApp() {
  const [view, setView] = useState<View>("boot");
  const [user, setUser] = useState<UserPublic | null>(null);
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancel = false;
    Promise.all([
      apiMe().catch(() => null),
      Promise.race([
        warmAssets(),
        new Promise<void>((resolve) => {
          window.setTimeout(resolve, 2500);
        }),
      ]),
    ]).then(([next]) => {
      if (cancel) return;
      setUser(next);
      setView(next ? "home" : "auth");
    });
    return () => {
      cancel = true;
    };
  }, []);

  const faceUrls = useMemo(() => {
    const urls: string[] = [];
    if (user?.avatarUrl) urls.push(user.avatarUrl);
    for (const member of room?.members ?? []) {
      if (member.avatarUrl) urls.push(member.avatarUrl);
    }
    for (const player of room?.game?.players ?? []) {
      if (player.avatarUrl) urls.push(player.avatarUrl);
    }
    return urls;
  }, [user, room]);

  const adopt = (next: RoomSnapshot, you?: UserPublic | null) => {
    setRoom(next);
    const rewarded = syncFinishedGame(next);
    if (rewarded) setUser(rewarded);
    else if (you) setUser(you);
  };

  const roomCode = room?.code;
  useEffect(() => {
    if (!roomCode || (view !== "lobby" && view !== "play")) return;
    const timer = window.setInterval(() => {
      apiRoom(roomCode)
        .then((data) => {
          adopt(data.room, data.you);
          if (data.room.status === "playing" || data.room.status === "finished") {
            setView("play");
          }
        })
        .catch(() => undefined);
    }, 1200);
    return () => window.clearInterval(timer);
  }, [roomCode, view]);

  const enterRoom = async (next: RoomSnapshot) => {
    const faces = [
      ...next.members.map((member) => member.avatarUrl),
      ...(next.game?.players.map((player) => player.avatarUrl) ?? []),
    ].filter((url): url is string => Boolean(url));
    await Promise.race([
      warmUrls(faces),
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, 350);
      }),
    ]);
    adopt(next);
    setError("");
    setDraft("");
    setView(next.status === "lobby" ? "lobby" : "play");
  };

  const loggedIn = view !== "boot" && Boolean(user);
  const playing = Boolean(room?.game && room.game.status !== "finished");

  return (
    <BgmProvider>
      <GameCabinet>
      <SceneBackdrop kind={backdropKind(view, playing)} />
      <AssetWarm extra={faceUrls} />
      {view === "boot" ? (
        <div className="screen relative z-10 items-center justify-center text-foam/50">加载中</div>
      ) : null}
      {view === "auth" ? (
        <div className="relative z-10 h-full">
          <AuthView onReady={(next) => { setUser(next); setView("home"); }} />
        </div>
      ) : null}
      {loggedIn && user ? (
        <Keep show={view === "home"}>
          <HomeView
            onCreate={() => {
              setError("");
              setView("create");
            }}
            onJoin={() => setView("join")}
            onRules={() => setView("rules")}
            onScenes={() => setView("scenes")}
            onShop={() => setView("shop")}
            onSettings={() => {
              setError("");
              setView("settings");
            }}
          />
        </Keep>
      ) : null}
      {loggedIn ? (
        <Keep show={view === "create"}>
        <CreateView
          error={error}
          onBack={() => {
            setError("");
            setView("home");
          }}
          onCreate={async (options) => {
            try {
              setError("");
              await enterRoom(await apiCreateRoom(options));
            } catch (err) {
              setError(err instanceof Error ? err.message : "创建失败");
            }
          }}
        />
        </Keep>
      ) : null}
      {loggedIn ? (
        <Keep show={view === "join"}>
        <JoinView
          onBack={() => setView("home")}
          onJoin={async (code) => enterRoom(await apiJoinRoom(code))}
        />
        </Keep>
      ) : null}
      {room && user ? (
        <Keep show={view === "lobby"}>
        <LobbyView
          room={room}
          you={user}
          error={error}
          onBack={async () => {
            await apiLeaveRoom(room.code);
            setRoom(null);
            setView("home");
          }}
          onStart={async () => {
            try {
              setError("");
              await enterRoom(await apiStartRoom(room.code));
            } catch (err) {
              setError(err instanceof Error ? err.message : "开始失败");
            }
          }}
        />
        </Keep>
      ) : null}
      {room && room.game ? (
        <Keep show={view === "play"}>
        <PlayView
          room={room}
          you={user}
          draft={draft}
          error={error}
          onDraft={setDraft}
          onSubmit={async () => {
            try {
              setError("");
              const next = await apiMove(room.code, "submit", draft, room.game?.chain.at(-1));
              adopt(next.room, next.you);
              setDraft("");
            } catch (err) {
              setError(err instanceof Error ? err.message : "发送失败");
            }
          }}
          onHint={async () => {
            try {
              const next = await apiMove(room.code, "hint");
              adopt(next.room, next.you);
            } catch (err) {
              setError(err instanceof Error ? err.message : "提示失败");
            }
          }}
          onPass={async () => {
            try {
              const next = await apiMove(room.code, "pass");
              adopt(next.room, next.you);
            } catch (err) {
              setError(err instanceof Error ? err.message : "跳过失败");
            }
          }}
          onDanmaku={async (text) => {
            setRoom(await apiDanmaku(room.code, text));
          }}
          onBack={() => {
            setView(room.status === "lobby" ? "lobby" : "home");
          }}
          onAgain={async () => {
            try {
              adopt(await apiStartRoom(room.code));
              setDraft("");
            } catch (err) {
              setError(err instanceof Error ? err.message : "开始失败");
            }
          }}
          onReseat={() => setView("lobby")}
          onFinish={async () => {
            try {
              const next = await apiMove(room.code, "finish");
              adopt(next.room, next.you);
            } catch (err) {
              setError(err instanceof Error ? err.message : "结束失败");
            }
          }}
        />
        </Keep>
      ) : null}
      {loggedIn && user ? (
        <Keep show={view === "settings"}>
        <SettingsView
          user={user}
          error={error}
          onBack={() => {
            setError("");
            setView("home");
          }}
          onAvatar={async (image) => {
            setError("");
            setUser(await apiUploadAvatar(image));
          }}
          onSaveName={async (name) => {
            try {
              setError("");
              setUser(await apiUpdateName(name));
            } catch (err) {
              setError(err instanceof Error ? err.message : "保存失败");
            }
          }}
          onLogout={async () => {
            await apiLogout();
            setUser(null);
            setRoom(null);
            setView("auth");
          }}
        />
        </Keep>
      ) : null}
      {loggedIn && user ? (
        <Keep show={view === "shop"}>
        <ShopView
          user={user}
          error={error}
          onBack={() => {
            setError("");
            setView("home");
          }}
          onBuy={async (id) => {
            try {
              setError("");
              setUser(await apiShop("buy", id));
            } catch (err) {
              setError(err instanceof Error ? err.message : "兑换失败");
            }
          }}
          onWear={async (id) => {
            try {
              setError("");
              setUser(await apiShop("wear", id));
            } catch (err) {
              setError(err instanceof Error ? err.message : "换装失败");
            }
          }}
        />
        </Keep>
      ) : null}
      {loggedIn ? (
        <Keep show={view === "rules"}>
          <RulesView onBack={() => setView("home")} />
        </Keep>
      ) : null}
      {loggedIn ? (
        <Keep show={view === "scenes"}>
          <HistoryView onBack={() => setView("home")} />
        </Keep>
      ) : null}
      </GameCabinet>
    </BgmProvider>
  );
}
