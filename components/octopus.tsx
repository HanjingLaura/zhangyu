import { withBase } from "@/lib/base-path";

export function OctopusFigure({
  className = "",
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={withBase("/octopus.webp")}
      alt=""
      width={609}
      height={1383}
      className={`select-none object-contain ${className}`}
    />
  );
}
