import { useEffect, useRef, useState } from "react";

/**
 * 全屏固定背景 —— 本地视频直出，两种无缝循环策略。
 *
 *   ?bg=stage  原始星云漩涡视频（默认）—— 放大下移构图铺满全屏；
 *              A/B 双视频交叉淡化循环，无回跳冻结。
 *   ?bg=star   星空山景视频 —— ping-pong 往返（渐近山→再渐远山），零缝隙。
 *
 * 实现注意：video 元素在 effect 里用原生标签注入（innerHTML），
 * 不经 React 属性管理 —— 实测 React 受控 video 在部分环境下
 * 解码器启动被搁置（满缓冲却不出帧），原生标签无此问题。
 */

type BgKey = "stage" | "star";

const BG_VARIANTS: Record<BgKey, string> = {
  stage: "/static/uploads/bg-stage.mp4",
  star: "/static/uploads/bg-starfield.mp4",
};

function resolveVariant(): BgKey {
  const q = new URLSearchParams(window.location.search).get("bg");
  if (q === "star" || q === "stage") return q;
  return sessionStorage.getItem("xh-bg") === "star" ? "star" : "stage";
}

/** 视频就绪前的海报兜底（本地星空图 + ken-burns，同为持续动画） */
const FALLBACK_POSTER = "/static/uploads/bg-starfield.jpg";
const CROSSFADE_S = 1.1;
const PINGPONG_SPEED = 0.78;

export default function FixedBackground() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [variant] = useState<BgKey>(() =>
    typeof window === "undefined" ? "stage" : resolveVariant()
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const key = variant;
    sessionStorage.setItem("xh-bg", key);
    const src = BG_VARIANTS[key];

    /* 弱网/省流量降级（施工总案 B3）：2g/3g 或 saveData 时不加载视频，仅海报层；
       ?bg= 参数可强制绕过，便于验收对照 */
    const conn = (
      navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }
    ).connection;
    const slow = conn && /(^|-)2g$|slow-2g|^3g$/.test(conn.effectiveType || "");
    if (slow || conn?.saveData) {
      if (!new URLSearchParams(window.location.search).has("bg")) {
        setReady(true);
        return;
      }
    }

    /* ---- 原生注入：与已验证可播的裸标签完全同构 ---- */
    if (key === "stage") {
      /* A 先行；B 垫底，交叉窗时升上来。B 用 metadata 减首屏带宽（施工总案 B2） */
      host.innerHTML =
        `<video id="bg-b" class="bg-video" src="` + src + `" autoplay muted playsinline preload="metadata"></video>` +
        `<video id="bg-a" class="bg-video on" src="` + src + `" autoplay muted playsinline preload="auto"></video>`;
    } else {
      host.innerHTML =
        `<video id="bg-a" class="bg-video on" src="` + src + `" autoplay muted playsinline preload="auto"></video>`;
    }
    const a = document.getElementById("bg-a") as HTMLVideoElement;
    const b = document.getElementById("bg-b") as HTMLVideoElement | null;
    if (!a) return;

    const onPlaying = () => setReady(true);
    a.addEventListener("playing", onPlaying, { once: true });

    let raf = 0;

    if (key === "stage") {
      /* A/B 交叉淡化：A 近尾 → B(垫底)已在播，A 淡出后归位 */
      let active = true; // true=A 在前
      let swapping = false;
      /* 看门狗：活动视频画面无推进 → 自动恢复播放；仍卡死 → 重载解码器 */
      let lastT = -1;
      let lastAdvance = performance.now();
      let reloads = 0;
      const tick = () => {
        raf = window.requestAnimationFrame(tick);
        if (!b || swapping) return;
        const cur = active ? a : b;
        /* 看门狗：活动视频意外暂停 → 立即恢复；画面无推进 → 恢复/重载解码器 */
        if (!document.hidden && cur.paused) {
          void cur.play().catch(() => {});
        }
        if (!document.hidden && cur.readyState >= 2 && !cur.paused) {
          const t = cur.currentTime;
          if (Math.abs(t - lastT) > 0.02) {
            lastT = t;
            lastAdvance = performance.now();
            reloads = 0;
          } else if (performance.now() - lastAdvance > 2200) {
            /* 2.2s 无推进：前 2 次只续播，第 3-4 次才重载，之后彻底放弃停在海报层
               （施工总案 B1：限次+退避，杜绝弱网下 load() 反复重下 3.4MB 的自伤死循环） */
            if (reloads < 2) {
              void cur.play().catch(() => {});
            } else if (reloads < 4) {
              cur.load();
              void cur.play().catch(() => {});
            }
            reloads++;
            lastAdvance = performance.now() + reloads * 4000;
          }
        }
        const nxt = active ? b : a;
        const dur = cur.duration;
        if (!Number.isFinite(dur) || dur <= 0) return;
        const win = Math.min(CROSSFADE_S, dur * 0.25);
        if (cur.currentTime < dur - win) return;

        swapping = true;
        try {
          nxt.currentTime = 0;
        } catch { /* ignore */ }
        void nxt.play().catch(() => {});
        nxt.classList.add("on"); // 升上来
        cur.classList.remove("on");
        window.setTimeout(() => {
          cur.pause();
          try {
            cur.currentTime = 0;
          } catch { /* ignore */ }
          active = !active;
          swapping = false;
        }, win * 1000);
      };
      raf = window.requestAnimationFrame(tick);
    } else {
      /* ping-pong：推近 → 拉远，无缝往返 */
      let dir = 1;
      let last = performance.now();
      const tick = (now: number) => {
        raf = window.requestAnimationFrame(tick);
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        if (a.seeking || a.paused || a.readyState < 2) return;
        const d = a.duration;
        if (!Number.isFinite(d) || d <= 0) return;
        let t = a.currentTime + dir * dt * PINGPONG_SPEED;
        if (t >= d - 0.04) {
          t = d - 0.04;
          dir = -1;
        } else if (t <= 0.04 && dir < 0) {
          t = 0.04;
          dir = 1;
        }
        try {
          a.currentTime = t;
        } catch { /* ignore */ }
      };
      raf = window.requestAnimationFrame(tick);
    }

    /* 标签页隐藏时整体暂停；回来 A 必续播（stage 下 B 由交叉窗逻辑接管） */
    const onVisibility = () => {
      if (document.hidden) {
        a.pause();
        b?.pause();
      } else {
        void a.play().catch(() => {});
        if (key === "stage") {
          const activeEl = a.classList.contains("on") ? b : a;
          if (activeEl) void activeEl.play().catch(() => {});
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div aria-hidden data-bg={variant} className="fixed inset-0 z-0 overflow-hidden bg-bg">
      {/* 海报兜底层：视频就绪后让位 */}
      <img
        src={FALLBACK_POSTER}
        alt=""
        className={`absolute inset-0 h-full w-full animate-bg-kenburns object-cover will-change-transform transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
      />

      {/* 视频容器：内容由 effect 原生注入 */}
      <div ref={hostRef} className="absolute inset-0" />

      {/* 蓝色星云辉光：screen 混合点亮视频暗部，持续脉动 */}
      <div className="bg-nebula bg-nebula-1" />
      <div className="bg-nebula bg-nebula-2" />
      <div className="bg-nebula bg-nebula-3" />

      {/* 顶/底轻渐变：只保导航与页脚文字可读 */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg/60 to-transparent" />
    </div>
  );
}
