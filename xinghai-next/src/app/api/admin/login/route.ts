import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminEnabled,
  adminTokenMatches,
  sessionCookieOptions,
  sessionCookieValue,
} from "@/lib/admin-auth";

/** 后台登录（POST /api/admin/login，body: { token }） */
export async function POST(request: Request) {
  if (!adminEnabled()) {
    return NextResponse.json(
      { success: false, message: "后台未启用：未配置 ADMIN_TOKEN" },
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

  const token = (body as { token?: unknown })?.token;
  if (!adminTokenMatches(token)) {
    return NextResponse.json(
      { success: false, message: "口令不正确" },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, sessionCookieValue(), sessionCookieOptions());
  return res;
}
