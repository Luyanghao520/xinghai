import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminSessionCookieOptions,
  adminTokenMatches,
  signAdminSession,
} from "@/lib/admin-auth";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { findAdminUserAuthByUsername, updateAdminUserPassword } from "@/lib/db";

/**
 * 后台登录（POST /api/admin/login）
 * body: { username?, pwd }
 *
 * - 账号登录：管理人员用 学号/工号 + 密码（主席=super，其他管理人员=admin）；
 *   旧栈格式密码（sha256(LEGACY_SECRET+pwd)）登录成功时自动升级为 scrypt；
 * - 应急通道：用户名留空 + 密码输入 ADMIN_TOKEN，直接以超管身份进入；
 *   Cookie 值为口令摘要（旧格式），由 adminSession 的兼容逻辑识别。
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
  const username = typeof raw.username === "string" ? raw.username.trim() : "";
  const pwd = typeof raw.pwd === "string" ? raw.pwd : "";
  if (!pwd) {
    return NextResponse.json(
      { success: false, message: "请输入密码" },
      { status: 400 },
    );
  }

  try {
    /* ---- 应急通道：用户名留空 + ADMIN_TOKEN ---- */
    if (!username) {
      if (!adminTokenMatches(pwd)) {
        return NextResponse.json(
          { success: false, message: "账号或密码错误" },
          { status: 401 },
        );
      }
      const res = NextResponse.json({
        success: true,
        name: "口令通道",
        role: "super" as const,
      });
      const tokenDigest = createHash("sha256")
        .update(process.env.ADMIN_TOKEN ?? "", "utf8")
        .digest("hex");
      res.cookies.set(ADMIN_COOKIE, tokenDigest, adminSessionCookieOptions());
      return res;
    }

    /* ---- 账号登录 ---- */
    const row = await findAdminUserAuthByUsername(username);
    if (!row || row.status !== "active") {
      return NextResponse.json(
        { success: false, message: "账号或密码错误（或账号已停用）" },
        { status: 401 },
      );
    }
    const verdict = verifyPassword(pwd, row.pwd);
    if (verdict === "mismatch") {
      return NextResponse.json(
        { success: false, message: "账号或密码错误" },
        { status: 401 },
      );
    }
    if (verdict === "legacy-ok") {
      const upgraded = await updateAdminUserPassword(row.id, hashPassword(pwd));
      if (upgraded) console.log("[admin/login] 旧格式密码已升级为 scrypt：", row.username);
    }

    const res = NextResponse.json({
      success: true,
      name: row.name,
      role: row.role,
    });
    res.cookies.set(
      ADMIN_COOKIE,
      signAdminSession({
        uid: row.id,
        username: row.username,
        name: row.name,
        role: row.role === "super" ? "super" : "admin",
      }).value,
      adminSessionCookieOptions(),
    );
    return res;
  } catch (err) {
    console.error("[admin/login] 登录失败：", err);
    return NextResponse.json(
      { success: false, message: "服务器开小差了，请稍后再试" },
      { status: 500 },
    );
  }
}
