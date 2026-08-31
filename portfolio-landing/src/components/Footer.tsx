import { useState } from "react";

/**
 * Footer 8（React Bits Pro blocks/footer/footer-8）同款结构的免费自研版：
 * 居中极简 —— 品牌块 → 一句 tagline → 主 CTA → 社交图标行 → 链接列 → 底栏。
 * 旧系统全部入口（Flask 同域部署，相对路径）一个都不删。
 */

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

/* Lucide 线性图标（本地内联 SVG，沿用全站 v3.1 禁 emoji 约定） */
const SOCIAL_ICONS: { name: string; label: string; path: React.ReactNode }[] = [
  {
    name: "wechat",
    label: "微信公众号",
    path: (
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    ),
  },
  {
    name: "bilibili",
    label: "B站",
    path: (
      <>
        <path d="M21 11.5a5.5 5.5 0 0 0-5.5-5.5h-7A5.5 5.5 0 0 0 3 11.5v3A5.5 5.5 0 0 0 8.5 20h7a5.5 5.5 0 0 0 5.5-5.5Z" />
        <path d="m7.5 3.5 2.5 2.5M16.5 3.5 14 6M9 13.5v2M15 13.5v2" />
      </>
    ),
  },
  {
    name: "xiaohongshu",
    label: "小红书",
    path: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </>
    ),
  },
  {
    name: "douyin",
    label: "抖音",
    path: (
      <>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </>
    ),
  },
];

export default function Footer() {
  const [copied, setCopied] = useState(false);

  return (
    <footer
      id="contact"
      className="relative border-t border-white/10 bg-gradient-to-b from-transparent to-bg/80"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-16 text-center md:py-20">
        {/* 品牌块 */}
        <a href="#home" className="group flex flex-col items-center gap-3">
          <span className="accent-gradient flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110">
            <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-bg">
              <span className="font-display text-lg leading-none text-text-primary">
                星
              </span>
            </span>
          </span>
          <span className="font-display text-2xl italic tracking-wide text-text-primary">
            星海艺术团
          </span>
          <span className="text-[10px] uppercase tracking-[0.35em] text-muted">
            Xinghai Art Troupe · 校团委指导
          </span>
        </a>

        {/* tagline + 主 CTA */}
        <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
          无论你想唱歌、跳舞、演奏、演戏还是主持——舞台已经搭好，只等你来。
        </p>
        <a
          href="/recruit"
          className="g-hover mt-7 inline-flex items-center gap-2 rounded-full bg-text-primary px-8 py-3.5 text-sm font-semibold text-bg transition-all duration-300 hover:scale-105"
        >
          前往招新网页 <span aria-hidden>↗</span>
        </a>

        {/* 社交图标行 */}
        <ul className="mt-9 flex items-center gap-3">
          {SOCIAL_ICONS.map((s) => (
            <li key={s.name}>
              <a
                href="#contact"
                title={s.label}
                aria-label={s.label}
                onClick={() => {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1800);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke text-muted transition-all duration-300 hover:border-text-primary/60 hover:text-text-primary"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {s.path}
                </svg>
              </a>
            </li>
          ))}
        </ul>
        <span
          aria-live="polite"
          className={`mt-2 text-[11px] text-muted transition-opacity duration-300 ${
            copied ? "opacity-70" : "opacity-0"
          }`}
        >
          平台账号即将上线，敬请期待
        </span>

        {/* 链接列：系统入口（全部保留） */}
        <div className="mt-12 grid w-full grid-cols-1 gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
          {ENTRY_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-text-primary">
                {group.title}
                <span className="ml-1.5 text-[9px] font-normal tracking-[0.2em] text-muted">
                  {group.sub}
                </span>
              </p>
              <ul className="flex flex-col items-center gap-2.5">
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

        {/* 底栏 */}
        <div className="mt-12 flex w-full flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-muted sm:flex-row">
          <p className="tabular-nums">© 2026 星海艺术团 · 上海立信会计金融学院</p>
          <p className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            2026 招新进行中
          </p>
        </div>
      </div>
    </footer>
  );
}
