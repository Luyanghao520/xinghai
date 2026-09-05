import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import StudentLogoutButton from "@/components/auth/StudentLogoutButton";
import { Card } from "@/components/ui/Card";
import { getStudentSession } from "@/lib/auth";
import { findApplyAuthByXh } from "@/lib/db";

export const metadata: Metadata = {
  title: "我的报名",
  robots: { index: false, follow: false },
};

// 读取会话 Cookie，永远动态渲染
export const dynamic = "force-dynamic";

const STATUS_META: Record<string, { label: string; className: string; hint: string }> = {
  待审: {
    label: "待审",
    className: "bg-amber-100 text-amber-700",
    hint: "主席团正在审核你的申请，结果出来后这里会第一时间更新。",
  },
  已通过: {
    label: "已通过 🎉",
    className: "bg-emerald-100 text-emerald-700",
    hint: "恭喜！请留意招新群通知，按时参加见面与排练。",
  },
  已驳回: {
    label: "未通过",
    className: "bg-red-100 text-red-700",
    hint: "今年很遗憾，但星海永远欢迎热爱艺术的你明年再来。",
  },
};

/** 我的报名：登录后查看申请审核进度（学生端核心页） */
export default async function MePage() {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const row = await findApplyAuthByXh(session.xh);
  if (!row) redirect("/login");

  const meta = STATUS_META[row.status] ?? {
    label: row.status,
    className: "bg-background text-muted-foreground",
    hint: "",
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <Card className="mx-auto max-w-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">你好，{row.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {row.campus ?? "—"}校区 · 学号 {row.xh}
            </p>
          </div>
          <StudentLogoutButton />
        </div>

        <div className="mt-6 rounded-xl bg-background p-5">
          <p className="text-sm font-medium text-muted-foreground">申请审核状态</p>
          <p className="mt-2">
            <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${meta.className}`}>
              {meta.label}
            </span>
          </p>
          {meta.hint && <p className="mt-3 text-sm leading-6 text-muted-foreground">{meta.hint}</p>}
          <p className="mt-4 text-xs text-muted-foreground">
            提交时间：{row.created ?? "—"}
            {row.updated && row.updated !== row.created && (
              <>
                <br />
                最近更新：{row.updated}
              </>
            )}
          </p>
        </div>

        <div className="mt-6 text-center text-sm">
          <Link href="/recruit" className="font-medium text-primary hover:underline">
            前往填写招新报名表 →
          </Link>
        </div>
      </Card>
    </section>
  );
}
