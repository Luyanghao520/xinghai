import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { buttonStyles } from "@/components/ui/Button";
import {
  carousel,
  heroWelcome,
  performTeams,
  sellingPoints,
  teachers,
} from "@/lib/site-content";

export const metadata: Metadata = {
  title: "星海艺术团",
  description:
    "上海立信会计金融学院星海艺术团——迎新晚会、十佳歌手、毕业季音乐会背后的中坚力量，2026 招新进行中",
};

/** 首页：全屏大图 Hero 需下滑才能看到内容模块（内容来自 content.json 移植） */
export default function HomePage() {
  return (
    <>
      {/* ===== 全屏首屏（100vh，无内容模块） ===== */}
      <section className="relative h-[calc(100vh-4rem)] min-h-[560px] w-full overflow-hidden">
        <Image
          src="/uploads/bg-starfield.jpg"
          alt="星海艺术团舞台背景"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70" />

        <div className="relative mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center gap-6 px-4 text-center text-white sm:px-6">
          <span className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm backdrop-blur">
            上海立信会计金融学院 · 星海艺术团 · 2026 招新
          </span>
          <h1 className="text-5xl font-bold tracking-wide drop-shadow-lg sm:text-6xl">
            星海艺术团
          </h1>
          <p
            className="max-w-2xl leading-7 text-white/90 drop-shadow"
            dangerouslySetInnerHTML={{ __html: heroWelcome }}
          />
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/recruit"
              className={`${buttonStyles("primary", "lg")} shadow-lg`}
            >
              立即报名
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-6 py-3 text-base font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              了解社团
            </Link>
          </div>
        </div>

        {/* 下滑提示：内容模块在首屏之外，需滚动查看 */}
        <Link
          href="/#highlights"
          aria-label="向下滚动查看更多内容"
          className="absolute inset-x-0 bottom-6 mx-auto flex w-fit animate-bounce flex-col items-center gap-1 text-white/80 transition-colors hover:text-white"
        >
          <span className="text-xs tracking-widest">向下滑动</span>
          <span aria-hidden className="text-xl">
            ⌄
          </span>
        </Link>
      </section>

      {/* ===== 以下模块均在首屏之外（滚动可见） ===== */}

      {/* 四大卖点 */}
      <section
        id="highlights"
        aria-label="为什么加入星海"
        className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 py-16 sm:px-6"
      >
        <h2 className="text-center text-2xl font-bold">为什么加入星海</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sellingPoints.map((p) => (
            <Card key={p.title} className="text-center">
              <p aria-hidden className="text-3xl">
                {p.ico}
              </p>
              <h3 className="mt-3 font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{p.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 演出精选（图片来自旧站真实演出照） */}
      <section
        aria-label="演出精选"
        className="border-y border-border bg-surface py-16"
      >
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold">演出精选</h2>
            <Link
              href="/performances"
              className="text-sm font-medium text-primary hover:underline"
            >
              全部作品 →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {carousel.slice(0, 3).map((item) => (
              <Link
                key={item.img}
                href="/performances"
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border"
              >
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                  <p className="text-sm font-semibold">{item.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 十大方向速览 */}
      <section
        aria-label="部门方向"
        className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold">总有一个方向属于你</h2>
          <Link href="/about#org" className="text-sm font-medium text-primary hover:underline">
            组织架构 →
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {[...performTeams.slice(0, 7), ...performTeams.slice(7)].map((t) => (
            <Link
              key={t.name}
              href="/about#org"
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <span aria-hidden className="mr-1.5">
                {t.ico}
              </span>
              {t.name}
            </Link>
          ))}
        </div>
      </section>

      {/* 师资 */}
      <section
        aria-label="指导老师"
        className="border-t border-border bg-surface py-16"
      >
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold">师资力量</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {teachers.map((t) => (
              <Card key={t.role}>
                <p className="text-xs font-medium text-accent">{t.role}</p>
                <h3 className="mt-1 text-lg font-semibold">{t.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 加入引导 */}
      <section
        aria-label="加入我们"
        className="mx-auto w-full max-w-5xl px-4 py-16 text-center sm:px-6"
      >
        <h2 className="text-2xl font-bold">我们，招新啦</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          三步加入星海：注册申请账号 → 填写报名表 → 等待主席团审核。
          全程可在「我的报名」里跟踪进度。
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/register" className={buttonStyles("primary", "lg")}>
            注册账号
          </Link>
          <Link href="/recruit" className={buttonStyles("outline", "lg")}>
            填写报名表
          </Link>
        </div>
      </section>
    </>
  );
}
