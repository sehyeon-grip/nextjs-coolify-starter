import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Coolify(도커)에서 가볍고 안정적으로 배포되도록 하는 설정 — 그대로 두세요.
  output: "standalone",
};

export default nextConfig;
