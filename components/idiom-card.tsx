export function IdiomCard({
  word,
  size = "md",
  dim = false,
}: {
  word: string;
  size?: "sm" | "md" | "lg";
  dim?: boolean;
}) {
  const box =
    size === "lg"
      ? "h-[7.4rem] w-[5.1rem] text-[1.35rem]"
      : size === "md"
        ? "h-[4.6rem] w-[3.2rem] text-[13px]"
        : "h-[3.6rem] w-[2.5rem] text-[11px]";

  return (
    <div
      className={`idiom-card relative flex flex-col items-center justify-center rounded-[10px] border px-1 text-center font-display tracking-widest ${box} ${
        dim ? "opacity-55" : ""
      }`}
    >
      <span className="absolute left-1 top-1 text-[9px] text-[#8a2a22]">接</span>
      <span className="leading-[1.15]">
        {word.split("").map((char, index) => (
          <span key={`${word}-${index}`} className="block">
            {char}
          </span>
        ))}
      </span>
    </div>
  );
}

export function SuitCard({ char, label }: { char: string; label: string }) {
  return (
    <div className="idiom-card relative flex h-[6.4rem] w-[4.6rem] flex-col items-center justify-center rounded-[10px] border">
      <div className="text-[10px] tracking-[0.2em] text-[#8a2a22]">{label}</div>
      <div className="font-display text-5xl leading-none text-[#2a120c]">{char}</div>
    </div>
  );
}
