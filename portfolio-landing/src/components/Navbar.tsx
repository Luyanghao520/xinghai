import { useEffect, useState } from "react";

const LINKS = [
  { label: "首页", href: "#home" },
  { label: "风采", href: "#work" },
  { label: "加入我们", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 100);

      // Lightweight scrollspy
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
        className={`inline-flex items-center rounded-full border border-white/10 bg-surface px-2 py-2 backdrop-blur-md transition-shadow duration-300 ${
          scrolled ? "shadow-md shadow-black/10" : ""
        }`}
      >
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

        <span className="mx-1 hidden h-5 w-px bg-stroke sm:block" />

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

        <span className="mx-1 hidden h-5 w-px bg-stroke sm:block" />

        <a
          href="#contact"
          className="group relative inline-flex rounded-full text-xs sm:text-sm"
        >
          <span
            className="accent-gradient absolute rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ inset: "-2px" }}
          />
          <span className="relative inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-text-primary backdrop-blur-md transition-colors duration-200 group-hover:text-white sm:px-4 sm:py-2">
            联系我们
            <span aria-hidden>↗</span>
          </span>
        </a>
      </nav>
    </header>
  );
}
