type Mood = "idle" | "judge" | "laugh" | "win";

const COLORS: Record<Mood, { skin: string; blush: string }> = {
  idle: { skin: "#ff6a4d", blush: "#ffd0c4" },
  judge: { skin: "#e4543a", blush: "#ffb3a3" },
  laugh: { skin: "#ff7a3d", blush: "#ffc4a8" },
  win: { skin: "#ff8a4a", blush: "#ffe0a8" },
};

export function OctopusMark({
  mood = "idle",
  className = "",
}: {
  mood?: Mood;
  className?: string;
}) {
  const { skin, blush } = COLORS[mood];
  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <ellipse cx="80" cy="148" rx="42" ry="7" fill="#10242b" opacity="0.12" />
      <path
        d="M34 96c-16 8-28 28-26 40 2 8 12 6 16-2 6-12 12-24 16-34"
        fill={skin}
      />
      <path
        d="M50 108c-8 16-18 34-10 44 6 6 12 0 12-8 1-14 4-24 6-32"
        fill={skin}
      />
      <path
        d="M68 114c-2 18-6 36 2 44 6 6 12-2 10-10-2-14 0-24 0-34"
        fill={skin}
      />
      <path
        d="M92 114c2 18 6 36-2 44-6 6-12-2-10-10 2-14 0-24 0-34"
        fill={skin}
      />
      <path
        d="M110 108c8 16 18 34 10 44-6 6-12 0-12-8-1-14-4-24-6-32"
        fill={skin}
      />
      <path
        d="M126 96c16 8 28 28 26 40-2 8-12 6-16-2-6-12-12-24-16-34"
        fill={skin}
      />
      <path
        d="M44 102c8 6 18 10 28 8M88 110c10 2 22-2 30-10"
        stroke={skin}
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="80" cy="72" rx="48" ry="46" fill={skin} />
      <ellipse cx="80" cy="78" rx="40" ry="34" fill="#fff6f1" />
      <circle cx="62" cy="70" r="10" fill="#10242b" />
      <circle cx="98" cy="70" r="10" fill="#10242b" />
      <circle cx="65" cy="67" r="3.2" fill="white" />
      <circle cx="101" cy="67" r="3.2" fill="white" />
      {mood === "laugh" || mood === "win" ? (
        <path
          d="M68 92c6 10 18 10 24 0"
          stroke="#10242b"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <path
          d="M72 94h16"
          stroke="#10242b"
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}
      <ellipse cx="54" cy="86" rx="7" ry="4" fill={blush} />
      <ellipse cx="106" cy="86" rx="7" ry="4" fill={blush} />
      {mood === "judge" && (
        <path
          d="M46 56c10-10 22-12 34-8M114 56c-10-10-22-12-34-8"
          stroke="#10242b"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  );
}

export function TentacleDots({
  current,
  max,
  light = false,
}: {
  current: number;
  max: number;
  light?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`剩余触手 ${current}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${
            i < current ? "bg-coral" : light ? "bg-white/25" : "bg-ink/15"
          }`}
        />
      ))}
    </span>
  );
}
