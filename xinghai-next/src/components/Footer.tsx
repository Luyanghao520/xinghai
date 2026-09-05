import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "社团介绍" },
  { href: "/recruit", label: "招新报名" },
  { href: "/performances", label: "演出作品" },
  { href: "/members", label: "成员" },
  { href: "/contact", label: "联系我们" },
] as const;

/** 页脚：三栏占位布局（社团简介 / 快速导航 / 联系方式），文案待内容编辑填充 */
export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 text-lg font-semibold text-primary-strong">
            <span aria-hidden className="text-accent">
              ★
            </span>
            星海艺术团
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            社团简介占位：这里将放置一段 50 字以内的社团一句话介绍。
          </p>
        </div>

        <div>
          <p className="font-medium">快速导航</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {FOOTER_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="transition-colors hover:text-foreground">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-medium">联系方式（占位）</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li>邮箱：contact@example.com（待替换）</li>
            <li>地址：待填充</li>
            <li>QQ 群：待填充</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} 星海艺术团 · 新版官网脚手架（内容待填充）
      </div>
    </footer>
  );
}
