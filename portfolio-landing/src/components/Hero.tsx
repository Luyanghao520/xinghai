import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Navbar from "./Navbar";

const ROLES = ["歌声", "舞步", "琴弦", "戏韵", "妙语"];
const TITLE = "星海艺术团".split("");

interface HeroProps {
  /** Gates the GSAP entrance until the loading screen is gone */
  ready: boolean;
}

export default function Hero({ ready }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [roleIndex, setRoleIndex] = useState(0);

  /* Rotating role word */
  useEffect(() => {
    const timer = window.setInterval(
      () => setRoleIndex((i) => (i + 1) % ROLES.length),
      2000
    );
    return () => window.clearInterval(timer);
  }, []);

  /* Entrance timeline — gated on the loading screen handing off */
  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".name-char",
        { opacity: 0, y: 90, rotate: 8 },
        { opacity: 1, y: 0, rotate: 0, duration: 1, stagger: 0.09, ease: "power4.out" },
        0.1
      ).fromTo(
        ".blur-in",
        { opacity: 0, y: 20, filter: "blur(10px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, stagger: 0.1 },
        0.55
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex min-h-[640px] h-screen items-center justify-center overflow-hidden"
    >
      <Navbar />

      {/* 中央文字区径向 scrim：只在标题区暗化，四周视频保持明亮通透 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,10,10,0.55)_0%,rgba(10,10,10,0.25)_45%,transparent_72%)]" />

      {/* Centered content — 背景由全局 FixedBackground 承担 */}
      <div className="relative z-10 flex flex-col items-center px-4 pb-16 text-center">
        <p className="blur-in mb-8 text-xs uppercase tracking-[0.3em] text-muted">
          Lixin · Xinghai Art Troupe
        </p>

        <h1
          className="mb-6 font-display text-6xl italic leading-[0.9] tracking-tight text-text-primary md:text-8xl lg:text-9xl"
          aria-label="星海艺术团"
        >
          {TITLE.map((ch, i) => (
            <span key={i} aria-hidden className="name-char inline-block">
              {ch}
            </span>
          ))}
        </h1>

        <p className="blur-in mb-6 text-base text-muted md:text-lg">
          以{" "}
          <span
            key={roleIndex}
            className="animate-role-fade-in inline-block font-display italic text-text-primary"
          >
            {ROLES[roleIndex]}
          </span>{" "}
          为名，聚合成海。
        </p>

        <p className="blur-in mb-12 max-w-md text-sm leading-relaxed text-muted md:text-base">
          迎新晚会、十佳歌手、毕业季音乐会——校园里大大小小的舞台，都有星海人的身影。2026
          级的你，要不要成为这束光的一部分？
        </p>

        <div className="blur-in inline-flex flex-wrap justify-center gap-4">
          <a
            href="#gallery"
            className="g-hover rounded-full bg-text-primary px-7 py-3.5 text-sm text-bg transition-all duration-300 hover:scale-105 hover:bg-bg hover:text-text-primary"
          >
            观看风采
          </a>
          <a
            href="/recruit"
            className="g-hover rounded-full border-2 border-stroke bg-bg/70 px-7 py-3.5 text-sm text-text-primary backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-transparent"
          >
            加入我们 ↗
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="blur-in absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-[0.2em] text-muted">
          Scroll
        </span>
        <span className="relative block h-10 w-px overflow-hidden bg-stroke">
          <span className="animate-scroll-down absolute inset-x-0 top-0 block h-full bg-text-primary/80" />
        </span>
      </div>
    </section>
  );
}
