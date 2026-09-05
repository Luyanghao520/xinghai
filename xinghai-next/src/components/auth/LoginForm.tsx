"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** 申请账号登录表单：成功后跳转 /me 查看审核进度 */
export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xh: data.get("xh"), pwd: data.get("pwd") }),
      });
      const result = (await res.json()) as { success?: boolean; message?: string };
      if (res.ok && result.success) {
        router.push("/me");
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

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">学号</span>
        <input
          name="xh"
          required
          inputMode="numeric"
          pattern="\d{9}"
          title="9 位数字学号"
          autoComplete="username"
          placeholder="9 位数字学号"
          className={inputClass}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">密码</span>
        <input
          name="pwd"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "登录中……" : "登录"}
      </Button>

      <p className="text-center text-xs leading-5 text-muted-foreground">
        还没有账号？
        <Link href="/register" className="mx-1 font-medium text-primary hover:underline">
          注册申请账号
        </Link>
        忘记密码？
        <Link href="/reset" className="mx-1 font-medium text-primary hover:underline">
          重置密码
        </Link>
      </p>
    </form>
  );
}
