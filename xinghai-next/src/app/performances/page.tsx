import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "演出作品",
  description: "星海艺术团历年演出回顾、原创作品与精彩瞬间（内容待填充）",
};

/** 演出/作品展示（占位页）：作品卡片网格，数据待内容迁移后接入 */
export default function PerformancesPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold">演出作品</h1>
      <p className="mt-2 text-muted-foreground">
        本页为占位页——演出与作品内容待填充，以下为占位卡片。
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <Card key={n}>
            <div
              aria-hidden
              className="mb-4 flex h-36 items-center justify-center rounded-lg bg-primary-soft text-sm text-primary"
            >
              封面图占位
            </div>
            <h2 className="font-semibold">作品标题待填充 {n}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              简介、演出时间与剧照等内容待填充。
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
