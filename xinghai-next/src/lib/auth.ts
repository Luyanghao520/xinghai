/**
 * 学生申请账号的认证工具（阶段1：成员登录）。
 *
 * - 密码：scrypt 加盐哈希（格式 `scrypt$<salt>$<hash>`）；
 * - 旧栈兼容：旧站密码为 `sha256(LEGACY_SECRET + 密码)`（见旧 app.py 的 hx()），
 *   配置 LEGACY_SECRET 后可在登录时校验旧格式并自动升级为 scrypt；
 * - 会话：HMAC-SHA256 签名的 Cookie（负载不含敏感信息），HttpOnly + SameSite=Lax。
 *
 * 注意：这与后台干部口令（admin-auth.ts，单一 ADMIN_TOKEN）是两套独立体系。
 */

import { createHmac, createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const STUDENT_COOKIE = "xh_student";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 天

/* ---------------- 密码 ---------------- */

const SCRYPT_PREFIX = "scrypt$";
const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${SCRYPT_PREFIX}${salt}$${hash}`;
}

/** 是否为新格式（scrypt）哈希 */
export function isScryptHash(stored: string): boolean {
  return stored.startsWith(SCRYPT_PREFIX);
}

function scryptVerify(password: string, stored: string): boolean {
  const [, salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  const got = scryptSync(password, salt, SCRYPT_KEYLEN);
  const expect = Buffer.from(hash, "hex");
  return got.length === expect.length && timingSafeEqual(got, expect);
}

/** 旧栈格式校验：sha256(LEGACY_SECRET + 密码)（未配置 LEGACY_SECRET 时返回 false） */
export function legacyPasswordMatch(password: string, stored: string): boolean {
  const secret = process.env.LEGACY_SECRET;
  if (!secret || !stored) return false;
  const expect = Buffer.from(
    createHash("sha256").update(secret + password, "utf8").digest("hex"),
  );
  const got = Buffer.from(stored);
  return got.length === expect.length && timingSafeEqual(got, expect);
}

/**
 * 校验密码；返回 'ok' | 'legacy-ok'（命中旧格式，调用方应升级存储） | 'mismatch'。
 */
export function verifyPassword(
  password: string,
  stored: string,
): "ok" | "legacy-ok" | "mismatch" {
  if (!stored) return "mismatch";
  if (isScryptHash(stored)) {
    return scryptVerify(password, stored) ? "ok" : "mismatch";
  }
  return legacyPasswordMatch(password, stored) ? "legacy-ok" : "mismatch";
}

/** 注册/重置密码强度：≥6 位且同时含字母与数字（对齐旧栈 pwd_strong） */
export function passwordStrongEnough(password: string): boolean {
  return (
    password.length >= 6 &&
    /[a-zA-Z]/.test(password) &&
    /\d/.test(password)
  );
}

/* ---------------- 会话 ---------------- */

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

const b64url = (buf: Buffer): string =>
  buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export interface StudentSession {
  xh: string;
  name: string;
  exp: number; // 过期时间戳（毫秒）
}

/** 签发会话令牌：`<base64url负载>.<hmac签名>` */
export function signSession(session: Omit<StudentSession, "exp">): { value: string; maxAge: number } {
  const full: StudentSession = {
    ...session,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const payload = b64url(Buffer.from(JSON.stringify(full), "utf8"));
  const sig = b64url(
    createHmac("sha256", authSecret()).update(payload).digest(),
  );
  return { value: `${payload}.${sig}`, maxAge: Math.floor(SESSION_TTL_MS / 1000) };
}

/** 校验并解析会话；无效/过期返回 null */
export function verifySessionToken(token: string | undefined): StudentSession | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expect = b64url(
    createHmac("sha256", authSecret()).update(payload).digest(),
  );
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
    ) as StudentSession;
    if (!session?.xh || typeof session.exp !== "number" || session.exp < Date.now()) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/** 从请求 Cookie 读取当前学生会话（服务端组件与路由通用） */
export async function getStudentSession(): Promise<StudentSession | null> {
  const jar = await cookies();
  return verifySessionToken(jar.get(STUDENT_COOKIE)?.value);
}

/** 登录成功后的会话 Cookie 选项 */
export function studentCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}
