"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

/** 重置密码表单：验证旧密码后设置新密码（忘记旧密码请联系主席团后台重置） */
export default function ResetPwdForm() {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const newPwd = String(data.get("newPwd") ?? "");
    const confirm = String(data.get("confirm") ?? "");
    if (newPwd !== confirm) {
      setError("两次输入的新密码不一致");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xh: data.get("xh"),
          oldPwd: data.get("oldPwd"),
          newPwd,
        }),
      });
      const result = (await res.json()) as { success?: boolean; message?: string };
      if (res.ok && result.success) {
        setDone(true);
      } else {
        setError(result.message ?? "重置失败");
      }
    } catch {
      setError("网络异常，请稍后再试");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <p className="font-medium">密码已更新！</p>
        <Link href="/login" className="inline-block font-medium text-primary hover:underline">
          使用新密码登录 →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">学号</span>
        <input
          name="xh"
          required
          inputMode="numeric"
          pattern="\d{9}"
          placeholder="9 位数字学号"
          className={inputClass}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">旧密码</span>
        <input name="oldPwd" type="password" required autoComplete="current-password" className={inputClass} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">新密码</span>
          <input
            name="newPwd"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">确认新密码</span>
          <input name="confirm" type="password" required minLength={6} autoComplete="new-password" className={inputClass} />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        新密码至少 6 位且同时包含字母和数字；忘记旧密码请联系主席团在后台为你重置。
      </p>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "提交中……" : "重置密码"}
      </Button>
    </form>
  );
}
