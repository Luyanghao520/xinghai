import { NextResponse } from "next/server";
import { adminAuthed } from "@/lib/admin-auth";
import {
  admitRegistration,
  deleteRegistration,
  updateRegistrationStatus,
} from "@/lib/db";

/**
 * 报名管理写操作（POST /api/admin/registrations/action）
 * body: { id, action }，action ∈ archive(归档) | restore(恢复未处理) | delete(删除) | admit(录取为成员)
 * 需要有效后台会话 Cookie。
 */
export async function POST(request: Request) {
  if (!(await adminAuthed())) {
    return NextResponse.json(
      { success: false, message: "未登录或会话已过期" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "请求体必须是合法的 JSON" },
      { status: 400 },
    );
  }

  const { id, action } = (body ?? {}) as { id?: unknown; action?: unknown };
  if (typeof id !== "string" || !id) {
    return NextResponse.json(
      { success: false, message: "缺少 id" },
      { status: 400 },
    );
  }

  try {
    switch (action) {
      case "archive": {
        const ok = await updateRegistrationStatus(id, "已归档");
        return ok
          ? NextResponse.json({ success: true, message: "已归档" })
          : notFound();
      }
      case "restore": {
        const ok = await updateRegistrationStatus(id, null);
        return ok
          ? NextResponse.json({ success: true, message: "已恢复为未处理" })
          : notFound();
      }
      case "delete": {
        const ok = await deleteRegistration(id);
        return ok
          ? NextResponse.json({ success: true, message: "已删除" })
          : notFound();
      }
      case "admit": {
        const member = await admitRegistration(id);
        return member
          ? NextResponse.json({
              success: true,
              message: `已录取为成员（${member.dept ?? "未分组"} · ${member.grade} 届）`,
              data: { memberId: member.id },
            })
          : NextResponse.json(
              { success: false, message: "报名不存在或已是录取状态" },
              { status: 409 },
            );
      }
      default:
        return NextResponse.json(
          { success: false, message: "未知操作" },
          { status: 400 },
        );
    }
  } catch (err) {
    console.error("[admin/registrations/action] 操作失败：", err);
    return NextResponse.json(
      { success: false, message: "操作失败，请稍后再试" },
      { status: 500 },
    );
  }
}

function notFound() {
  return NextResponse.json(
    { success: false, message: "记录不存在" },
    { status: 404 },
  );
}
