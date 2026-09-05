"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";

/**
 * 招新报名表单（字段与旧栈 recruit.html 一致）。
 * 提交目标 POST /api/register；重复手机号/邮箱会得到 409 提示。
 * 样式为占位版本，正式视觉待设计阶段精修。
 */

type Status = "idle" | "submitting" | "success" | "error";

const INPUT_CLASS =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary";
const LABEL_CLASS = "mb-1 block font-medium";
/** 原生可见单选 pill：隐藏控件会让浏览器校验静默拦截提交（已踩坑，勿改回 hidden） */
const RADIO_CLASS =
  "flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm transition-colors has-checked:border-primary has-checked:bg-primary-soft has-checked:text-primary";

export default function RegisterForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("submitting");
    setFeedback("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: data.get("target"),
          name: data.get("name"),
          gender: data.get("gender"),
          birth: data.get("birth") || undefined,
          campus: data.get("campus"),
          college: data.get("college"),
          major: data.get("major"),
          phone: data.get("phone"),
          wechat: data.get("wechat") || undefined,
          email: data.get("email") || undefined,
          skill: data.get("skill") || undefined,
          motive: data.get("motive") || undefined,
          adjust: data.get("adjust") === "on",
        }),
      });
      const result = (await res.json()) as { success?: boolean; message?: string };

      if (res.ok && result.success) {
        setStatus("success");
        setFeedback(result.message ?? "报名信息已收到！");
        form.reset();
      } else {
        setStatus("error");
        setFeedback(result.message ?? "提交失败，请稍后再试");
      }
    } catch {
      setStatus("error");
      setFeedback("网络异常，请稍后再试");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className={LABEL_CLASS}>
          意向方向 <span aria-hidden className="text-accent">*</span>
        </span>
        <input
          name="target"
          required
          placeholder="如：声乐 / 舞蹈 / 器乐 / 主持（正式选项待内容确认）"
          className={INPUT_CLASS}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className={LABEL_CLASS}>
            姓名 <span aria-hidden className="text-accent">*</span>
          </span>
          <input name="name" required autoComplete="name" placeholder="你的姓名" className={INPUT_CLASS} />
        </label>

        <fieldset className="text-sm">
          <legend className={LABEL_CLASS}>
            性别 <span aria-hidden className="text-accent">*</span>
          </legend>
          <div className="flex gap-2">
            {["男", "女"].map((g) => (
              <label key={g} className={RADIO_CLASS}>
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  required
                  className="accent-[var(--primary)]"
                />
                {g}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className={LABEL_CLASS}>
            校区 <span aria-hidden className="text-accent">*</span>
          </span>
          <div className="flex gap-2">
            {["浦东", "松江"].map((c) => (
              <label key={c} className={RADIO_CLASS}>
                <input
                  type="radio"
                  name="campus"
                  value={c}
                  required
                  className="accent-[var(--primary)]"
                />
                {c}
              </label>
            ))}
          </div>
        </label>

        <label className="block text-sm">
          <span className={LABEL_CLASS}>出生年月（选填）</span>
          <input name="birth" type="month" className={INPUT_CLASS} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className={LABEL_CLASS}>
            院系 <span aria-hidden className="text-accent">*</span>
          </span>
          <input name="college" required placeholder="如：音乐学院" className={INPUT_CLASS} />
        </label>

        <label className="block text-sm">
          <span className={LABEL_CLASS}>
            专业 / 班级 <span aria-hidden className="text-accent">*</span>
          </span>
          <input name="major" required placeholder="如：音乐学 2401" className={INPUT_CLASS} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className={LABEL_CLASS}>
            手机号 <span aria-hidden className="text-accent">*</span>
          </span>
          <input
            name="phone"
            type="tel"
            required
            pattern="1[3-9]\d{9}"
            title="11 位大陆手机号"
            autoComplete="tel"
            placeholder="13800000000"
            className={INPUT_CLASS}
          />
        </label>

        <label className="block text-sm">
          <span className={LABEL_CLASS}>微信号（选填）</span>
          <input name="wechat" autoComplete="off" placeholder="方便联系的微信号" className={INPUT_CLASS} />
        </label>
      </div>

      <label className="block text-sm">
        <span className={LABEL_CLASS}>邮箱（选填）</span>
        <input name="email" type="email" autoComplete="email" placeholder="name@example.com" className={INPUT_CLASS} />
      </label>

      <label className="block text-sm">
        <span className={LABEL_CLASS}>特长 / 才艺 / 相关经历（选填）</span>
        <textarea name="skill" rows={2} placeholder="考级、演出、比赛经历等" className={INPUT_CLASS} />
      </label>

      <label className="block text-sm">
        <span className={LABEL_CLASS}>报名动机 / 自我介绍（选填）</span>
        <textarea name="motive" rows={3} placeholder="想加入的原因、期望的舞台……" className={INPUT_CLASS} />
      </label>

      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input name="adjust" type="checkbox" className="mt-0.5 accent-[var(--primary)]" />
        服从调剂（所报方向满员时可调配到其他方向）
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={status === "submitting"}>
          {status === "submitting" ? "提交中……" : "提交报名"}
        </Button>

        {feedback && (
          <p
            role="status"
            className={
              status === "success"
                ? "text-sm font-medium text-primary"
                : "text-sm font-medium text-red-600"
            }
          >
            {feedback}
          </p>
        )}
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        提交即表示同意社团通过所填联系方式与你沟通招新事宜；同一手机号/邮箱仅可提交一次。
      </p>
    </form>
  );
}
