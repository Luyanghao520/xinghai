import { NextResponse } from "next/server";
import { hashPassword, passwordStrongEnough, verifyPassword } from "@/lib/auth";
import { findApplyAuthByXh, updateApplyPassword } from "@/lib/db";

/**
 * 申请账号重置密码（POST /api/auth/reset）
 * body: { xh, oldPwd, newPwd }
 * 语义对齐旧栈：必须验证旧密码；新密码不能与旧密码相同。
 * 忘记旧密码 → 联系主席团在后台「重置密码」生成临时密码。
 */
export async function POST(request: Request) {
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
  const xh = typeof raw.xh === "string" ? raw.xh.trim() : "";
  const oldPwd = typeof raw.oldPwd === "string" ? raw.oldPwd : "";
  const newPwd = typeof raw.newPwd === "string" ? raw.newPwd : "";

  if (!xh || !oldPwd || !newPwd) {
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
    const row = await findApplyAuthByXh(xh);
    if (!row || verifyPassword(oldPwd, row.pwd) === "mismatch") {
      return NextResponse.json(
        { success: false, message: "学号或旧密码错误" },
        { status: 401 },
      );
    }
    await updateApplyPassword(xh, hashPassword(newPwd));
    return NextResponse.json({ success: true, message: "密码已更新，请使用新密码登录" });
  } catch (err) {
    console.error("[auth/reset] 重置失败：", err);
    return NextResponse.json(
      { success: false, message: "服务器开小差了，请稍后再试" },
      { status: 500 },
    );
  }
}
