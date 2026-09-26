import type { ReactNode } from "react";
import { TopBar } from "./shell";

export function SeaPanel({
  title,
  right,
  onBack,
  children,
}: {
  title: string;
  right?: ReactNode;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div className="screen">
      <TopBar title={title} right={right} onBack={onBack} />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-5 py-3">
        <div className="h-fit max-h-full w-full max-w-sm overflow-y-auto rounded-3xl bg-black/25 px-3.5 py-3">
          {children}
        </div>
      </div>
    </div>
  );
}
