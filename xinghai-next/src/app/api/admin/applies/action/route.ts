import { NextResponse } from "next/server";
import { adminAuthed } from "@/lib/admin-auth";
import { setApplyStatus } from "@/lib/db";

/**
 * 招新申请审核（POST /api/admin/applies/action）
 * body: { id, action }，action ∈ approve(通过) | reject(驳回) | pending(恢复待审)
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

  const statusMap = {
    approve: "已通过",
    reject: "已驳回",
    pending: "待审",
  } as const;
  const status = statusMap[action as keyof typeof statusMap];
  if (!status) {
    return NextResponse.json(
      { success: false, message: "未知操作" },
      { status: 400 },
    );
  }

  try {
    const ok = await setApplyStatus(id, status);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: "申请不存在" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, message: `状态已更新为：${status}` });
  } catch (err) {
    console.error("[admin/applies/action] 操作失败：", err);
    return NextResponse.json(
      { success: false, message: "操作失败，请稍后再试" },
      { status: 500 },
    );
  }
}
