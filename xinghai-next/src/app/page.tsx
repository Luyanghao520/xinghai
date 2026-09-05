import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { buttonStyles } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "星海艺术团",
  description: "星海艺术团官方网站——社团介绍、招新报名、演出作品与成员风采",
};

/** 首页（占位）：首屏 Hero + 三个内容入口卡片，文案与视觉待设计阶段填充 */
export default function HomePage() {
  return (
    <>
      {/* 首屏 Hero：正式设计阶段替换为旧栈首页的轮播/视频物料 */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="rounded-full bg-primary-soft px-3 py-1 text-sm text-primary">
            官网改版建设中 · 内容占位
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            星海艺术团
          </h1>
          <p className="max-w-2xl leading-7 text-muted-foreground">
            首页主标语占位：这里将放置一句体现社团气质的宣传语，
            以及社团介绍、招新节奏与演出作品的精华内容。
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/recruit" className={buttonStyles("primary", "lg")}>
              立即报名
            </Link>
            <Link href="/about" className={buttonStyles("outline", "lg")}>
              了解社团
            </Link>
          </div>
        </div>
      </section>

      {/* 内容入口：对应三个核心板块，均为占位卡片 */}
      <section
        aria-label="内容入口"
        className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6"
      >
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <h2 className="text-lg font-semibold">社团介绍</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              内容待填充：社团历史、组织架构与荣誉成就。
            </p>
            <Link
              href="/about"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              查看详情 →
            </Link>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">演出作品</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              内容待填充：历年演出回顾、原创作品与精彩瞬间。
            </p>
            <Link
              href="/performances"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              查看详情 →
            </Link>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">招新报名</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              内容待填充：招新安排与在线报名表单（接口已就绪）。
            </p>
            <Link
              href="/recruit"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              前往报名 →
            </Link>
          </Card>
        </div>
      </section>
    </>
  );
}
