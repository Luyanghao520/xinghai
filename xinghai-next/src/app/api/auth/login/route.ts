import { NextResponse } from "next/server";
import { STUDENT_COOKIE, hashPassword, signSession, studentCookieOptions, verifyPassword } from "@/lib/auth";
import { findApplyAuthByXh, updateApplyPassword } from "@/lib/db";

/**
 * 申请账号登录（POST /api/auth/login）
 * body: { xh, pwd }
 * 兼容旧栈密码格式：命中旧 sha256(LEGACY_SECRET+密码) 时自动升级为 scrypt 存储。
 * 登录与审核状态无关——「待审/已通过/已驳回」都能登录，在 /me 查看进度。
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
  const pwd = typeof raw.pwd === "string" ? raw.pwd : "";
  if (!xh || !pwd) {
    return NextResponse.json(
      { success: false, message: "请输入学号和密码" },
      { status: 400 },
    );
  }

  try {
    const row = await findApplyAuthByXh(xh);
    if (!row) {
      return NextResponse.json(
        { success: false, message: "学号或密码错误" },
        { status: 401 },
      );
    }

    const verdict = verifyPassword(pwd, row.pwd);
    if (verdict === "mismatch") {
      return NextResponse.json(
        { success: false, message: "学号或密码错误" },
        { status: 401 },
      );
    }
    if (verdict === "legacy-ok") {
      // 旧格式密码登录成功：透明升级为 scrypt，此后走新格式
      await updateApplyPassword(xh, hashPassword(pwd));
      console.log("[auth/login] 旧格式密码已升级为 scrypt：", xh);
    }

    const res = NextResponse.json({
      success: true,
      name: row.name,
      status: row.status,
    });
    res.cookies.set(
      STUDENT_COOKIE,
      signSession({ xh: row.xh, name: row.name }).value,
      studentCookieOptions(),
    );
    return res;
  } catch (err) {
    console.error("[auth/login] 登录失败：", err);
    return NextResponse.json(
      { success: false, message: "服务器开小差了，请稍后再试" },
      { status: 500 },
    );
  }
}
