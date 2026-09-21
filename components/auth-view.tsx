"use client";

import { useState } from "react";
import { apiLogin, apiRegister, apiResetPassword } from "@/lib/client";
import type { UserPublic } from "@/lib/types";
import { AvatarPicker } from "./avatar";

type Mode = "login" | "register" | "forgot";

const TABS: { id: Mode; label: string }[] = [
  { id: "login", label: "登录" },
  { id: "register", label: "注册" },
];

export function AuthView({ onReady }: { onReady: (user: UserPublic) => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const title = mode === "login" ? "登录" : mode === "register" ? "注册" : "忘记密码";
  const action = mode === "login" ? "登录" : mode === "register" ? "注册" : "重置密码";

  return (
    <div className="screen screen-sea">
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-8">
        <form
          className="w-full max-w-sm space-y-3 rounded-3xl bg-black/25 px-4 py-5"
          onSubmit={async (event) => {
            event.preventDefault();
            if ((mode === "register" || mode === "forgot") && password !== confirm) {
              setError("两次密码不一致");
              return;
            }
            setBusy(true);
            setError("");
            try {
              const user =
                mode === "register"
                  ? await apiRegister(name, password, avatar || undefined)
                  : mode === "forgot"
                    ? await apiResetPassword(name, password)
                    : await apiLogin(name, password);
              onReady(user);
            } catch (err) {
              setError(err instanceof Error ? err.message : "失败");
            } finally {
              setBusy(false);
            }
          }}
        >
          {mode !== "forgot" ? (
            <div className="flex gap-1 rounded-2xl bg-white/5 p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setMode(tab.id);
                    setError("");
                  }}
                  className={`flex-1 rounded-xl py-2 text-sm ${mode === tab.id ? "bg-gold text-ink" : "text-foam/60"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-[15px]">{title}</div>
          )}

          {mode === "register" ? (
            <div className="flex justify-center py-1">
              <AvatarPicker name={name} src={avatar} size={64} onPick={setAvatar} />
            </div>
          ) : null}

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
            placeholder={mode === "forgot" ? "新密码" : "密码"}
            className="field"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {mode !== "login" ? (
            <input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="确认密码"
              className="field"
              autoComplete="new-password"
            />
          ) : null}
          {error ? <p className="text-center text-sm text-coral">{error}</p> : null}
          <button type="submit" disabled={busy} className="btn btn-primary w-full">
            {action}
          </button>
          {mode === "login" ? (
            <button
              type="button"
              onClick={() => {
                setMode("forgot");
                setError("");
                setPassword("");
                setConfirm("");
              }}
              className="w-full py-1 text-center text-sm text-foam/50"
            >
              忘记密码
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className="w-full py-1 text-center text-sm text-foam/50"
            >
              返回登录
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
