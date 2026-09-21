import type { NextConfig } from "next";

const basePath = "/zhangyu";

const dest = "https://zhangyu-roan.vercel.app";

const nextConfig: NextConfig = {
  basePath,
  assetPrefix: process.env.VERCEL_ENV === "production" ? dest : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_BUILD: "20260921-buzz",
  },
};

export default nextConfig;
