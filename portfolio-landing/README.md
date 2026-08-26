# portfolio-landing · 星海艺术团暗色落地页

React + Vite + Tailwind CSS (v3) + TypeScript + GSAP + Framer Motion + hls.js 单页暗色落地页，内容为「星海艺术团」官网主题。

## 运行

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 产物输出到 dist/
```

## 背景视频（全屏固定）

- 全屏 `position: fixed` 背景，滚动时纹丝不动，见 `src/components/FixedBackground.tsx`
- HLS 源为 Mux 流，清单解析后锁定最高清档 **1708×1212 @ ~4.5Mbps**，60s 前向大缓冲抗抖动
- 换视频源只需改 `FixedBackground.tsx` 顶部 `HLS_SRC` 一处

## 图片复用（不重复存储）

- 本项目不重复存图：`vite.config.ts` 的 `publicDir` 指向仓库根 `static/uploads/`
- 因此 `/showcase/scXX.jpg`、`/logo.png`、`/u20260717171010_f7be1541.png` 直接复用 Flask 主站的图片
- 内容与文案集中在 `src/lib/data.ts`
