import { NextResponse } from "next/server";
import { DuplicateApplyError, createApply } from "@/lib/db";
import { hashPassword, passwordStrongEnough } from "@/lib/auth";

/**
 * 申请账号注册（POST /api/auth/register）
 * body: { xh(9位数字), name, campus(浦东|松江), pwd(≥6位含字母数字) }
 * 对齐旧栈 register 语义：注册 ≠ 录取，账号创建后状态为「待审」，
 * 学生可随时登录查看审核进度。
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
  const xh = typeof raw.xh === "string" ? raw.xh.trim() : "";
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const campus = typeof raw.campus === "string" ? raw.campus.trim() : "";
  const pwd = typeof raw.pwd === "string" ? raw.pwd : "";

  const errors: Record<string, string> = {};
  if (!/^\d{9}$/.test(xh)) errors.xh = "学号须为 9 位数字";
  if (!name) errors.name = "姓名不能为空";
  if (campus !== "浦东" && campus !== "松江") errors.campus = "请选择校区";
  if (!pwd) errors.pwd = "密码不能为空";
  else if (!passwordStrongEnough(pwd)) errors.pwd = "密码须至少 6 位且同时包含字母和数字";
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { success: false, message: "字段校验未通过", errors },
      { status: 400 },
    );
  }

  try {
    await createApply({ xh, name, campus, pwdHash: hashPassword(pwd) });
    console.log("[auth/register] 新申请账号：", { xh, name, campus });
    return NextResponse.json({
      success: true,
      message: "注册成功！请等待主席团审核，期间可用学号登录查看进度。",
    });
  } catch (err) {
    if (err instanceof DuplicateApplyError) {
      return NextResponse.json(
        { success: false, message: "该学号已申请过账号，可直接登录或重置密码" },
        { status: 409 },
      );
    }
    console.error("[auth/register] 注册失败：", err);
    return NextResponse.json(
      { success: false, message: "服务器开小差了，请稍后再试" },
      { status: 500 },
    );
  }
}
