"use client";

import { useState } from "react";
import { apiLogin, apiRegister, apiUploadAvatar } from "@/lib/client";
import type { UserPublic } from "@/lib/types";
import { AvatarPicker } from "./avatar";
import { OctopusFigure } from "./octopus";

export function AuthView({
  onReady,
}: {
  onReady: (user: UserPublic) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="tavern-screen px-6 pb-8 pt-10">
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        <div className="wood-table relative flex h-40 w-40 items-end justify-center rounded-full pb-1">
          <OctopusFigure priority className="h-[7.4rem] w-[7.4rem] drop-shadow-[0_16px_18px_rgba(0,0,0,0.35)]" />
        </div>
        <p className="mt-5 text-[11px] tracking-[0.42em] text-gold/80">酒桌 · 章鱼 · 接龙</p>
        <h1 className="font-display mt-2 text-4xl">丈育成语接龙</h1>
      </div>

      <div className="relative z-10 mb-4 flex justify-center">
        <AvatarPicker name={name || "我"} src={avatar} onPick={setAvatar} />
      </div>

      <div className="relative z-10 mb-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`rounded-full py-2 text-sm ${mode === "register" ? "bg-gold text-[#2a160e]" : "ghost-btn"}`}
        >
          注册
        </button>
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-full py-2 text-sm ${mode === "login" ? "bg-gold text-[#2a160e]" : "ghost-btn"}`}
        >
          登录
        </button>
      </div>

      <form
        className="relative z-10 space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          try {
            let user =
              mode === "register"
                ? await apiRegister(name, password)
                : await apiLogin(name, password);
            if (avatar) {
              try {
                user = await apiUploadAvatar(avatar);
              } catch {
                // Account is already in; the photo can be added on the home table.
              }
            }
            onReady(user);
          } catch (err) {
            setError(err instanceof Error ? err.message : "失败");
          } finally {
            setBusy(false);
          }
        }}
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="桌上怎么称呼你"
          className="w-full rounded-2xl bg-white/8 px-4 py-3 text-base outline-none ring-gold/40 focus:ring-2"
          maxLength={12}
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={mode === "register" ? "设个密码，至少四位" : "密码"}
          className="w-full rounded-2xl bg-white/8 px-4 py-3 text-base outline-none ring-gold/40 focus:ring-2"
        />
        {error ? <p className="text-center text-sm text-coral">{error}</p> : null}
        <button type="submit" disabled={busy} className="wood-btn w-full py-3.5">
          {busy ? "请稍等" : mode === "register" ? "坐下" : "回桌"}
        </button>
      </form>
    </div>
  );
}
