import { NextResponse } from "next/server";
import { adminAuthed } from "@/lib/admin-auth";
import { listRegistrations } from "@/lib/db";

/**
 * 报名数据导出 CSV（GET /api/admin/registrations/export）
 * - 字段顺序与旧栈 admin 导出一致，末尾追加 source/status 便于对账；
 * - 带 UTF-8 BOM，Excel 直接打开中文不乱码；
 * - 需要有效后台会话 Cookie。
 */
export async function GET() {
  if (!(await adminAuthed())) {
    return NextResponse.json(
      { success: false, message: "未登录或会话已过期" },
      { status: 401 },
    );
  }

  const rows = await listRegistrations({ limit: 100000 });

  const headers = [
    "time", "target", "name", "gender", "birth", "campus", "college",
    "major", "phone", "wechat", "email", "skill", "motive", "adjust",
    "source", "status",
  ];

  const escape = (value: unknown): string => {
    const s = value == null ? "" : String(value);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.time, r.target, r.name, r.gender, r.birth, r.campus, r.college,
        r.major, r.phone, r.wechat, r.email, r.skill, r.motive,
        r.adjust ? 1 : 0, r.source, r.status,
      ]
        .map(escape)
        .join(","),
    );
  }

  // \uFEFF BOM：Windows Excel 识别 UTF-8 的必要前缀
  const csv = "\uFEFF" + lines.join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="xinghai-registrations-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
