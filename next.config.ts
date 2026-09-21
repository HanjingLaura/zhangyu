import type { NextConfig } from "next";

const basePath = "/zhangyu";

const nextConfig: NextConfig = {
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_BUILD: "20260921-buzz",
  },
};

export default nextConfig;
