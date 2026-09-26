"use client";

import { useEffect, useMemo } from "react";
import { assetUrls, warmUrls } from "@/lib/assets";

export function AssetWarm({ extra }: { extra: string[] }) {
  const extraKey = extra.join("\n");
  const urls = useMemo(() => {
    const more = extraKey.split("\n").filter((url) => url && !url.startsWith("data:"));
    return [...new Set([...assetUrls(), ...more])];
  }, [extraKey]);

  useEffect(() => {
    void warmUrls(urls);
  }, [urls]);

  return (
    <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-px overflow-hidden opacity-0">
      {urls.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" decoding="sync" />
      ))}
    </div>
  );
}
