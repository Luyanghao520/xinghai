import { useEffect, useRef, useState } from "react";

/**
 * 全屏固定背景 —— 本地视频同源直出，双视频交叉淡化实现无缝循环。
 *
 * 两套背景方案（URL 参数切换，选择会记住）：
 *   ?bg=stage  原始星云漩涡视频（默认，本地化后的原视频）
 *   ?bg=star   星空山景视频
 *
 * 无缝循环原理：A/B 两个 <video> 加载同一资源。A 播到距结尾
 * 一个交叉窗时，B 归零起播并淡入盖住 A；交叉窗结束 A 暂停归零，
 * 角色互换 —— 永远看不到"播完跳回开头"的那一帧冻结。
 */

type BgKey = "stage" | "star";

const BG_VARIANTS: Record<BgKey, string> = {
  stage: "/static/uploads/bg-stage.mp4",
  star: "/static/uploads/bg-starfield.mp4",
};

function resolveVariant(): BgKey {
  const q = new URLSearchParams(window.location.search).get("bg");
  if (q === "star" || q === "stage") return q;
  /* 无参数：沿用上次的选择；首次访问给默认 stage */
  return sessionStorage.getItem("xh-bg") === "star" ? "star" : "stage";
}

/** 视频就绪前的海报兜底（本地星空图 + ken-burns，同为持续动画） */
const FALLBACK_POSTER = "/static/uploads/bg-starfield.jpg";
const CROSSFADE_S = 1.1;

export default function FixedBackground() {
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);
  const [variant, setVariant] = useState<BgKey>("stage");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const key = resolveVariant();
    setVariant(key);
    sessionStorage.setItem("xh-bg", key);

    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    const src = BG_VARIANTS[key];

    /* 首帧真正渲染才淡入 */
    const onPlaying = () => {
      setReady(true);
      a.style.opacity = "1"; // 首个角色点亮
    };
    a.addEventListener("playing", onPlaying, { once: true });

    a.src = src;
    b.src = src;
    b.pause();
    void a.play().catch(() => {});

    /* ---- 无缝循环引擎：rAF 监听播放位置，近尾触发 A/B 交换 ---- */
    let raf = 0;
    let active: "a" | "b" = "a";
    let swapping = false;

    const tick = () => {
      raf = window.requestAnimationFrame(tick);
      if (swapping) return;
      const cur = active === "a" ? a : b;
      const nxt = active === "a" ? b : a;
      const dur = cur.duration;
      if (!Number.isFinite(dur) || dur <= 0) return;
      const win = Math.min(CROSSFADE_S, dur * 0.25);
      if (cur.currentTime < dur - win) return;

      /* 进入交叉窗：B 从头起播并淡入 */
      swapping = true;
      nxt.currentTime = 0;
      void nxt.play().catch(() => {});
      nxt.style.opacity = "1";
      cur.style.opacity = "0";
      window.setTimeout(() => {
        cur.pause();
        try {
          cur.currentTime = 0;
        } catch {
          /* 个别浏览器 seek 未就绪，忽略 */
        }
        active = active === "a" ? "b" : "a";
        swapping = false;
      }, win * 1000);
    };
    raf = window.requestAnimationFrame(tick);

    /* 标签页隐藏时整体暂停，回来即续播 */
    const onVisibility = () => {
      if (document.hidden) {
        a.pause();
        b.pause();
      } else {
        void (active === "a" ? a : b).play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.cancelAnimationFrame(raf);
      a.removeEventListener("playing", onPlaying);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-0 z-0 overflow-hidden bg-bg">
      {/* 海报兜底层：视频就绪后让位；未就绪时持续 ken-burns 漂移 */}
      <img
        src={FALLBACK_POSTER}
        alt=""
        className={`absolute inset-0 h-full w-full animate-bg-kenburns object-cover will-change-transform transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
      />

      {/* A/B 双视频：同一资源，交叉淡化换角色，消除循环回跳冻结 */}
      <video
        ref={aRef}
        className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover will-change-transform opacity-0 transition-opacity duration-1000 ease-in-out"
        muted
        loop={false}
        playsInline
        preload="auto"
        disablePictureInPicture
      />
      <video
        ref={bRef}
        className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover will-change-transform opacity-0 transition-opacity duration-1000 ease-in-out"
        muted
        loop={false}
        playsInline
        preload="auto"
        disablePictureInPicture
      />

      {/* 蓝色星云辉光：screen 混合点亮视频暗部，持续脉动 */}
      <div className="bg-nebula bg-nebula-1" />
      <div className="bg-nebula bg-nebula-2" />

      {/* 顶/底轻渐变：只保导航与页脚文字可读 */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg/60 to-transparent" />

      {/* 方案锚点：调试/自动化验证用，不参与视觉 */}
      <span id="bg-variant-label" data-variant={variant} className="hidden" />
    </div>
  );
}
