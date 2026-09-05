"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * 导航栏右侧登录态：未登录显示「登录」按钮；
 * 已登录显示「我的报名」与「退出」。登录态在客户端拉取，页面保持静态生成。
 */
export default function AuthNav() {
  const router = useRouter();
  const [authed, setAuthed] = useState<{ name: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { authenticated?: boolean; profile?: { name: string } }) => {
        if (!cancelled) {
          setAuthed(d.authenticated && d.profile ? { name: d.profile.name } : null);
          setReady(true);
        }
      })
      .catch(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthed(null);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      {ready && authed ? (
        <>
          <Link href="/me" className="font-medium text-primary hover:underline">
            我的报名
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            退出
          </button>
        </>
      ) : (
        <Link
          href="/login"
          className="rounded-lg bg-primary px-3 py-1.5 font-medium text-white transition-colors hover:bg-primary-strong"
        >
          登录
        </Link>
      )}
    </div>
  );
}
