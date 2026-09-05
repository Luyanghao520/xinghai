/**
 * 后台会话工具（脚手架级简单口令保护）。
 *
 * - 口令来自环境变量 ADMIN_TOKEN（未配置 = 后台整体关闭，默认安全）；
 * - 登录成功后下发 HttpOnly + SameSite=Strict 的会话 Cookie，
 *   值为口令的 SHA-256（Cookie 里不回存明文口令）；
 * - 上线到 HTTPS 环境后建议再补 Secure 属性与登录限速。
 */

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "xh_admin";
const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 小时

const sha256 = (v: string): Buffer =>
  createHash("sha256").update(v, "utf8").digest();

/** 后台是否已配置口令（未配置则整个 /admin 呈关闭状态） */
export function adminEnabled(): boolean {
  return Boolean(process.env.ADMIN_TOKEN);
}

/** 校验请求所带 Cookie 是否为有效会话 */
export async function adminAuthed(): Promise<boolean> {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  const jar = await cookies();
  const value = jar.get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const expect = sha256(token);
  const got = Buffer.from(value, "hex");
  return got.length === expect.length && timingSafeEqual(got, expect);
}

/** 校验明文口令（登录接口用，常量时间比较） */
export function adminTokenMatches(input: unknown): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token || typeof input !== "string" || !input) return false;
  const a = sha256(input);
  const b = sha256(token);
  return timingSafeEqual(a, b);
}

/** 登录成功后的会话 Cookie 选项 */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

/** 会话 Cookie 的值（口令摘要，不回存明文） */
export function sessionCookieValue(): string {
  return sha256(process.env.ADMIN_TOKEN ?? "").toString("hex");
}
