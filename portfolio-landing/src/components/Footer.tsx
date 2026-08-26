import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CONSULT_QR } from "../lib/data";

const MARQUEE_UNIT = "星海艺术团 · XINGHAI ART TROUPE · 2026 招新进行中";

const SOCIALS = ["微信公众号", "B站", "小红书", "抖音"];

export default function Footer() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  /* Seamless marquee: two identical halves, track slides -50% */
  useEffect(() => {
    const tween = gsap.to(marqueeRef.current, {
      xPercent: -50,
      duration: 40,
      ease: "none",
      repeat: -1,
    });
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <footer
      id="contact"
      className="relative overflow-hidden bg-bg/80 pb-8 pt-16 md:pb-12 md:pt-20"
    >
      <div className="relative z-10">
        {/* GSAP marquee */}
        <div
          className="select-none overflow-hidden whitespace-nowrap"
          aria-hidden
        >
          <div ref={marqueeRef} className="inline-flex will-change-transform">
            {[0, 1].map((halfIdx) => (
              <span
                key={halfIdx}
                className="pr-4 font-display text-[clamp(2.5rem,8vw,7rem)] italic leading-none text-text-primary/90"
              >
                {Array.from({ length: 4 }, () => MARQUEE_UNIT).join(
                  "  ✦  "
                )}
                <span className="mx-6 not-italic text-muted">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center px-6 text-center md:mt-24">
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-muted">
            Join Us · 加入我们
          </p>

          <p className="mb-10 max-w-md text-sm leading-relaxed text-muted md:text-base">
            无论你想唱歌、跳舞、演奏、演戏还是主持——
            <br />
            舞台已经搭好，只等你来。
          </p>

          {/* 招新咨询群二维码 */}
          <a
            href="https://Luyanghao.pythonanywhere.com/recruit"
            target="_blank"
            rel="noreferrer"
            className="g-hover group inline-flex flex-col items-center gap-4 rounded-3xl border border-stroke bg-surface/60 p-6 transition-all duration-300 hover:scale-[1.03] hover:border-transparent md:p-8"
          >
            <span className="rounded-2xl bg-white p-2 shadow-lg shadow-black/30 transition-transform duration-300 group-hover:scale-[1.04]">
              <img
                src={CONSULT_QR}
                alt="2026 招新咨询群二维码"
                loading="lazy"
                className="h-36 w-36 object-contain md:h-44 md:w-44"
              />
            </span>
            <span className="text-xs tracking-[0.25em] text-text-primary">
              扫码进入 2026 招新咨询群
            </span>
            <span className="text-[11px] text-muted">
              或前往招新主页了解全部部门 ↗
            </span>
          </a>
        </div>

        {/* Footer bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 px-6 pt-6 text-xs text-muted sm:flex-row md:mt-24 lg:px-16">
          <ul className="flex items-center gap-5">
            {SOCIALS.map((social) => (
              <li key={social}>
                <a
                  href="#contact"
                  className="transition-colors duration-200 hover:text-text-primary"
                >
                  {social}
                </a>
              </li>
            ))}
          </ul>

          <p className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            2026 招新进行中
          </p>

          <p className="tabular-nums">© 2026 星海艺术团 · 上海立信会计金融学院</p>
        </div>
      </div>
    </footer>
  );
}
