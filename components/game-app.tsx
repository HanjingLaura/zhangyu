"use client";

import { useEffect, useState } from "react";
import {
  apiConfigureRoom,
  apiCreateRoom,
  apiDanmaku,
  apiJoinRoom,
  apiLeaveRoom,
  apiLogout,
  apiMe,
  apiMove,
  apiRoom,
  apiStartRoom,
  apiUploadAvatar,
} from "@/lib/client";
import type { RoomSnapshot, UserPublic } from "@/lib/types";
import { AuthView } from "./auth-view";
import { HomeView } from "./home-view";
import { JoinView } from "./join-view";
import { LobbyView } from "./lobby-view";
import { PlayView } from "./play-view";
import { RulesView } from "./rules-view";
import { ScenesView } from "./scenes-view";
import { GameCabinet } from "./shell";

type View = "boot" | "auth" | "home" | "join" | "lobby" | "play" | "rules" | "scenes";

export function GameApp() {
  const [view, setView] = useState<View>("boot");
  const [user, setUser] = useState<UserPublic | null>(null);
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiMe()
      .then((next) => {
        setUser(next);
        setView(next ? "home" : "auth");
      })
      .catch(() => setView("auth"));
  }, []);

  const roomCode = room?.code;
  useEffect(() => {
    if (!roomCode || (view !== "lobby" && view !== "play")) return;
    const timer = window.setInterval(() => {
      apiRoom(roomCode)
        .then((data) => {
          setRoom(data.room);
          if (data.you) setUser(data.you);
          if (data.room.status === "playing" || data.room.status === "finished") {
            setView("play");
          }
        })
        .catch(() => undefined);
    }, 1200);
    return () => window.clearInterval(timer);
  }, [roomCode, view]);

  const enterRoom = (next: RoomSnapshot) => {
    setRoom(next);
    setError("");
    setDraft("");
    setView(next.status === "lobby" ? "lobby" : "play");
  };

  return (
    <GameCabinet>
      {view === "boot" ? (
        <div className="screen items-center justify-center text-foam/50">加载中</div>
      ) : null}
      {view === "auth" ? <AuthView onReady={(next) => { setUser(next); setView("home"); }} /> : null}
      {view === "home" && user ? (
        <HomeView
          user={user}
          onAvatar={async (image) => {
            setUser(await apiUploadAvatar(image));
          }}
          onCreate={async () => {
            try {
              enterRoom(await apiCreateRoom());
            } catch (err) {
              setError(err instanceof Error ? err.message : "创建失败");
            }
          }}
          onJoin={() => setView("join")}
          onRules={() => setView("rules")}
          onScenes={() => setView("scenes")}
          onLogout={async () => {
            await apiLogout();
            setUser(null);
            setRoom(null);
            setView("auth");
          }}
        />
      ) : null}
      {view === "join" ? (
        <JoinView
          onBack={() => setView("home")}
          onJoin={async (code) => enterRoom(await apiJoinRoom(code))}
        />
      ) : null}
      {view === "lobby" && room && user ? (
        <LobbyView
          room={room}
          you={user}
          error={error}
          onBack={async () => {
            await apiLeaveRoom(room.code);
            setRoom(null);
            setView("home");
          }}
          onConfigure={async (patch) => {
            setRoom(await apiConfigureRoom(room.code, patch));
          }}
          onDanmaku={async (text) => {
            setRoom(await apiDanmaku(room.code, text));
          }}
          onStart={async () => {
            try {
              setError("");
              enterRoom(await apiStartRoom(room.code));
            } catch (err) {
              setError(err instanceof Error ? err.message : "开始失败");
            }
          }}
        />
      ) : null}
      {view === "play" && room?.game ? (
        <PlayView
          room={room}
          you={user}
          draft={draft}
          error={error}
          onDraft={setDraft}
          onSubmit={async () => {
            try {
              setError("");
              setRoom(await apiMove(room.code, "submit", draft));
              setDraft("");
            } catch (err) {
              setError(err instanceof Error ? err.message : "发送失败");
            }
          }}
          onHint={async () => {
            try {
              setRoom(await apiMove(room.code, "hint"));
            } catch (err) {
              setError(err instanceof Error ? err.message : "提示失败");
            }
          }}
          onPass={async () => {
            try {
              setRoom(await apiMove(room.code, "pass"));
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
              setRoom(await apiStartRoom(room.code));
              setDraft("");
            } catch (err) {
              setError(err instanceof Error ? err.message : "开始失败");
            }
          }}
          onReseat={() => setView("lobby")}
          onFinish={async () => {
            try {
              setRoom(await apiMove(room.code, "finish"));
            } catch (err) {
              setError(err instanceof Error ? err.message : "结束失败");
            }
          }}
        />
      ) : null}
      {view === "rules" ? <RulesView onBack={() => setView("home")} /> : null}
      {view === "scenes" ? (
        <ScenesView onBack={() => setView("home")} onPlay={() => setView("home")} />
      ) : null}
    </GameCabinet>
  );
}
