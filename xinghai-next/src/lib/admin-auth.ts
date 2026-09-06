/**
 * 后台管理员认证（阶段2：多管理人员账号 + 角色）。
 *
 * - 账号：users 表（主席=super，其他管理人员=admin），密码 scrypt 哈希；
 *   旧栈格式（sha256(LEGACY_SECRET+密码)）登录时自动升级；
 * - 会话：HMAC 签名的 HttpOnly Cookie（8 小时），负载含 uid/姓名/角色；
 * - 应急后门：用户名留空 + 输入 ADMIN_TOKEN 可直接登录（视为超管），
 *   Cookie 值为口令摘要（旧格式），兼容升级前的已登录会话；
 * - 学生申请账号（auth.ts）与后台管理员是两套完全独立的体系。
 */

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { findAdminUserById } from "./db";
import type { AdminRole } from "./types";

export const ADMIN_COOKIE = "xh_admin";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 小时

const sha256Hex = (v: string): string =>
  createHash("sha256").update(v, "utf8").digest("hex");

const sha256Buf = (v: string): Buffer =>
  createHash("sha256").update(v, "utf8").digest();

function hmacBuf(payload: string): Buffer {
  return createHmac("sha256", authSecret()).update(payload).digest();
}

function authSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.ADMIN_TOKEN;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[auth] 未配置 AUTH_SECRET/ADMIN_TOKEN，正在使用不安全的开发默认密钥——请在 .env 中配置！",
    );
  }
  return "xinghai-dev-insecure-secret";
}

/** 后台口令（应急通道）是否已配置 */
export function adminEnabled(): boolean {
  return Boolean(process.env.ADMIN_TOKEN);
}

/** 校验明文口令是否等于 ADMIN_TOKEN（应急通道登录用，常量时间比较） */
export function adminTokenMatches(input: unknown): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token || typeof input !== "string" || !input) return false;
  const a = sha256Buf(input);
  const b = sha256Buf(token);
  return timingSafeEqual(a, b);
}

/* ---------------- 管理员签名会话 ---------------- */

export interface AdminSession {
  uid: string;
  username: string;
  name: string;
  role: AdminRole;
  exp: number;
}

const b64url = (buf: Buffer): string =>
  buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** 签发管理员会话 Cookie 值 */
export function signAdminSession(
  session: Omit<AdminSession, "exp">,
): { value: string; maxAge: number } {
  const full: AdminSession = { ...session, exp: Date.now() + SESSION_TTL_MS };
  const payload = b64url(Buffer.from(JSON.stringify(full), "utf8"));
  const sig = b64url(hmacBuf(payload));
  return {
    value: `${payload}.${sig}`,
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

/** 校验并解析签名会话；无效/过期返回 null */
export function verifyAdminSessionToken(
  token: string | undefined,
): AdminSession | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(b64url(hmacBuf(payload)));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
    ) as AdminSession;
    if (!session?.uid || typeof session.exp !== "number" || session.exp < Date.now()) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

/* ---------------- 服务端读取登录态 ---------------- */

/** 当前管理员会话；旧格式口令 Cookie 视为超管应急通道（uid='token'） */
export async function adminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;

  const signed = verifyAdminSessionToken(token);
  if (signed) return signed;

  // 旧格式兼容：值 = sha256(ADMIN_TOKEN)
  const t = process.env.ADMIN_TOKEN;
  if (token && t && token === sha256Hex(t)) {
    return {
      uid: "token",
      username: "__token__",
      name: "口令通道",
      role: "super",
      exp: 0,
    };
  }
  return null;
}

/** 是否已认证（签名会话且账号仍处于启用状态，或旧格式口令 Cookie） */
export async function adminAuthed(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  const signed = verifyAdminSessionToken(token);
  if (signed) {
    const user = await findAdminUserById(signed.uid);
    return Boolean(user && user.status === "active");
  }
  return Boolean(
    process.env.ADMIN_TOKEN && token === sha256Hex(process.env.ADMIN_TOKEN),
  );
}

/** 当前管理员角色：'super' | 'admin' | null */
export async function adminRole(): Promise<AdminRole | null> {
  const session = await adminSession();
  return session?.role ?? null;
}
