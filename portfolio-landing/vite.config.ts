import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// 图片复用仓库根 static/uploads（单一来源，不重复存储）：
// publicDir 指向它 → URL 根映射为 /showcase/...、/logo.png、/u20260717...png
// dev 与 build 均生效；本地无需再维护 public/showcase 副本。
export default defineConfig({
  plugins: [react()],
  publicDir: fileURLToPath(new URL("../static/uploads", import.meta.url)),
});
