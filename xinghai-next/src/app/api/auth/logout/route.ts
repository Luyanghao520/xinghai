import { NextResponse } from "next/server";
import { STUDENT_COOKIE } from "@/lib/auth";

/** 学生退出登录（清除会话 Cookie） */
export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(STUDENT_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
