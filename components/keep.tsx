"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function Keep({ show, children }: { show: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && ref.current?.contains(active)) active.blur();
  }, [show]);

  return (
    <div
      ref={ref}
      className={show ? "relative z-10 h-full" : "pointer-events-none absolute inset-0 z-0 opacity-0"}
      inert={show ? undefined : true}
      aria-hidden={show ? undefined : true}
    >
      {children}
    </div>
  );
}
