"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";

/**
 * 报名表单（占位组件）
 *
 * 行为：把 { name, email, phone, message } 以 JSON 提交到 /api/register，
 * 并把后端返回的提示展示给用户。样式与字段集合为占位版本，
 * 正式招新字段（年级/专业/意向组别等）待数据迁移后在此扩展。
 */

type Status = "idle" | "submitting" | "success" | "error";

const INPUT_CLASS =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary";

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
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
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
    <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">
            姓名 <span aria-hidden className="text-accent">*</span>
          </span>
          <input
            name="name"
            required
            autoComplete="name"
            placeholder="你的姓名"
            className={INPUT_CLASS}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">
            邮箱 <span aria-hidden className="text-accent">*</span>
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="name@example.com"
            className={INPUT_CLASS}
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">电话（选填）</span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="方便联系的手机号"
          className={INPUT_CLASS}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">留言（选填）</span>
        <textarea
          name="message"
          rows={4}
          placeholder="想加入的组别、特长、想对社团说的话……"
          className={INPUT_CLASS}
        />
      </label>

      <div className="flex items-center gap-4">
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
    </form>
  );
}
