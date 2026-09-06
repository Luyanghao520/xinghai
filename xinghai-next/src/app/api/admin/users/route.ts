import { NextResponse } from "next/server";
import { adminSession } from "@/lib/admin-auth";
import { hashPassword, passwordStrongEnough } from "@/lib/auth";
import { createAdminUser } from "@/lib/db";

/**
 * 新建管理员账号（POST /api/admin/users，仅超级管理员）
 * body: { username, name, role: 'super'|'admin', pwd, campus? }
 */
export async function POST(request: Request) {
  const session = await adminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "未登录或会话已过期" },
      { status: 401 },
    );
  }
  if (session.role !== "super") {
    return NextResponse.json(
      { success: false, message: "仅超级管理员可管理账号" },
      { status: 403 },
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
  const username = typeof raw.username === "string" ? raw.username.trim() : "";
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const campus = typeof raw.campus === "string" ? raw.campus.trim() : "";
  const role = raw.role === "super" ? "super" : "admin";
  const pwd = typeof raw.pwd === "string" ? raw.pwd : "";

  const errors: Record<string, string> = {};
  if (username.length < 2 || username.length > 32 || /\s/.test(username)) {
    errors.username = "用户名 2~32 位且不含空格";
  }
  if (!name) errors.name = "姓名不能为空";
  if (!passwordStrongEnough(pwd)) {
    errors.pwd = "初始密码须至少 6 位且同时包含字母和数字";
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { success: false, message: "字段校验未通过", errors },
      { status: 400 },
    );
  }

  try {
    const created = await createAdminUser({
      username,
      name,
      role,
      campus: campus || undefined,
      pwdHash: hashPassword(pwd),
    });
    console.log("[admin/users] 新建管理员：", {
      username: created.username,
      name: created.name,
      role: created.role,
    });
    return NextResponse.json({
      success: true,
      message: `已创建${role === "super" ? "超级管理员" : "管理人员"}：${name}（${username}）`,
      data: { id: created.id },
    });
  } catch (err) {
    if (err instanceof Error && err.name === "DuplicateAdminUserError") {
      return NextResponse.json(
        { success: false, message: "该用户名已存在" },
        { status: 409 },
      );
    }
    console.error("[admin/users] 创建失败：", err);
    return NextResponse.json(
      { success: false, message: "创建失败，请稍后再试" },
      { status: 500 },
    );
  }
}
