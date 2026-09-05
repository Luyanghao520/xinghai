"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

/** 申请账号注册表单（注册 ≠ 录取：提交后进入「待审」，可登录查看进度） */
export default function RegisterAuthForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const pwd = String(data.get("pwd") ?? "");
    const confirm = String(data.get("confirm") ?? "");
    if (pwd !== confirm) {
      setError("两次输入的密码不一致");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xh: data.get("xh"),
          name: data.get("name"),
          campus: data.get("campus"),
          pwd,
        }),
      });
      const result = (await res.json()) as { success?: boolean; message?: string };
      if (res.ok && result.success) {
        setDone(true);
      } else {
        setError(result.message ?? "注册失败");
      }
    } catch {
      setError("网络异常，请稍后再试");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary";
  const radioClass =
    "rounded-lg border border-border bg-surface px-3 py-1.5 text-sm transition-colors has-checked:border-primary has-checked:bg-primary-soft has-checked:text-primary";

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-4xl" aria-hidden>
          🎉
        </p>
        <p className="font-medium">注册成功！</p>
        <p className="text-sm leading-6 text-muted-foreground">
          请等待主席团审核。期间你可以随时
          <Link href="/login" className="mx-1 font-medium text-primary hover:underline">
            登录
          </Link>
          查看审核进度；也欢迎先填写
          <Link href="/recruit" className="mx-1 font-medium text-primary hover:underline">
            报名表单
          </Link>
          。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">学号</span>
          <input
            name="xh"
            required
            inputMode="numeric"
            pattern="\d{9}"
            title="9 位数字学号"
            placeholder="9 位数字学号"
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">姓名</span>
          <input name="name" required placeholder="你的姓名" className={inputClass} />
        </label>
      </div>

      <div className="text-sm">
        <span className="mb-1 block font-medium">校区</span>
        <div className="flex gap-2">
          {["浦东", "松江"].map((c) => (
            <label key={c} className={radioClass}>
              <input type="radio" name="campus" value={c} required className="hidden" />
              {c}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">设置密码</span>
          <input
            name="pwd"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="至少 6 位，含字母和数字"
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">确认密码</span>
          <input
            name="confirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">密码至少 6 位，且同时包含字母和数字。</p>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "提交中……" : "注册申请账号"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        已有账号？
        <Link href="/login" className="mx-1 font-medium text-primary hover:underline">
          直接登录
        </Link>
      </p>
    </form>
  );
}
