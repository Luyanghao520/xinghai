import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "成员",
  description: "星海艺术团成员风采（内容待填充）",
};

/** 成员页（占位）：成员卡片网格，数据待 members 库迁移后接入 */
export default function MembersPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold">成员</h1>
      <p className="mt-2 text-muted-foreground">
        本页为占位页——成员数据待从旧库迁移，以下为占位卡片。
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <Card key={n} className="text-center">
            <div
              aria-hidden
              className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary"
            >
              ★
            </div>
            <h2 className="font-semibold">成员姓名待填充 {n}</h2>
            <p className="mt-1 text-sm text-muted-foreground">组别/职位待填充</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
