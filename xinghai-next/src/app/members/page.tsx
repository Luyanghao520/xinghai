import type { Metadata } from "next";
import MemberRoster, { type MemberView } from "@/components/MemberRoster";
import { Card } from "@/components/ui/Card";
import { listMembers } from "@/lib/db";

export const metadata: Metadata = {
  title: "成员",
  description: "星海艺术团在籍成员名册——趣味姓氏图与全团成员一览",
};

// 成员数据来自数据库，迁移/更新后无需重新构建即可生效
export const dynamic = "force-dynamic";

/** 成员页：在籍成员总览（趣味姓氏图 + 全团名册，不分团队）。
 * 公开页只展示姓名/届别/职务/特长，不展示任何联系方式。 */
export default async function MembersPage() {
  const rows = await listMembers();
  const members: MemberView[] = rows.map((m) => ({
    id: m.id,
    name: m.name,
    grade: m.grade ?? "—",
    position: m.position ?? "成员",
    skill: m.skill ?? "",
  }));

  if (members.length === 0) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-bold">在籍成员</h1>
        <p className="mt-2 text-muted-foreground">
          星海艺术团的现任成员名单（联系方式仅限后台可见，不在官网公开）。
        </p>
        <Card className="mt-8">
          <h2 className="font-semibold">成员数据待迁移</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            把 PythonAnywhere 导出的 <code className="rounded bg-background px-1">members.db</code>{" "}
            放到仓库根目录，运行 <code className="rounded bg-background px-1">npm run migrate</code>{" "}
            即可在本页展示成员名单；本地预览也可以运行{" "}
            <code className="rounded bg-background px-1">npm run seed:demo</code> 生成演示数据。
          </p>
        </Card>
      </section>
    );
  }

  const hasDemo = rows.some((r) => r.source === "demo");

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold">在籍成员</h1>
      <p className="mt-2 text-muted-foreground">
        星海艺术团全体在籍成员一览（联系方式仅限后台可见，不在官网公开）。
      </p>

      {hasDemo && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">
          当前包含演示成员数据（正式数据迁移后将自动替换；清除方式：
          <code className="mx-1 rounded bg-amber-100 px-1">npm run seed:demo -- --clean</code>）
        </p>
      )}

      <MemberRoster members={members} />
    </section>
  );
}
