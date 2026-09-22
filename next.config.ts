import type { NextConfig } from "next";

const basePath = "/zhangyu";

const dest = "https://zhangyu-roan.vercel.app";

const nextConfig: NextConfig = {
  basePath,
  // basePath is not appended to assetPrefix; dest assets live under /zhangyu/_next.
  assetPrefix: process.env.VERCEL_ENV === "production" ? dest + basePath : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_BUILD: "20260922-outfits",
  },
};

export default nextConfig;
