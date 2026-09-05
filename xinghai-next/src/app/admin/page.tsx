import type { Metadata } from "next";
import Link from "next/link";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminLogout from "@/components/admin/AdminLogout";
import ApplyActions from "@/components/admin/ApplyActions";
import RegistrationActions from "@/components/admin/RegistrationActions";
import { Card } from "@/components/ui/Card";
import { buttonStyles } from "@/components/ui/Button";
import { adminAuthed, adminEnabled } from "@/lib/admin-auth";
import {
  applyStats,
  listApplies,
  listAlumni,
  listMembers,
  listRegistrations,
  registrationStats,
} from "@/lib/db";

export const metadata: Metadata = {
  title: "后台管理",
  robots: { index: false, follow: false },
};

// 管理页永远走动态渲染（读 Cookie + 读库，不参与预渲染）
export const dynamic = "force-dynamic";

const SOURCE_LABELS: Record<string, string> = {
  new: "新报名",
  legacy: "历史导入",
  "legacy-archive": "归档导入",
};

/** 报名状态筛选签：s 参数 → 数据层 status 语义 */
const STATUS_TABS = [
  { key: "all", label: "全部", status: undefined },
  { key: "pending", label: "未处理", status: "pending" },
  { key: "archived", label: "已归档", status: "已归档" },
  { key: "admitted", label: "已录取", status: "已录取" },
] as const;

/** 后台看板：报名统计/搜索/筛选/写操作 + 招新申请审核 + 成员概览 */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; s?: string }>;
}) {
  const { q, s } = await searchParams;
  const activeTab = STATUS_TABS.find((t) => t.key === s) ?? STATUS_TABS[0];

  if (!adminEnabled()) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
        <Card className="mx-auto max-w-lg">
          <h1 className="text-xl font-semibold">后台未启用</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            请在 <code className="rounded bg-background px-1">xinghai-next/.env</code>{" "}
            中配置 <code className="rounded bg-background px-1">ADMIN_TOKEN=你的口令</code>
            （参考 <code className="rounded bg-background px-1">.env.example</code>），然后重启服务。
          </p>
        </Card>
      </section>
    );
  }

  if (!(await adminAuthed())) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
        <h1 className="mb-8 text-center text-2xl font-bold">星海艺术团 · 后台</h1>
        <AdminLogin />
      </section>
    );
  }

  const [stats, rows, aStats, applies, members, alumni] = await Promise.all([
    registrationStats(),
    listRegistrations({ q: q || undefined, status: activeTab.status }),
    applyStats(),
    listApplies(),
    listMembers(),
    listAlumni(),
  ]);

  const chipHref = (key: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (key !== "all") params.set("s", key);
    const qs = params.toString();
    return `/admin${qs ? `?${qs}` : ""}`;
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">后台 · 招新数据</h1>
        <AdminLogout />
      </div>

      {/* 统计卡片 */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "报名总数", value: stats.total },
          { label: "今日新增", value: stats.today },
          { label: "待审申请", value: aStats.pending },
          { label: "成员 / 校友", value: `${members.length} / ${alumni.length}` },
        ].map(({ label, value }) => (
          <Card key={label} className="text-center">
            <p className="text-3xl font-bold text-primary">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </Card>
        ))}
      </div>

      {/* 按意向方向统计 */}
      <Card className="mt-6">
        <h2 className="font-semibold">按意向方向统计</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(stats.byTarget).length === 0 && (
            <p className="text-sm text-muted-foreground">暂无数据</p>
          )}
          {Object.entries(stats.byTarget).map(([target, count]) => (
            <span
              key={target}
              className="rounded-full bg-primary-soft px-3 py-1 text-sm text-primary"
            >
              {target} · {count}
            </span>
          ))}
        </div>
      </Card>

      {/* 报名列表：筛选签 + 搜索 + 导出 */}
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">报名列表</h2>
        <div className="flex flex-wrap gap-1">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={chipHref(tab.key)}
              className={
                tab.key === activeTab.key
                  ? "rounded-full bg-primary px-3 py-1 text-sm text-white"
                  : "rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <form action="/admin" method="get" className="flex gap-2">
            {activeTab.key !== "all" && <input type="hidden" name="s" value={activeTab.key} />}
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="搜姓名 / 手机号 / 方向 / 院系"
              className="w-52 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white transition-colors hover:bg-primary-strong"
            >
              搜索
            </button>
          </form>
          <a href="/api/admin/registrations/export" className={buttonStyles("outline", "sm")}>
            导出 CSV
          </a>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              {["时间", "意向方向", "姓名", "性别", "校区", "院系", "专业/班级", "手机号", "微信", "邮箱", "特长", "动机", "调剂", "来源", "操作"].map(
                (h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-2 font-medium">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={15} className="px-3 py-8 text-center text-muted-foreground">
                  当前筛选下暂无报名数据
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0">
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{r.time.slice(0, 16).replace("T", " ")}</td>
                <td className="whitespace-nowrap px-3 py-2 font-medium text-primary">{r.target}</td>
                <td className="whitespace-nowrap px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.gender}</td>
                <td className="whitespace-nowrap px-3 py-2">{r.campus}</td>
                <td className="whitespace-nowrap px-3 py-2">{r.college}</td>
                <td className="whitespace-nowrap px-3 py-2">{r.major}</td>
                <td className="whitespace-nowrap px-3 py-2">{r.phone}</td>
                <td className="whitespace-nowrap px-3 py-2">{r.wechat ?? "—"}</td>
                <td className="whitespace-nowrap px-3 py-2">{r.email ?? "—"}</td>
                <td className="max-w-32 truncate px-3 py-2" title={r.skill ?? ""}>{r.skill ?? "—"}</td>
                <td className="max-w-40 truncate px-3 py-2" title={r.motive ?? ""}>{r.motive ?? "—"}</td>
                <td className="whitespace-nowrap px-3 py-2">{r.adjust ? "服从" : "不服从"}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <span
                    className={
                      r.source === "new"
                        ? "rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary"
                        : "rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground"
                    }
                  >
                    {SOURCE_LABELS[r.source] ?? r.source}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <RegistrationActions id={r.id} status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 招新申请：审核操作（pwd 字段永不展示） */}
      <h2 className="mt-10 text-lg font-semibold">招新申请（{aStats.total} 条）</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        状态分布：{Object.entries(aStats.byStatus).map(([s2, c]) => `${s2} ${c}`).join(" · ") || "暂无数据"}
      </p>
      <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              {["学号", "姓名", "校区", "状态", "申请时间", "更新时间", "审核"].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applies.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                  暂无申请数据
                </td>
              </tr>
            )}
            {applies.map((a) => (
              <tr key={a.id} className="border-b border-border/60 last:border-0">
                <td className="px-3 py-2">{a.xh}</td>
                <td className="px-3 py-2">{a.name}</td>
                <td className="px-3 py-2">{a.campus ?? "—"}</td>
                <td className="whitespace-nowrap px-3 py-2">{a.status}</td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{a.created ?? "—"}</td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{a.updated ?? "—"}</td>
                <td className="px-3 py-2">
                  <ApplyActions id={a.id} status={a.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          ← 返回官网首页
        </Link>
      </p>
    </section>
  );
}
