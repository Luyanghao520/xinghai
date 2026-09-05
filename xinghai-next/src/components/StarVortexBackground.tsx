"use client";

import { useEffect, useRef, useState } from "react";
import type { CanvasTexture, Sprite } from "three";

/**
 * 「涡轮星轮」程序化背景 —— Three.js living-world（替代旧站背景视频）。
 *
 * 视觉：三条旋臂的粒子星轮匀速永续旋转（数学函数驱动，天然无缝、无循环断点、
 * 满幅铺满视口，没有视频的黑边），远景星野与星云雾填充暗部；核心白热、
 * 旋臂蓝紫、外缘青色的 additive 发光。
 *
 * 健壮性（对照 ThreeUI/Sylva 类效果验证清单）：
 * - DPR 上限 2；ResizeObserver 跟随容器尺寸；
 * - 标签页隐藏 / 滚出视口（IntersectionObserver）时暂停渲染；
 * - prefers-reduced-motion：只渲染静态单帧；
 * - WebGL 上下文丢失：preventDefault + 重建；卸载时全量 dispose；
 * - three 经动态 import 加载，不进入首屏 JS 包；加载完成前显示星空海报。
 */

export default function StarVortexBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let teardown = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed || !canvas) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const VORTEX_R = 5.8;
      const COUNT = 15000;
      const STAR_COUNT = 1400;

      /* ---------- 基础：渲染器 / 场景 / 相机 ---------- */
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(new THREE.Color("#050810"), 1);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120);
      camera.position.set(0, 3.0, 6.6);
      camera.lookAt(0, 0.1, 0);

      const disposables: Array<{ dispose(): void }> = [];
      const track = <T extends { dispose(): void }>(d: T): T => {
        disposables.push(d);
        return d;
      };

      /* ---------- 共享点材质 ---------- */
      const vertexShader = /* glsl */ `
        attribute float aSize;
        attribute float aPhase;
        attribute vec3 aColor;
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uScale;
        varying vec3 vColor;
        varying float vGlow;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          float twinkle = 0.72 + 0.28 * sin(uTime * (0.6 + aPhase * 0.9) + aPhase * 6.2831);
          vGlow = twinkle;
          vColor = aColor;
          gl_PointSize = aSize * uPixelRatio * (uScale / -mv.z);
        }
      `;
      const fragmentShader = /* glsl */ `
        varying vec3 vColor;
        varying float vGlow;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float a = pow(smoothstep(0.5, 0.02, d), 1.7);
          // 全局亮度系数压住 additive 叠加的过曝
          gl_FragColor = vec4(vColor * vGlow, a * 0.5);
        }
      `;

      const uniforms = {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
        uScale: { value: 120 },
      };

      /* ---------- 旋涡轮粒子盘（主角） ---------- */
      // 三条旋臂高斯分布；整体匀速旋转（对象级 rotation）→ 臂形永存、旋转无缝；
      // 每粒子独立闪烁（twinkle）提供生命感。
      const gaussian = (): number => {
        const u = Math.max(Math.random(), 1e-9);
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
      };

      const vortexPositions = new Float32Array(COUNT * 3);
      const vortexColors = new Float32Array(COUNT * 3);
      const vortexSizes = new Float32Array(COUNT);
      const vortexPhases = new Float32Array(COUNT);

      const coreColor = new THREE.Color("#eaf2ff");
      const innerColor = new THREE.Color("#5f8bff");
      const midColor = new THREE.Color("#7c5cff");
      const outerColor = new THREE.Color("#2dd4bf");
      const tmp = new THREE.Color();

      for (let i = 0; i < COUNT; i++) {
        const arm = i % 3;
        const t = Math.pow(Math.random(), 0.72); // 0=核心 1=外缘（内密外疏）
        const radius = 0.35 + t * VORTEX_R;
        const angle =
          arm * ((Math.PI * 2) / 3) + radius * 1.02 + gaussian() * (0.07 + 0.15 * t);
        vortexPositions[i * 3] = Math.cos(angle) * radius;
        vortexPositions[i * 3 + 1] = gaussian() * 0.14 * (1.15 - t * 0.75);
        vortexPositions[i * 3 + 2] = Math.sin(angle) * radius;

        if (t < 0.1) {
          tmp.copy(coreColor).lerp(innerColor, t / 0.1);
        } else if (t < 0.6) {
          tmp.copy(innerColor).lerp(midColor, (t - 0.1) / 0.5);
        } else {
          tmp.copy(midColor).lerp(outerColor, (t - 0.6) / 0.4);
        }
        const flick = 0.82 + Math.random() * 0.36;
        vortexColors[i * 3] = tmp.r * flick;
        vortexColors[i * 3 + 1] = tmp.g * flick;
        vortexColors[i * 3 + 2] = tmp.b * flick;

        vortexSizes[i] = 0.7 + Math.pow(Math.random(), 2.4) * 2.1;
        vortexPhases[i] = Math.random();
      }

      const vortexGeo = track(new THREE.BufferGeometry());
      vortexGeo.setAttribute("position", new THREE.BufferAttribute(vortexPositions, 3));
      vortexGeo.setAttribute("aColor", new THREE.BufferAttribute(vortexColors, 3));
      vortexGeo.setAttribute("aSize", new THREE.BufferAttribute(vortexSizes, 1));
      vortexGeo.setAttribute("aPhase", new THREE.BufferAttribute(vortexPhases, 1));

      const vortexMat = track(
        new THREE.ShaderMaterial({
          uniforms,
          vertexShader,
          fragmentShader,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      const vortex = new THREE.Points(vortexGeo, vortexMat);
      scene.add(vortex);

      /* ---------- 远景星野：填满视口边缘，杜绝黑场 ---------- */
      const starPositions = new Float32Array(STAR_COUNT * 3);
      const starColors = new Float32Array(STAR_COUNT * 3);
      const starSizes = new Float32Array(STAR_COUNT);
      const starPhases = new Float32Array(STAR_COUNT);
      const starTint = new THREE.Color("#cdd7ff");
      for (let i = 0; i < STAR_COUNT; i++) {
        // 大球壳分布（相机在球内），保证任何视线方向都有星
        const r = 26 + Math.random() * 26;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPositions[i * 3 + 1] = r * Math.cos(phi) * 0.7;
        starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        const b = 0.35 + Math.random() * 0.65;
        starColors[i * 3] = starTint.r * b;
        starColors[i * 3 + 1] = starTint.g * b;
        starColors[i * 3 + 2] = starTint.b * b;
        starSizes[i] = 0.5 + Math.random() * 1.4;
        starPhases[i] = Math.random();
      }
      const starGeo = track(new THREE.BufferGeometry());
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
      starGeo.setAttribute("aColor", new THREE.BufferAttribute(starColors, 3));
      starGeo.setAttribute("aSize", new THREE.BufferAttribute(starSizes, 1));
      starGeo.setAttribute("aPhase", new THREE.BufferAttribute(starPhases, 1));
      const starMat = track(
        new THREE.ShaderMaterial({
          uniforms,
          vertexShader,
          fragmentShader,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      scene.add(new THREE.Points(starGeo, starMat));

      /* ---------- 星云雾：canvas 径向辉光贴图，反向慢转，填充并点亮暗部 ---------- */
      const makeGlowTexture = track(((): CanvasTexture => {
        const size = 256;
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const ctx = c.getContext("2d")!;
        const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.35, "rgba(255,255,255,0.42)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(c);
      })());

      const nebulae: Sprite[] = [];
      const nebulaConfigs: Array<[string, number, [number, number, number], number]> = [
        ["#3730a3", 13, [-3.2, 1.1, -2.4], 0.021],
        ["#0e7490", 11, [3.4, -0.8, -3.0], -0.017],
        ["#4c1d95", 9, [0.6, 2.2, -4.2], 0.013],
      ];
      for (const [color, scale, pos, spin] of nebulaConfigs) {
        const mat = track(
          new THREE.SpriteMaterial({
            map: makeGlowTexture,
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.16,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        );
        const sprite = new THREE.Sprite(mat);
        sprite.scale.setScalar(scale);
        sprite.position.set(...pos);
        sprite.userData.spin = spin;
        scene.add(sprite);
        nebulae.push(sprite);
      }

      /* ---------- 尺寸 / 可见性 / 上下文丢失 ---------- */
      const resize = () => {
        const w = canvas.clientWidth || 1;
        const h = canvas.clientHeight || 1;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);

      let visible = true;
      const io = new IntersectionObserver((entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      });
      io.observe(canvas);

      const onContextLost = (e: Event) => {
        e.preventDefault();
        visible = false; // 停渲染，等待 restored 重建
      };
      canvas.addEventListener("webglcontextlost", onContextLost, false);

      /* ---------- 渲染循环（时间驱动：永续旋转无缝） ---------- */
      const clock = new THREE.Clock();
      let raf = 0;

      const renderFrame = () => {
        const t = clock.getElapsedTime();
        uniforms.uTime.value = t;
        vortex.rotation.y = t * 0.12; // 涡轮星轮：匀速永续旋转（数学连续，无接缝）
        for (const n of nebulae) n.material.rotation += (n.userData.spin as number) * 0.016;
        renderer.render(scene, camera);
      };

      if (reducedMotion) {
        // 减动效：只渲染静态单帧（星轮定格式依然成立）
        renderFrame();
        requestAnimationFrame(() => setReady(true));
      } else {
        const loop = () => {
          raf = requestAnimationFrame(loop);
          if (!visible || document.hidden) return;
          renderFrame();
        };
        raf = requestAnimationFrame(loop);
        requestAnimationFrame(() => setReady(true));
      }

      /* ---------- 上下文恢复：three 自动恢复 GPU 资源，恢复动画循环即可 ---------- */
      const onContextRestored = () => {
        visible = true;
      };
      canvas.addEventListener("webglcontextrestored", onContextRestored, false);

      /* ---------- 清理：释放一切 ---------- */
      teardown = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        canvas.removeEventListener("webglcontextlost", onContextLost);
        canvas.removeEventListener("webglcontextrestored", onContextRestored);
        for (const d of disposables) d.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      teardown();
    };
  }, []);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#050810]">
      {/* 兜底海报：Three 包加载完成前的首屏（加载后淡出） */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/uploads/bg-starfield.jpg"
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
