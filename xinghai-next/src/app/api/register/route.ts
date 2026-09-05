import { NextResponse } from "next/server";
import { createRegistration } from "@/lib/db";

/**
 * 报名提交接口（POST /api/register）
 *
 * 入参 JSON：{ name, email, phone?, message? }
 * 返回 JSON：{ success, message, errors?, data? }
 *
 * 脚手架阶段行为：基础字段校验 → 经数据抽象层入库（本地 SQLite / 内存降级）
 * → 打印日志 → 返回成功 JSON。正式的报名流程（确认通知、防重复提交、
 * 验证码等）待后续迭代补充。
 */

// 路由处理器运行在 Node.js 运行时（better-sqlite3 依赖原生模块）
export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[\d\s+\-()]{5,20}$/; // 宽松校验：数字/空格/+-()

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

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { success: false, message: "请求体必须是一个 JSON 对象" },
      { status: 400 },
    );
  }

  const raw = body as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const phone = typeof raw.phone === "string" ? raw.phone.trim() : "";
  const message = typeof raw.message === "string" ? raw.message.trim() : "";

  // 基础字段校验（任务书第五节要求：非空、邮箱格式）
  const errors: Record<string, string> = {};
  if (!name) errors.name = "姓名不能为空";
  if (!email) {
    errors.email = "邮箱不能为空";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "邮箱格式不正确";
  }
  if (phone && !PHONE_PATTERN.test(phone)) {
    errors.phone = "电话格式不正确";
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { success: false, message: "字段校验未通过", errors },
      { status: 400 },
    );
  }

  try {
    const saved = await createRegistration({
      name,
      email,
      phone: phone || undefined,
      message: message || undefined,
    });
    console.log("[register] 收到报名提交：", saved);
    return NextResponse.json({
      success: true,
      message: "报名信息已收到，我们会尽快与你联系！",
      data: { id: saved.id },
    });
  } catch (err) {
    console.error("[register] 保存报名信息失败：", err);
    return NextResponse.json(
      { success: false, message: "服务器开小差了，请稍后再试" },
      { status: 500 },
    );
  }
}
