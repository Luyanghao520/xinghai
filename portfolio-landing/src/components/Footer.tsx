import { useEffect, useRef } from "react";
import gsap from "gsap";

const MARQUEE_UNIT = "星海艺术团 · XINGHAI ART TROUPE · 2026 招新进行中";

/* 旧系统全部入口（Flask 同域部署，相对路径）—— 一个都不删 */
const ENTRY_GROUPS = [
  {
    title: "新生入口",
    sub: "For Freshmen",
    items: [
      { label: "招新报名", href: "/recruit" },
      { label: "注册申请", href: "/register" },
    ],
  },
  {
    title: "成员入口",
    sub: "For Members",
    items: [
      { label: "成员登录", href: "/login" },
      { label: "内部工作台", href: "/work" },
    ],
  },
  {
    title: "管理入口",
    sub: "For Admins",
    items: [
      { label: "招新管理", href: "/admin?key=xinghai2026" },
      { label: "CMS 后台", href: "/cms" },
    ],
  },
];

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
      className="relative overflow-hidden bg-gradient-to-b from-transparent to-bg/70 pb-8 pt-16 md:pb-12 md:pt-20"
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

          {/* 招新网页入口 */}
          <a
            href="/recruit"
            className="g-hover inline-flex items-center gap-2 rounded-full bg-text-primary px-8 py-4 text-sm font-semibold text-bg transition-all duration-300 hover:scale-105"
          >
            前往招新网页 <span aria-hidden>↗</span>
          </a>
        </div>

        {/* 系统入口 —— 招新 / 注册 / 登录 / 工作台 / 后台，全部保留 */}
        <div className="mt-16 px-6 md:mt-24">
          <div className="mx-auto max-w-[960px]">
            <p className="mb-8 text-center text-xs uppercase tracking-[0.3em] text-muted">
              System Access · 系统入口
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {ENTRY_GROUPS.map((group) => (
                <div
                  key={group.title}
                  className="rounded-3xl border border-stroke bg-surface/70 p-6 backdrop-blur-md"
                >
                  <p className="text-sm font-semibold text-text-primary">
                    {group.title}
                    <span className="ml-2 text-[10px] font-normal uppercase tracking-[0.2em] text-muted">
                      {group.sub}
                    </span>
                  </p>
                  <ul className="mt-4 flex flex-col gap-2">
                    {group.items.map((item) => (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors duration-200 hover:text-text-primary"
                        >
                          <span className="h-px w-3 bg-stroke transition-all duration-200 group-hover:w-5 group-hover:bg-text-primary" />
                          {item.label}
                          <span
                            aria-hidden
                            className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          >
                            ↗
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
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
