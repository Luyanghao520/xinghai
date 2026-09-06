import { NextResponse } from "next/server";
import { adminAuthed, adminSession } from "@/lib/admin-auth";
import { hashPassword, passwordStrongEnough, verifyPassword } from "@/lib/auth";
import { findAdminUserAuthByUsername, updateAdminUserPassword } from "@/lib/db";

/**
 * 管理员修改自己的密码（POST /api/admin/account/password）
 * body: { oldPwd, newPwd }——应急口令通道没有独立密码，不适用。
 */
export async function POST(request: Request) {
  if (!(await adminAuthed())) {
    return NextResponse.json(
      { success: false, message: "未登录或会话已过期" },
      { status: 401 },
    );
  }
  const session = await adminSession();
  if (!session || session.uid === "token") {
    return NextResponse.json(
      {
        success: false,
        message: "应急口令通道没有独立密码；请用管理人员账号登录后再修改",
      },
      { status: 400 },
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

  const raw = (body ?? {}) as Record<string, unknown>;
  const oldPwd = typeof raw.oldPwd === "string" ? raw.oldPwd : "";
  const newPwd = typeof raw.newPwd === "string" ? raw.newPwd : "";
  if (!oldPwd || !newPwd) {
    return NextResponse.json(
      { success: false, message: "请填写完整" },
      { status: 400 },
    );
  }
  if (newPwd === oldPwd) {
    return NextResponse.json(
      { success: false, message: "新密码不能与旧密码相同" },
      { status: 400 },
    );
  }
  if (!passwordStrongEnough(newPwd)) {
    return NextResponse.json(
      { success: false, message: "新密码须至少 6 位且同时包含字母和数字" },
      { status: 400 },
    );
  }

  try {
    const row = await findAdminUserAuthByUsername(session.username);
    if (!row || verifyPassword(oldPwd, row.pwd) === "mismatch") {
      return NextResponse.json(
        { success: false, message: "旧密码错误" },
        { status: 401 },
      );
    }
    const ok = await updateAdminUserPassword(row.id, hashPassword(newPwd));
    if (!ok) {
      return NextResponse.json(
        { success: false, message: "账号不存在" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, message: "密码已更新" });
  } catch (err) {
    console.error("[admin/account/password] 修改失败：", err);
    return NextResponse.json(
      { success: false, message: "操作失败，请稍后再试" },
      { status: 500 },
    );
  }
}
