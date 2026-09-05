import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "社团介绍",
  description: "星海艺术团的社团历史、组织架构与荣誉成就（内容待填充）",
};

/** 社团介绍（占位页）：内容待填充 */
export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold">社团介绍</h1>
      <p className="mt-2 text-muted-foreground">
        本页为占位页——社团介绍内容待填充。
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card>
          <h2 className="font-semibold">社团历史</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            内容待填充：成立时间、发展历程与大事记。
          </p>
        </Card>
        <Card>
          <h2 className="font-semibold">组织架构</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            内容待填充：各队/组别与部门设置介绍。
          </p>
        </Card>
        <Card>
          <h2 className="font-semibold">荣誉成就</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            内容待填充：获奖记录与代表性演出。
          </p>
        </Card>
      </div>
    </section>
  );
}
