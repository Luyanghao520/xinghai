import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 含原生二进制模块，不能被打包器打包，
  // 声明后由 Node 直接以依赖方式加载（见 src/lib/db.ts）
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
