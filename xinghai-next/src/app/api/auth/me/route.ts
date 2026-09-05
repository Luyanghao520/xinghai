import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth";
import { findApplyAuthByXh } from "@/lib/db";
import type { ApplySelfView } from "@/lib/db";

/**
 * 当前登录学生信息（GET /api/auth/me）
 * 未登录返回 200 + { authenticated: false }，方便前端导航栏轮询。
 */
export async function GET() {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  const row = await findApplyAuthByXh(session.xh);
  if (!row) {
    // 账号已被删除等异常：视为未登录
    return NextResponse.json({ authenticated: false });
  }

  const view: ApplySelfView = {
    xh: row.xh,
    name: row.name,
    campus: row.campus,
    status: row.status,
    created: row.created,
    updated: row.updated,
  };
  return NextResponse.json({ authenticated: true, profile: view });
}
