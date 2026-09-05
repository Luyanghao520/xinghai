"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 首页全屏背景视频（自旧站 portfolio-landing 的 FixedBackground 移植，保留已验证的坑位处理）：
 *
 * - 视频：/uploads/bg-stage.mp4（星云漩涡），A/B 双视频交叉淡化实现无缝循环（避免普通 loop 的回跳冻结）；
 * - 海报兜底：视频可播前显示 /uploads/bg-starfield.jpg；
 * - 弱网降级：2g/3g 或 saveData 时不加载视频，仅显示海报；
 * - 动效减弱：prefers-reduced-motion 时仅显示海报；
 * - 看门狗（限次+退避）：画面无推进 → 先续播、再重载解码器、最后放弃停在海报层，
 *   杜绝弱网下 load() 反复重下 3.5MB 的自伤循环；
 * - 标签页隐藏时暂停，回来续播。
 *
 * 实现注意（旧站实测结论）：video 元素在 effect 里用原生标签注入，不经 React 属性管理——
 * React 受控 video 在部分环境下解码器启动被搁置（满缓冲却不出帧），原生标签无此问题。
 */

const VIDEO_SRC = "/uploads/bg-stage.mp4";
const FALLBACK_POSTER = "/uploads/bg-starfield.jpg";
const CROSSFADE_S = 1.1;

export default function HeroVideo() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    /* 弱网 / 省流量 / 减动效：不加载视频；不做任何 state 变更，海报层保持可见 */
    const conn = (
      navigator as Navigator & {
        connection?: { effectiveType?: string; saveData?: boolean };
      }
    ).connection;
    const slow = conn && /(^|-)2g$|slow-2g|^3g$/.test(conn.effectiveType || "");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (slow || conn?.saveData || reducedMotion) {
      return;
    }

    /* ---- A/B 双视频：A 在前；B 垫底（metadata 预载省首屏带宽），交叉窗时升上来 ---- */
    host.innerHTML =
      `<video id="bg-b" class="bg-video" src="${VIDEO_SRC}" autoplay muted playsinline preload="metadata"></video>` +
      `<video id="bg-a" class="bg-video on" src="${VIDEO_SRC}" autoplay muted playsinline preload="auto"></video>`;
    const a = document.getElementById("bg-a") as HTMLVideoElement | null;
    const b = document.getElementById("bg-b") as HTMLVideoElement | null;
    if (!a) return;

    const onPlaying = () => setReady(true);
    a.addEventListener("playing", onPlaying, { once: true });

    let raf = 0;
    let active = true; // true = A 在前
    let swapping = false;
    /* 看门狗状态：画面无推进 → 续播 ×2 → 重载解码器 ×2 → 放弃（限次+退避） */
    let lastT = -1;
    let lastAdvance = performance.now();
    let reloads = 0;

    const tick = () => {
      raf = window.requestAnimationFrame(tick);
      if (!b || swapping || document.hidden) return;
      const cur = active ? a : b;
      if (cur.paused) void cur.play().catch(() => {});
      if (cur.readyState >= 2 && !cur.paused) {
        const t = cur.currentTime;
        if (Math.abs(t - lastT) > 0.02) {
          lastT = t;
          lastAdvance = performance.now();
          reloads = 0;
        } else if (performance.now() - lastAdvance > 2200) {
          if (reloads < 2) {
            void cur.play().catch(() => {});
          } else if (reloads < 4) {
            cur.load();
            void cur.play().catch(() => {});
          }
          reloads += 1;
          lastAdvance = performance.now() + reloads * 4000;
        }
      }

      /* 接近结尾 → 交叉切到另一路 */
      const nxt = active ? b : a;
      const dur = cur.duration;
      if (!Number.isFinite(dur) || dur <= 0) return;
      const win = Math.min(CROSSFADE_S, dur * 0.25);
      if (cur.currentTime < dur - win) return;

      swapping = true;
      try {
        nxt.currentTime = 0;
      } catch {
        /* ignore */
      }
      void nxt.play().catch(() => {});
      nxt.classList.add("on");
      cur.classList.remove("on");
      window.setTimeout(() => {
        cur.pause();
        try {
          cur.currentTime = 0;
        } catch {
          /* ignore */
        }
        active = !active;
        swapping = false;
      }, win * 1000);
    };
    raf = window.requestAnimationFrame(tick);

    /* 标签页隐藏暂停；回来续播当前在前的一路 */
    const onVisibility = () => {
      if (document.hidden) {
        a.pause();
        b?.pause();
      } else {
        void a.play().catch(() => {});
        const front = a.classList.contains("on") ? a : b;
        if (front) void front.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.cancelAnimationFrame(raf);
      a.removeEventListener("playing", onPlaying);
      a.pause();
      b?.pause();
    };
  }, []);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#0a0a0a]">
      {/* 海报兜底层：视频可播后淡出 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FALLBACK_POSTER}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* 视频层：内容由 effect 原生注入（A/B 交叉淡化） */}
      <div ref={hostRef} className="absolute inset-0" />

      <style>{`
        .bg-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 1.1s ease;
        }
        .bg-video.on {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
