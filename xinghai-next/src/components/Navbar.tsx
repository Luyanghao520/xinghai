"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/** 全站导航信息架构（与旧栈页面一一对应，后续增删只改这个数组） */
const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/about", label: "社团介绍" },
  { href: "/recruit", label: "招新报名" },
  { href: "/performances", label: "演出作品" },
  { href: "/members", label: "成员" },
  { href: "/contact", label: "联系我们" },
] as const;

function isActive(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

/** 顶部导航栏：桌面端横排 + 移动端折叠菜单（样式占位，视觉待设计阶段精修） */
export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <nav
        aria-label="主导航"
        className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-primary-strong"
          onClick={() => setMenuOpen(false)}
        >
          <span aria-hidden className="text-accent">
            ★
          </span>
          星海艺术团
        </Link>

        {/* 桌面端导航 */}
        <ul className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(pathname, href) ? "page" : undefined}
                className={
                  isActive(pathname, href)
                    ? "font-medium text-primary"
                    : "text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* 移动端菜单开关（图标待设计阶段替换为汉堡图标） */}
        <button
          type="button"
          className="rounded-lg border border-border px-3 py-1.5 text-sm md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "关闭" : "菜单"}
        </button>
      </nav>

      {/* 移动端导航面板 */}
      {menuOpen && (
        <ul
          id="mobile-menu"
          className="space-y-1 border-t border-border bg-surface px-4 py-3 md:hidden"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMenuOpen(false)}
                className={
                  isActive(pathname, href)
                    ? "block rounded-lg bg-primary-soft px-3 py-2 font-medium text-primary"
                    : "block rounded-lg px-3 py-2 text-muted-foreground hover:bg-background hover:text-foreground"
                }
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
