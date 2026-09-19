import Image from "next/image";

export function OctopusFigure({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/octopus-cut.png"
      alt="章鱼裁判"
      width={821}
      height={750}
      priority={priority}
      className={`select-none object-contain ${className}`}
    />
  );
}
