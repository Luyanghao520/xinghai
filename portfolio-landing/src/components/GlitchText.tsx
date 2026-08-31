import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * GlitchText —— React Bits Pro「glitch-text」同款体验的免费自研版。
 * 交互语义与 pro.reactbits.dev/docs/components/glitch-text 一致：
 * 光标靠近/扫过时文字产生切片错位 + RGB 撕裂，离开后黏性衰减（sticky）。
 *
 * 实现说明：DOM 文字原样保留（SEO/无障碍/字号全部不动，字体由调用方透传），
 * 故障画面由叠在文字上的 <canvas> 绘制——空闲时画布全透明，因此只在
 * 故障帧上有绘制开销，静止时零 rAF。prefers-reduced-motion 下完全禁用。
 */

interface GlitchTextProps {
  /** 纯文本：canvas 绘制源 + aria-label（富文本由 children 承载） */
  text: string;
  /** 可选的富文本 DOM 层（缺省渲染 text 本身） */
  children?: ReactNode;
  /** 透传给 DOM 文字层的 class（字号/颜色/字体由调用方控制，组件不改字号） */
  className?: string;
  /** 入场静默期 ms：等 GSAP/Framer 入场动画结束后才启用（避免故障层抢先显形） */
  delay?: number;
  /** 强度系数 0~1：标题用 1，长段落建议 0.35~0.5 */
  strength?: number;
  /** 无光标时的偶发环境脉冲（标题建议开，正文段落关） */
  ambient?: boolean;
}

const RED = "rgba(255, 74, 106, 0.55)";
const CYAN = "rgba(64, 210, 255, 0.55)";

export default function GlitchText({
  text,
  children,
  className,
  delay = 0,
  strength = 1,
  ambient = false,
}: GlitchTextProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const textEl = textRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !textEl || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* ---- 离屏资源：正文层 + 红/青撕裂层（文字内容或尺寸变化时重建） ---- */
    let base = document.createElement("canvas");
    let red = document.createElement("canvas");
    let cyan = document.createElement("canvas");
    let lines: string[] = [];
    let lineH = 0;
    let armed = false;
    let raf = 0;
    let energy = 0;
    let running = false;
    let ambientTimer = 0;
    let lastPointer = { x: -1e4, y: -1e4, t: 0 };

    const buildOffscreen = () => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cs = getComputedStyle(textEl);
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      lineH = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.6;

      const setup = (c: HTMLCanvasElement) => {
        c.width = Math.ceil(rect.width * dpr);
        c.height = Math.ceil(rect.height * dpr);
        const x = c.getContext("2d");
        if (!x) return null;
        x.scale(dpr, dpr);
        x.font = font;
        x.textAlign = "center";
        x.textBaseline = "alphabetic";
        return x;
      };
      const bctx = setup(base);
      const rctx = setup(red);
      const cctx = setup(cyan);
      if (!bctx || !rctx || !cctx) return;
      canvas.width = base.width;
      canvas.height = base.height;

      /* CJK 逐字贪心断行：与 DOM 换行位置不必逐字一致，故障帧内不可辨 */
      const maxW = rect.width;
      lines = [];
      let cur = "";
      for (const ch of text) {
        if (ch === "\n") {
          lines.push(cur);
          cur = "";
          continue;
        }
        const next = cur + ch;
        if (bctx.measureText(next).width > maxW && cur) {
          lines.push(cur);
          cur = ch === " " ? "" : ch;
        } else {
          cur = next;
        }
      }
      if (cur) lines.push(cur);
      if (!lines.length) lines = [text];

      /* 行盒垂直居中：与 DOM 半行距算法严格一致
         （baseline = lineH/2 + (fontAscent−fontDescent)/2），
         fontBoundingBox 不可用时退回 ink bounds（差几个 px，故障帧内不可辨） */
      const m = bctx.measureText(lines.reduce((a, b) => (b.length > a.length ? b : a), ""));
      const fa = m.fontBoundingBoxAscent || m.actualBoundingBoxAscent || parseFloat(cs.fontSize) * 0.88;
      const fd = m.fontBoundingBoxDescent || m.actualBoundingBoxDescent || parseFloat(cs.fontSize) * 0.12;
      const y0 =
        rect.height / 2 -
        ((lines.length - 1) * lineH) / 2 +
        (fa - fd) / 2;
      const drawAll = (x: CanvasRenderingContext2D, fill: string) => {
        x.fillStyle = fill;
        lines.forEach((ln, i) => {
          x.fillText(ln, rect.width / 2, y0 + i * lineH);
        });
      };
      drawAll(bctx, cs.color || "#F5F5F5");
      drawAll(rctx, RED);
      drawAll(cctx, CYAN);
    };

    /* ---- 故障帧绘制：切片错位 + RGB 撕裂（幅度克制，文字始终可读） ---- */
    const drawGlitch = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = base.width / Math.max(rect.width, 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      const e = Math.min(energy, 1);
      const slices = 1 + Math.floor(e * 4 * strength);
      for (let i = 0; i < slices; i++) {
        const sh = (0.05 + Math.random() * 0.14) * rect.height;
        const sy = Math.random() * (rect.height - sh);
        const dx = (Math.random() - 0.5) * e * strength * rect.width * 0.13;
        ctx.drawImage(
          base,
          0, sy * dpr, base.width, sh * dpr,
          dx, sy, rect.width, sh
        );
      }
      if (Math.random() < 0.35 + e * 0.35) {
        const k = 1 + e * 4 * strength;
        ctx.globalCompositeOperation = "lighter";
        ctx.drawImage(red, (Math.random() - 0.5) * k, 0, rect.width, rect.height);
        ctx.drawImage(cyan, (Math.random() - 0.5) * k, 0, rect.width, rect.height);
        ctx.globalCompositeOperation = "source-over";
      }
    };

    const tick = () => {
      energy *= 0.93;
      if (energy < 0.02) {
        energy = 0;
        running = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      drawGlitch();
      raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!running && armed) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    /* ---- 光标跟踪：靠近文字越快、越近，能量越高（黏性来源） ---- */
    const onPointerMove = (ev: PointerEvent) => {
      if (!armed) return;
      const rect = wrap.getBoundingClientRect();
      const radius = Math.max(rect.width, 160);
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(ev.clientX - cx, ev.clientY - cy);
      if (dist < radius) {
        const speed = Math.min(
          Math.hypot(ev.clientX - lastPointer.x, ev.clientY - lastPointer.y) /
            40,
          1
        );
        const near = 1 - dist / radius;
        energy = Math.min(
          1,
          energy + near * (0.05 + speed * 0.22) * strength
        );
        kick();
      }
      lastPointer = { x: ev.clientX, y: ev.clientY, t: performance.now() };
    };

    const onResize = () => {
      buildOffscreen();
      if (energy > 0) drawGlitch();
    };

    const enable = () => {
      if (armed) return;
      armed = true;
      buildOffscreen();
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      if (ambient) {
        const pulse = () => {
          if (!document.hidden && energy < 0.05) {
            energy = 0.14 + Math.random() * 0.08;
            kick();
          }
          ambientTimer = window.setTimeout(pulse, 5200 + Math.random() * 4600);
        };
        ambientTimer = window.setTimeout(pulse, 3200);
      }
    };

    const armTimer = window.setTimeout(enable, delay);
    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);
    /* 网络字体（Noto Serif SC 等）晚于首帧就绪会让离屏字型错版，字体加载后再重建 */
    if (document.fonts?.ready) document.fonts.ready.then(() => armed && buildOffscreen());

    return () => {
      window.clearTimeout(armTimer);
      window.clearTimeout(ambientTimer);
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [text, delay, strength, ambient]);

  return (
    <span ref={wrapRef} className="relative inline-block align-bottom">
      <span ref={textRef} className={className} aria-label={text}>
        {children ?? text}
      </span>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </span>
  );
}
