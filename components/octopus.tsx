export function OctopusFigure({
  className = "",
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/octopus-sit.webp"
      alt=""
      width={580}
      height={947}
      className={`select-none object-contain ${className}`}
    />
  );
}
