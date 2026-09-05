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
      applyParallax(); // 视差缓动独立于视频状态，始终运行
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

    /* ---- 指针视差（可交互背景）：光标位置 → 视频层反向轻移（惯性缓动） ----
       仅桌面精确指针 + 未开启减动效时启用；scale(1.08) 留出位移余量防露边 */
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const canParallax = finePointer && !reducedMotion;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    const onPointerMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (canParallax) window.addEventListener("pointermove", onPointerMove);

    const applyParallax = () => {
      if (!canParallax) return;
      curX += (targetX - curX) * 0.055;
      curY += (targetY - curY) * 0.055;
      host.style.transform = `translate3d(${(-curX * 1.4).toFixed(3)}%, ${(3 - curY * 1.1).toFixed(3)}%, 0) scale(1.14)`;
    };

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (canParallax) window.removeEventListener("pointermove", onPointerMove);
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

      {/* 视频层：内容由 effect 原生注入（A/B 交叉淡化）；整层随指针视差轻移 */}
      <div ref={hostRef} className="bg-video-host absolute inset-0" />

      {/* 全幅深蓝 screen 洗色：screen 混合数学上保证画面不存在纯黑像素，
          源片残余的暗斑一律被抬成深蓝纹理 */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          background:
            "linear-gradient(135deg, rgba(30,64,175,0.18) 0%, rgba(8,47,73,0.15) 55%, rgba(30,64,175,0.12) 100%)",
        }}
      />

      {/* 蓝色星云辉光：screen 混合把光晕“加”进视频暗部，消除死黑 + 持续脉动
          （移植旧站 .bg-nebula n1/n2 的构图） */}
      <div
        className="bg-nebula"
        style={{
          top: "-20%",
          left: "-12%",
          width: "62%",
          height: "56%",
          background: "radial-gradient(closest-side, rgba(59,130,246,0.55), transparent)",
        }}
      />
      <div
        className="bg-nebula"
        style={{
          bottom: "-16%",
          right: "-14%",
          width: "58%",
          height: "58%",
          background: "radial-gradient(closest-side, rgba(99,102,241,0.45), transparent)",
          animationDelay: "-4.5s",
        }}
      />

      {/* 顶/底轻渐变：只保导航与页脚文字可读 */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent" />

      <style>{`
        /* 放大下移构图（旧站调参再加大）：高度 195% + 顶部取景 + 宿主下沉 3%——
           漩涡更满、构图下沉，黑边与空洞全部裁出画外 */
        .bg-video {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 195%;
          object-fit: cover;
          object-position: center top;
          opacity: 0;
          transition: opacity 1.1s ease;
          /* 亮度/饱和提升：把源片固有近黑像素抬成可见深蓝纹理，
             消除源片自身明度分布造成的「空洞感」（旧站 data-bg=stage 同款） */
          filter: brightness(1.5) contrast(1.06) saturate(1.22);
        }
        .bg-video.on {
          opacity: 1;
        }
        /* 视差宿主：scale(1.14)+下沉3% 常驻，位移余量充足不露边 */
        .bg-video-host {
          transform: translate3d(0, 3%, 0) scale(1.14);
          will-change: transform;
        }
        .bg-nebula {
          position: absolute;
          pointer-events: none;
          mix-blend-mode: screen;
          border-radius: 9999px;
          filter: blur(64px);
          animation: nebula-pulse 9s ease-in-out infinite;
        }
        @keyframes nebula-pulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.68; transform: scale(1.12); }
        }
        @media (prefers-reduced-motion: reduce) {
          .bg-nebula { animation: none; }
        }
      `}</style>
    </div>
  );
}
