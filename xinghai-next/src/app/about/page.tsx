import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { buttonStyles } from "@/components/ui/Button";
import {
  adminTeams,
  chair,
  heroWelcome,
  honors,
  performTeams,
  sellingPoints,
  viceChairs,
} from "@/lib/site-content";

export const metadata: Metadata = {
  title: "社团介绍",
  description:
    "星海艺术团组织架构：主席团、八大表演团队与三大行政部门；连续三届全国大学生艺术展演一等奖",
};

/**
 * 社团介绍页：先看内容（简介→架构→荣誉→师资），最后才是「三步加入」引导区。
 * 全页无直接弹出的信息填写表单——报名表单仅通过底部按钮主动进入。
 */
export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      {/* 一、我们是谁（引入环节） */}
      <h1 className="text-3xl font-bold">社团介绍</h1>
      <p
        className="mt-4 max-w-3xl leading-7 text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: heroWelcome }}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sellingPoints.map((p) => (
          <Card key={p.title} className="text-center">
            <p aria-hidden className="text-2xl">
              {p.ico}
            </p>
            <h2 className="mt-2 font-semibold">{p.title}</h2>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{p.text}</p>
          </Card>
        ))}
      </div>

      {/* 二、组织架构 */}
      <h2 id="org" className="mt-16 scroll-mt-20 text-2xl font-bold">
        组织架构
      </h2>
      <p className="mt-2 text-muted-foreground">
        主席团统筹全局，八大表演团队撑起台前，三大行政部门保障幕后。
      </p>

      {/* 主席团 */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="border-primary/30 bg-primary-soft/40 text-center">
          <p aria-hidden className="text-3xl">
            {chair.ico}
          </p>
          <h3 className="mt-2 font-semibold text-primary-strong">{chair.title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{chair.desc}</p>
        </Card>
        {viceChairs.map((v) => (
          <Card key={v.title} className="text-center">
            <p aria-hidden className="text-3xl">
              {v.ico}
            </p>
            <h3 className="mt-2 font-semibold">{v.title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{v.desc}</p>
          </Card>
        ))}
      </div>

      {/* 表演团队 */}
      <h3 className="mt-10 font-semibold">表演团队（台前）</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {performTeams.map((t) => (
          <Card key={t.name}>
            <p aria-hidden className="text-2xl">
              {t.ico}
            </p>
            <h4 className="mt-2 font-semibold">{t.name}</h4>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{t.full}</p>
          </Card>
        ))}
      </div>

      {/* 行政部门 */}
      <h3 className="mt-10 font-semibold">行政部门（幕后）</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {adminTeams.map((t) => (
          <Card key={t.name}>
            <p aria-hidden className="text-2xl">
              {t.ico}
            </p>
            <h4 className="mt-2 font-semibold">{t.name}</h4>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{t.full}</p>
          </Card>
        ))}
      </div>

      {/* 三、荣誉成就 */}
      <h2 id="honor" className="mt-16 scroll-mt-20 text-2xl font-bold">
        荣誉成就
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {honors.map((h) => (
          <Card key={h.title}>
            <p aria-hidden className="text-2xl">
              {h.ico}
            </p>
            <h3 className="mt-2 font-semibold">{h.title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{h.text}</p>
          </Card>
        ))}
      </div>
      <div className="relative mt-6 aspect-[21/9] overflow-hidden rounded-2xl border border-border">
        <Image
          src="/uploads/showcase/sc09.jpg"
          alt="《千手观音》舞台剧照"
          fill
          sizes="(max-width: 1024px) 100vw, 960px"
          className="object-cover"
        />
      </div>

      {/* 四、三步加入引导（过渡到报名表单，而非直接弹出） */}
      <div
        id="join"
        className="mt-16 scroll-mt-20 rounded-2xl border border-primary/20 bg-primary-soft/40 p-8 text-center"
      >
        <h2 className="text-2xl font-bold">心动了？三步加入星海</h2>
        <div className="mx-auto mt-8 grid max-w-2xl gap-4 text-left sm:grid-cols-3">
          {[
            { step: "1", title: "注册申请账号", text: "学号 + 密码，30 秒完成。" },
            { step: "2", title: "填写报名表", text: "选好意向方向，留下联系方式。" },
            { step: "3", title: "等待审核", text: "「我的报名」里实时看进度。" },
          ].map((s) => (
            <div key={s.step} className="rounded-xl bg-surface p-4 shadow-sm">
              <p className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {s.step}
              </p>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/register" className={buttonStyles("primary", "lg")}>
            第一步：注册账号
          </Link>
          <Link href="/recruit" className={buttonStyles("outline", "lg")}>
            我已注册，直接填表
          </Link>
        </div>
      </div>
    </section>
  );
}
