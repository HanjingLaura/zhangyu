"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const STORAGE_KEY = "zhangyu-bgm";

type BgmState = {
  on: boolean;
  toggle: () => void;
};

const BgmContext = createContext<BgmState>({
  on: false,
  toggle: () => undefined,
});

export function BgmProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [on, setOn] = useState<boolean | null>(null);

  useEffect(() => {
    setOn(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || on === null) return;
    window.localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
    if (!on) {
      audio.pause();
      return;
    }
    const tryPlay = () => {
      void audio.play().catch(() => undefined);
    };
    tryPlay();
    document.addEventListener("pointerdown", tryPlay);
    return () => document.removeEventListener("pointerdown", tryPlay);
  }, [on]);

  return (
    <BgmContext.Provider value={{ on: Boolean(on), toggle: () => setOn((value) => !value) }}>
      <audio ref={audioRef} src="/bgm.mp3" loop preload="auto" />
      {children}
    </BgmContext.Provider>
  );
}

export function BgmToggle({ className = "" }: { className?: string }) {
  const { on, toggle } = useContext(BgmContext);

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex h-11 w-11 items-center justify-center rounded-full text-white active:bg-white/10 ${className}`}
      aria-label={on ? "关闭音乐" : "打开音乐"}
      aria-pressed={on}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M10 17.2V6.6c0-.7.4-1.3 1.1-1.5l7.2-2.1c.8-.2 1.5.4 1.5 1.2v10.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="8.2" cy="17.4" r="2.6" fill="currentColor" />
        <circle cx="16.8" cy="14.6" r="2.6" fill="currentColor" />
        {on ? null : (
          <path
            d="M4 19.5 20 4.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  );
}
