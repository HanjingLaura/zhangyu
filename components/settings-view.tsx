"use client";

import { useState } from "react";
import type { UserPublic } from "@/lib/types";
import { AvatarPicker } from "./avatar";
import { TopBar } from "./shell";

export function SettingsView({
  user,
  error,
  onAvatar,
  onSaveName,
  onLogout,
  onBack,
}: {
  user: UserPublic;
  error?: string;
  onAvatar: (image: string) => Promise<void>;
  onSaveName: (name: string) => Promise<void>;
  onLogout: () => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [busy, setBusy] = useState(false);

  return (
    <div className="screen">
      <TopBar title="设置" onBack={onBack} />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-8">
        <form
          className="w-full max-w-sm space-y-3 rounded-3xl bg-black/25 px-4 py-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            try {
              await onSaveName(name);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="flex justify-center py-1">
            <AvatarPicker name={name || user.name} src={user.avatarUrl} size={88} onPick={onAvatar} />
          </div>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="姓名"
            className="field"
            maxLength={12}
            autoComplete="username"
          />
          {error ? <p className="text-center text-sm text-coral">{error}</p> : null}
          <button type="submit" disabled={busy} className="btn btn-primary w-full">
            保存
          </button>
          <button type="button" onClick={onLogout} className="w-full py-1 text-center text-sm text-foam/50">
            退出
          </button>
        </form>
      </div>
    </div>
  );
}
