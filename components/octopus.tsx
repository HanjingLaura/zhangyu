export function OctopusFigure({
  className = "",
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/octopus.webp"
      alt=""
      width={689}
      height={930}
      className={`select-none object-contain ${className}`}
    />
  );
}
