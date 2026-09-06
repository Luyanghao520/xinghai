"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";

/** 管理员修改自己的密码（应急口令通道不适用，服务端会提示） */
export default function ChangeOwnPassword() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const newPwd = String(data.get("newPwd") ?? "");
    if (newPwd !== String(data.get("confirm") ?? "")) {
      setMsg({ ok: false, text: "两次输入的新密码不一致" });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPwd: data.get("oldPwd"), newPwd }),
      });
      const result = (await res.json()) as { success?: boolean; message?: string };
      setMsg({ ok: Boolean(result.success), text: result.message ?? "操作失败" });
      if (result.success) form.reset();
    } catch {
      setMsg({ ok: false, text: "网络异常，请稍后再试" });
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

  return (
    <form onSubmit={handleSubmit} className="grid items-end gap-3 sm:grid-cols-4">
      <label className="block text-xs">
        <span className="mb-1 block font-medium">旧密码</span>
        <input name="oldPwd" type="password" required autoComplete="current-password" className={inputClass} />
      </label>
      <label className="block text-xs">
        <span className="mb-1 block font-medium">新密码</span>
        <input name="newPwd" type="password" required minLength={6} autoComplete="new-password" className={inputClass} />
      </label>
      <label className="block text-xs">
        <span className="mb-1 block font-medium">确认新密码</span>
        <input name="confirm" type="password" required minLength={6} autoComplete="new-password" className={inputClass} />
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "提交中……" : "修改密码"}
        </Button>
        {msg && (
          <p className={`text-xs ${msg.ok ? "text-primary" : "text-red-600"}`}>{msg.text}</p>
        )}
      </div>
    </form>
  );
}
