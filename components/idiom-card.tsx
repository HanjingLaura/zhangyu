export function CardBack({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const box =
    size === "lg"
      ? "h-[7.6rem] w-[5.3rem]"
      : size === "md"
        ? "h-[5.2rem] w-[3.6rem]"
        : "h-[3.8rem] w-[2.6rem]";

  return (
    <div
      className={`card-back relative flex items-center justify-center rounded-[10px] ${box}`}
      aria-hidden="true"
    >
      <span className="font-display text-lg text-[#f3c15d]/80">丈</span>
    </div>
  );
}

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
      ? "h-[7.6rem] w-[5.3rem] text-[1.35rem]"
      : size === "md"
        ? "h-[5.2rem] w-[3.6rem] text-[14px]"
        : "h-[3.8rem] w-[2.6rem] text-[11px]";

  return (
    <div
      className={`idiom-card relative flex flex-col items-center justify-center rounded-[10px] px-1 text-center font-display tracking-widest ${box} ${
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
    <div className="idiom-card relative flex h-[6.8rem] w-[4.8rem] flex-col items-center justify-center rounded-[10px]">
      <div className="text-[10px] tracking-[0.28em] text-[#8a2a22]">{label}</div>
      <div className="font-display text-5xl leading-none text-[#2a120c]">{char}</div>
    </div>
  );
}

export function FlippingCard({
  word,
  size = "md",
}: {
  word: string;
  size?: "sm" | "md" | "lg";
}) {
  const box =
    size === "lg"
      ? "h-[7.6rem] w-[5.3rem]"
      : size === "md"
        ? "h-[5.2rem] w-[3.6rem]"
        : "h-[3.8rem] w-[2.6rem]";

  return (
    <div className={`card-scene ${box}`}>
      <div key={word} className="card-flipper h-full w-full">
        <div className="card-face card-face-back">
          <CardBack size={size} />
        </div>
        <div className="card-face card-face-front">
          <IdiomCard word={word} size={size} />
        </div>
      </div>
    </div>
  );
}
