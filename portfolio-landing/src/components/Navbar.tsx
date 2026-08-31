import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Navigation 15（React Bits Pro blocks/navigation/navigation-15）同款语义的免费自研版：
 * quiet hairline 导航（顶部全宽发丝线，滚动后玻璃抬升）+ 悬停下划线游走指示器
 * + 移动端右侧滑入抽屉。滚动 spy 沿用 v2 逻辑。
 */

const LINKS = [
  { label: "关于星海", href: "#about" },
  { label: "风采展示", href: "#gallery" },
  { label: "团队全景", href: "#teams" },
];

/* 旧系统入口（Flask 同域部署，保持相对路径） */
const RECRUIT_URL = "/recruit";
const LOGIN_URL = "/login";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");

  /* ---- 游走下划线：静止时停在 active 链接，悬停时滑向目标 ---- */
  const listRef = useRef<HTMLUListElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [bar, setBar] = useState({ left: 0, width: 0, opacity: 0 });

  useLayoutEffect(() => {
    const idx =
      hover !== null ? hover : LINKS.findIndex((l) => l.href === active);
    const el = idx >= 0 ? linkRefs.current[idx] : null;
    const list = listRef.current;
    if (!el || !list) {
      setBar((b) => ({ ...b, opacity: 0 }));
      return;
    }
    const lr = list.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setBar({ left: r.left - lr.left, width: r.width, opacity: 1 });
  }, [hover, active]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);

      // Lightweight scrollspy: pick the last section whose top passed mid-viewport
      const probe = window.scrollY + window.innerHeight / 2;
      let current = "";
      for (const link of LINKS) {
        const el = document.querySelector(link.href);
        if (el && (el as HTMLElement).offsetTop <= probe) {
          current = link.href;
        }
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* 抽屉打开时锁滚动 + Esc 关闭 */
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-bg/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-[68px] md:px-8">
        {/* 品牌 */}
        <a href="#home" className="group flex items-center gap-3">
          <span className="accent-gradient relative block h-9 w-9 shrink-0 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-110">
            <span className="accent-gradient-reverse absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="absolute inset-[2px] flex items-center justify-center rounded-full bg-bg">
              <span className="font-display text-[13px] leading-none text-text-primary">
                星
              </span>
            </span>
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-base italic tracking-wide text-text-primary">
              星海艺术团
            </span>
            <span className="mt-1 hidden text-[9px] uppercase tracking-[0.3em] text-muted sm:block">
              Xinghai Art Troupe
            </span>
          </span>
        </a>

        {/* 桌面链接 + 游走下划线 */}
        <div className="hidden items-center gap-1 md:flex">
          <ul
            ref={listRef}
            className="relative flex items-center"
            onMouseLeave={() => setHover(null)}
          >
            {LINKS.map((link, i) => (
              <li key={link.label}>
                <a
                  ref={(el) => {
                    linkRefs.current[i] = el;
                  }}
                  href={link.href}
                  onMouseEnter={() => setHover(i)}
                  onClick={() => setActive(link.href)}
                  className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                    active === link.href
                      ? "text-text-primary"
                      : "text-muted hover:text-text-primary"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
            {/* 游走下划线指示器：悬停时滑向目标，静止时停回 active */}
            <span
              aria-hidden
              className="accent-gradient absolute bottom-0 h-px transition-all duration-300 ease-out"
              style={{
                left: bar.left,
                width: bar.width,
                opacity: bar.opacity,
              }}
            />
          </ul>

          <span className="mx-2 h-5 w-px bg-stroke" />

          <a
            href={LOGIN_URL}
            className="px-4 py-2 text-sm text-muted transition-colors duration-200 hover:text-text-primary"
          >
            成员登录
          </a>

          <a
            href={RECRUIT_URL}
            className="group relative ml-2 inline-flex rounded-full"
          >
            <span
              className="accent-gradient absolute inset-0 rounded-full opacity-90 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden
            />
            <span className="relative inline-flex items-center gap-1 rounded-full px-5 py-2 text-sm font-semibold text-white transition-transform duration-200 group-hover:scale-105">
              招新网页 <span aria-hidden>↗</span>
            </span>
          </a>
        </div>

        {/* 移动端汉堡 */}
        <button
          onClick={() => setOpen(true)}
          aria-label="打开菜单"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text-primary transition-colors duration-200 hover:bg-stroke/50 md:hidden"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* 移动端滑入抽屉（右侧） */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              className="fixed right-0 top-0 z-[70] flex h-full w-[80%] max-w-xs flex-col border-l border-white/10 bg-surface/95 px-6 pb-8 pt-5 backdrop-blur-xl md:hidden"
              role="dialog"
              aria-label="站内导航"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-base italic text-text-primary">
                  星海艺术团
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="关闭菜单"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-stroke/50 hover:text-text-primary"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <ul className="mt-8 flex flex-col">
                {LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.06, duration: 0.3 }}
                  >
                    <a
                      href={link.href}
                      onClick={() => {
                        /* 抽屉开着时 body 锁滚动：必须先解锁，锚点跳转才生效 */
                        document.body.style.overflow = "";
                        setActive(link.href);
                        setOpen(false);
                      }}
                      className={`flex items-center justify-between border-b border-white/5 py-4 text-base transition-colors duration-200 ${
                        active === link.href
                          ? "text-text-primary"
                          : "text-muted hover:text-text-primary"
                      }`}
                    >
                      {link.label}
                      <span className="accent-gradient h-px w-6 opacity-0 transition-opacity duration-200 data-[on='1']:opacity-100" data-on={active === link.href ? "1" : "0"} />
                    </a>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-auto flex flex-col gap-3">
                <a
                  href={LOGIN_URL}
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-stroke py-3 text-center text-sm text-muted transition-colors duration-200 hover:border-text-primary/50 hover:text-text-primary"
                >
                  成员登录
                </a>
                <a
                  href={RECRUIT_URL}
                  className="accent-gradient flex items-center justify-center gap-1 rounded-full py-3 text-sm font-semibold text-white"
                >
                  招新网页 <span aria-hidden>↗</span>
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
