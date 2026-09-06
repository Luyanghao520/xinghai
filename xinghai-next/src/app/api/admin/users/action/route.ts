import { NextResponse } from "next/server";
import { adminRole, adminSession } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/auth";
import {
  listAdminUsers,
  setAdminUserRole,
  setAdminUserStatus,
  updateAdminUserPassword,
} from "@/lib/db";

/**
 * 管理员账号管理操作（POST /api/admin/users/action，仅超级管理员）
 * body: { id, action, role? }
 *   - disable / enable：停用 / 启用（不能操作自己）
 *   - set_role（role: 'super' | 'admin'，不能操作自己）
 *   - reset_pwd：生成 8 位临时密码（响应里返回一次）
 */
export async function POST(request: Request) {
  const session = await adminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "未登录或会话已过期" },
      { status: 401 },
    );
  }
  if (session.role !== "super") {
    return NextResponse.json(
      { success: false, message: "仅超级管理员可管理账号" },
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

  const { id, action, role } = (body ?? {}) as {
    id?: unknown;
    action?: unknown;
    role?: unknown;
  };
  if (typeof id !== "string" || !id) {
    return NextResponse.json(
      { success: false, message: "缺少 id" },
      { status: 400 },
    );
  }

  const target = (await listAdminUsers()).find((u) => u.id === id);
  if (!target) {
    return NextResponse.json(
      { success: false, message: "账号不存在" },
      { status: 404 },
    );
  }
  const isSelf = session?.uid === id;

  try {
    switch (action) {
      case "disable": {
        if (isSelf) {
          return NextResponse.json(
            { success: false, message: "不能停用自己的账号" },
            { status: 400 },
          );
        }
        const ok = await setAdminUserStatus(id, "disabled");
        return ok
          ? NextResponse.json({ success: true, message: `已停用 ${target.name}` })
          : notFound();
      }
      case "enable": {
        const ok = await setAdminUserStatus(id, "active");
        return ok
          ? NextResponse.json({ success: true, message: `已启用 ${target.name}` })
          : notFound();
      }
      case "set_role": {
        if (isSelf) {
          return NextResponse.json(
            { success: false, message: "不能修改自己的角色" },
            { status: 400 },
          );
        }
        if (role !== "super" && role !== "admin") {
          return NextResponse.json(
            { success: false, message: "未知角色" },
            { status: 400 },
          );
        }
        const ok = await setAdminUserRole(id, role);
        return ok
          ? NextResponse.json({
              success: true,
              message: `${target.name} 已调整为${role === "super" ? "超级管理员" : "管理人员"}`,
            })
          : notFound();
      }
      case "reset_pwd": {
        const alphabet = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";
        const rand = globalThis.crypto.getRandomValues(new Uint8Array(8));
        let temp = "";
        for (const n of rand) temp += alphabet[n % alphabet.length];
        const ok = await updateAdminUserPassword(id, hashPassword(temp));
        return ok
          ? NextResponse.json({
              success: true,
              message: `已重置 ${target.name}（${target.username}）的密码，临时密码：${temp}（仅显示这一次）`,
              data: { tempPassword: temp },
            })
          : notFound();
      }
      default:
        return NextResponse.json(
          { success: false, message: "未知操作" },
          { status: 400 },
        );
    }
  } catch (err) {
    console.error("[admin/users/action] 操作失败：", err);
    return NextResponse.json(
      { success: false, message: "操作失败，请稍后再试" },
      { status: 500 },
    );
  }
}

function notFound() {
  return NextResponse.json(
    { success: false, message: "账号不存在" },
    { status: 404 },
  );
}
