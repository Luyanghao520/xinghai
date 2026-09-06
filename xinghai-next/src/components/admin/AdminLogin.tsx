"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** 后台登录表单：管理人员账号（学号/工号 + 密码）；
 *  应急通道：用户名留空 + 后台口令（ADMIN_TOKEN）。 */
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
        body: JSON.stringify({ username: data.get("username"), pwd: data.get("pwd") }),
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

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">学号 / 工号（应急通道可留空）</span>
        <input
          name="username"
          autoComplete="username"
          placeholder="管理人员的学号或工号"
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
      <Button type="submit" className="w-full" size="lg" disabled={busy}>
        {busy ? "验证中……" : "进入后台"}
      </Button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        仅限主席团与部门管理人员使用；账号由超级管理员分配，
        忘记密码请联系超级管理员重置。
      </p>
    </form>
  );
}
