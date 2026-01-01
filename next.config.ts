import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '1000mb', // ここで10MBまでの画像を許可するように設定します
    },
  },
};

export default nextConfig;