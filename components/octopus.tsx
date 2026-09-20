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
      src="/octopus.webp"
      alt=""
      width={849}
      height={910}
      priority={priority}
      className={`select-none object-contain ${className}`}
    />
  );
}
