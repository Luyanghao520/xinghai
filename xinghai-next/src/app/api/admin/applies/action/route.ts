import { NextResponse } from "next/server";
import { adminAuthed } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/auth";
import { listApplies, setApplyStatus, updateApplyPassword } from "@/lib/db";

/**
 * 招新申请管理（POST /api/admin/applies/action）
 * body: { id, action }：
 *   - approve(通过) | reject(驳回) | pending(恢复待审)
 *   - reset_pwd：生成 8 位临时密码（响应里返回一次，干部线下转告学生）
 * 需要有效后台会话 Cookie。
 */
export async function POST(request: Request) {
  if (!(await adminAuthed())) {
    return NextResponse.json(
      { success: false, message: "未登录或会话已过期" },
      { status: 401 },
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

  const { id, action } = (body ?? {}) as { id?: unknown; action?: unknown };
  if (typeof id !== "string" || !id) {
    return NextResponse.json(
      { success: false, message: "缺少 id" },
      { status: 400 },
    );
  }

  try {
    if (action === "reset_pwd") {
      const all = await listApplies();
      const target = all.find((a) => a.id === id);
      if (!target) {
        return NextResponse.json(
          { success: false, message: "申请不存在" },
          { status: 404 },
        );
      }
      // 8 位临时密码，剔除易混淆字符（0/O/1/l/I）
      const alphabet = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";
      let temp = "";
      const rand = globalThis.crypto.getRandomValues(new Uint8Array(8));
      for (const n of rand) temp += alphabet[n % alphabet.length];
      await updateApplyPassword(target.xh, hashPassword(temp));
      return NextResponse.json({
        success: true,
        message: `已重置 ${target.name}（${target.xh}）的密码，临时密码：${temp}（仅显示这一次，请线下转告并提醒其尽快在「重置密码」页修改）`,
        data: { tempPassword: temp },
      });
    }

    const statusMap = {
      approve: "已通过",
      reject: "已驳回",
      pending: "待审",
    } as const;
    const status = statusMap[action as keyof typeof statusMap];
    if (!status) {
      return NextResponse.json(
        { success: false, message: "未知操作" },
        { status: 400 },
      );
    }

    const ok = await setApplyStatus(id, status);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: "申请不存在" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, message: `状态已更新为：${status}` });
  } catch (err) {
    console.error("[admin/applies/action] 操作失败：", err);
    return NextResponse.json(
      { success: false, message: "操作失败，请稍后再试" },
      { status: 500 },
    );
  }
}

