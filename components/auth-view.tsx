"use client";

import { useState } from "react";
import { apiLogin, apiRegister, apiUploadAvatar } from "@/lib/client";
import type { UserPublic } from "@/lib/types";
import { AvatarPicker } from "./avatar";
import { TableScene } from "./table-scene";

export function AuthView({ onReady }: { onReady: (user: UserPublic) => void }) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="screen">
      <div className="relative z-10 pt-[calc(28px+env(safe-area-inset-top))] text-center">
        <h1 className="font-display text-[34px] leading-none tracking-wide">章鱼哥接龙</h1>
      </div>
      <TableScene />

      <form
        className="drawer space-y-3"
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
                // Photo can be added later from the home screen.
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
        <div className="flex items-center gap-4">
          <AvatarPicker name={name} src={avatar} size={64} onPick={setAvatar} />
          <div className="flex flex-1 gap-1 rounded-2xl bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-xl py-2 text-sm ${mode === "register" ? "bg-gold text-ink" : "text-foam/60"}`}
            >
              注册
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-xl py-2 text-sm ${mode === "login" ? "bg-gold text-ink" : "text-foam/60"}`}
            >
              登录
            </button>
          </div>
        </div>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="昵称"
          className="field"
          maxLength={12}
          autoComplete="username"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="密码"
          className="field"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
        />
        {error ? <p className="text-center text-sm text-coral">{error}</p> : null}
        <button type="submit" disabled={busy} className="btn btn-primary w-full">
          {mode === "register" ? "注册" : "登录"}
        </button>
      </form>
    </div>
  );
}
