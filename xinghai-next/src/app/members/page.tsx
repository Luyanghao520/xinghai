import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { listAlumni, listMembers } from "@/lib/db";

export const metadata: Metadata = {
  title: "成员",
  description: "星海艺术团成员风采",
};

// 成员数据来自数据库，迁移/更新后无需重新构建即可生效
export const dynamic = "force-dynamic";

/** 成员页：读取迁移后的成员/校友数据（公开页只展示姓名、届别、部门、职务、特长，
 * 不展示手机号/微信/邮箱等联系方式）。数据为空时给出迁移指引。 */
export default async function MembersPage() {
  const [members, alumni] = await Promise.all([listMembers(), listAlumni()]);

  const grades = [...new Set(members.map((m) => m.grade ?? "未分级"))];

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold">成员</h1>
      <p className="mt-2 text-muted-foreground">
        星海艺术团的现任成员与毕业校友（联系方式仅限后台可见，不在官网公开）。
      </p>

      {members.length === 0 ? (
        <Card className="mt-8">
          <h2 className="font-semibold">成员数据待迁移</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            把 PythonAnywhere 导出的 <code className="rounded bg-background px-1">members.db</code>{" "}
            放到仓库根目录，运行 <code className="rounded bg-background px-1">npm run migrate</code>{" "}
            即可在本页展示成员与校友名单。
          </p>
        </Card>
      ) : (
        grades.map((grade) => (
          <div key={grade} className="mt-8">
            <h2 className="text-lg font-semibold">
              {grade} 届 <span className="text-sm font-normal text-muted-foreground">
                （{members.filter((m) => (m.grade ?? "未分级") === grade).length} 人）
              </span>
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {members
                .filter((m) => (m.grade ?? "未分级") === grade)
                .map((m) => (
                  <Card key={m.id}>
                    <div className="flex items-center gap-3">
                      <div
                        aria-hidden
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
                      >
                        ★
                      </div>
                      <div>
                        <p className="font-semibold">{m.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {[m.dept, m.position].filter(Boolean).join(" · ") || "成员"}
                        </p>
                      </div>
                    </div>
                    {m.skill && (
                      <p className="mt-3 text-sm leading-5 text-muted-foreground">特长：{m.skill}</p>
                    )}
                  </Card>
                ))}
            </div>
          </div>
        ))
      )}

      {alumni.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold">
            毕业校友 <span className="text-sm font-normal text-muted-foreground">（{alumni.length} 人）</span>
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {alumni.map((a) => (
              <span
                key={a.id}
                className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-muted-foreground"
                title={[a.dept, a.position].filter(Boolean).join(" · ")}
              >
                {a.name}（{a.grade ?? "—"} 届）
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
