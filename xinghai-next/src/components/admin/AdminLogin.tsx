"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** 后台口令登录表单（提交到 /api/admin/login，成功后刷新服务端渲染） */
export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: data.get("token") }),
      });
      const result = (await res.json()) as { success?: boolean; message?: string };
      if (res.ok && result.success) {
        router.refresh();
      } else {
        setError(result.message ?? "登录失败");
      }
    } catch {
      setError("网络异常，请稍后再试");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">后台口令</span>
        <input
          name="token"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          placeholder="ADMIN_TOKEN"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "验证中……" : "进入后台"}
      </Button>
    </form>
  );
}
