import { NextResponse } from "next/server";
import { DuplicateRegistrationError, createRegistration } from "@/lib/db";

/**
 * 报名提交接口（POST /api/register）
 *
 * 入参 JSON（对齐旧栈 recruit.html 表单 / registrations 表字段）：
 *   必填：target, name, gender, campus, college, major, phone
 *   选填：birth, wechat, email, skill, motive, adjust(布尔)
 * 返回 JSON：{ success, message, errors?, data? }
 *
 * 行为：字段校验 → 手机号/邮箱防重复（409）→ 入库（本地 SQLite /
 * 内存降级）→ 打印日志 → 返回成功 JSON。
 * 旧栈对应接口为 /api/signup；新栈统一命名为 /api/register。
 */

// 路由处理器运行在 Node.js 运行时（better-sqlite3 依赖原生模块）
export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^1[3-9]\d{9}$/; // 大陆手机号（与表单提示一致）

const str = (v: unknown): string =>
  typeof v === "string" ? v.trim() : "";

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

  // 必填字段（对齐旧表单：意向方向/姓名/性别/校区/院系/专业班级/手机号）
  const required = {
    target: str(raw.target),
    name: str(raw.name),
    gender: str(raw.gender),
    campus: str(raw.campus),
    college: str(raw.college),
    major: str(raw.major),
    phone: str(raw.phone),
  };

  const optional = {
    birth: str(raw.birth) || undefined,
    wechat: str(raw.wechat) || undefined,
    email: str(raw.email) || undefined,
    skill: str(raw.skill) || undefined,
    motive: str(raw.motive) || undefined,
    adjust: raw.adjust === true || raw.adjust === "true" || raw.adjust === 1,
  };

  // 基础字段校验
  const errors: Record<string, string> = {};
  const requiredLabels: Record<keyof typeof required, string> = {
    target: "意向方向",
    name: "姓名",
    gender: "性别",
    campus: "校区",
    college: "院系",
    major: "专业/班级",
    phone: "手机号",
  };
  for (const [key, value] of Object.entries(required)) {
    if (!value) errors[key] = `${requiredLabels[key as keyof typeof required]}不能为空`;
  }
  if (required.phone && !PHONE_PATTERN.test(required.phone)) {
    errors.phone = "手机号格式不正确（11 位大陆手机号）";
  }
  if (optional.email && !EMAIL_PATTERN.test(optional.email)) {
    errors.email = "邮箱格式不正确";
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { success: false, message: "字段校验未通过", errors },
      { status: 400 },
    );
  }

  try {
    const saved = await createRegistration({ ...required, ...optional });
    console.log("[register] 收到报名提交：", {
      id: saved.id,
      name: saved.name,
      target: saved.target,
      campus: saved.campus,
      phone: saved.phone.slice(0, 3) + "****" + saved.phone.slice(-4), // 日志脱敏
    });
    return NextResponse.json({
      success: true,
      message: "报名信息已收到，我们会尽快与你联系！",
      data: { id: saved.id },
    });
  } catch (err) {
    if (err instanceof DuplicateRegistrationError) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: 409 },
      );
    }
    console.error("[register] 保存报名信息失败：", err);
    return NextResponse.json(
      { success: false, message: "服务器开小差了，请稍后再试" },
      { status: 500 },
    );
  }
}
