import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LINKS = [
  { label: "首页", href: "#home" },
  { label: "风采", href: "#work" },
  { label: "加入我们", href: "#contact" },
];

/* 旧系统入口（Flask 同域部署，保持相对路径） */
const RECRUIT_URL = "/recruit";
const LOGIN_URL = "/login";

/* navbar-12 同语义：悬浮半透明胶囊，滚动即抬升（阴影+不透明度），移动端下拉菜单 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);

      // Lightweight scrollspy: pick the last section whose top passed mid-viewport
      const probe = window.scrollY + window.innerHeight / 2;
      let current = "#home";
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
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 md:pt-6">
      <nav
        className={`relative inline-flex items-center rounded-full border backdrop-blur-md transition-all duration-300 ${
          scrolled
            ? "border-white/15 bg-surface/90 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
            : "border-white/10 bg-surface/55"
        } px-2 py-2`}
      >
        {/* Logo */}
        <a
          href="#home"
          aria-label="回到顶部"
          className="group relative block h-9 w-9 shrink-0 overflow-hidden rounded-full accent-gradient transition-transform duration-300 hover:scale-110"
        >
          <span className="accent-gradient-reverse absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="absolute inset-[2px] flex items-center justify-center rounded-full bg-bg">
            <span className="font-display text-[13px] leading-none text-text-primary">
              星
            </span>
          </span>
        </a>

        {/* Divider */}
        <span className="mx-1 hidden h-5 w-px bg-stroke sm:block" />

        {/* Links */}
        <ul className="hidden items-center sm:flex">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={() => setActive(link.href)}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors duration-200 sm:px-4 sm:py-2 sm:text-sm ${
                  active === link.href
                    ? "bg-stroke/50 text-text-primary"
                    : "text-muted hover:bg-stroke/50 hover:text-text-primary"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <span className="mx-1 hidden h-5 w-px bg-stroke sm:block" />

        {/* 成员登录 —— 内部系统入口 */}
        <a
          href={LOGIN_URL}
          className="hidden rounded-full px-3 py-1.5 text-xs text-muted transition-colors duration-200 hover:bg-stroke/50 hover:text-text-primary sm:block sm:px-4 sm:py-2 sm:text-sm"
        >
          成员登录
        </a>

        {/* 招新报名 —— 主 CTA（跳转招新系统） */}
        <a
          href={RECRUIT_URL}
          className="group relative hidden rounded-full text-xs sm:inline-flex sm:text-sm"
        >
          <span className="accent-gradient absolute rounded-full opacity-90 transition-opacity duration-300 group-hover:opacity-100" style={{ inset: "0" }} />
          <span className="relative inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-semibold text-white transition-transform duration-200 group-hover:scale-105 sm:px-4 sm:py-2">
            招新报名
            <span aria-hidden>↗</span>
          </span>
        </a>

        {/* 移动端汉堡 */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "关闭菜单" : "打开菜单"}
          aria-expanded={open}
          className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-text-primary transition-colors duration-200 hover:bg-stroke/50 sm:hidden"
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* 移动端下拉菜单 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-4 right-4 top-[74px] z-50 rounded-2xl border border-white/10 bg-surface/95 p-2 shadow-[0_24px_64px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:hidden"
          >
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => {
                  setActive(link.href);
                  setOpen(false);
                }}
                className={`block rounded-xl px-4 py-3 text-sm transition-colors duration-200 ${
                  active === link.href
                    ? "bg-stroke/50 text-text-primary"
                    : "text-muted hover:bg-stroke/50 hover:text-text-primary"
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className="my-1 h-px bg-stroke" />
            <a
              href={LOGIN_URL}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm text-muted transition-colors duration-200 hover:bg-stroke/50 hover:text-text-primary"
            >
              成员登录
            </a>
            <a
              href={RECRUIT_URL}
              className="accent-gradient mt-1 flex items-center justify-center gap-1 rounded-xl px-4 py-3 text-sm font-semibold text-white"
            >
              招新报名 <span aria-hidden>↗</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
