"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** 用户管理（仅超级管理员可见）：新建管理员 + 账号操作（重置密码/停用/启用/调角色） */

export interface AdminUserView {
  id: string;
  username: string;
  name: string;
  role: "super" | "admin";
  campus: string | null;
  status: string;
  source: string;
}

export default function UserManagement({
  users,
  currentUid,
}: {
  users: AdminUserView[];
  currentUid: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [formMsg, setFormMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function call(url: string, payload: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await res.json()) as { success?: boolean; message?: string };
      if (result.success) router.refresh();
      return { ok: Boolean(result.success), text: result.message ?? "操作失败" };
    } catch {
      return { ok: false, text: "网络异常，请稍后再试" };
    } finally {
      setBusy(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const result = await call("/api/admin/users", {
      username: data.get("username"),
      name: data.get("name"),
      role: data.get("role"),
      campus: data.get("campus"),
      pwd: data.get("pwd"),
    });
    setFormMsg(result);
    if (result.ok) form.reset();
  }

  async function handleAction(id: string, action: string, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    const result = await call("/api/admin/users/action", { id, action });
    if (!result.ok) window.alert(result.text);
    else if (result.text.includes("临时密码")) window.alert(result.text);
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

  return (
    <div className="mt-3 space-y-6">
      {/* 新建管理员 */}
      <form
        onSubmit={handleCreate}
        className="grid items-end gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-5"
      >
        <label className="block text-xs">
          <span className="mb-1 block font-medium">学号/工号</span>
          <input name="username" required className={inputClass} placeholder="如 251400143" />
        </label>
        <label className="block text-xs">
          <span className="mb-1 block font-medium">姓名</span>
          <input name="name" required className={inputClass} placeholder="如 陈嘉豪" />
        </label>
        <label className="block text-xs">
          <span className="mb-1 block font-medium">角色</span>
          <select name="role" className={inputClass} defaultValue="admin">
            <option value="admin">管理人员</option>
            <option value="super">超级管理员</option>
          </select>
        </label>
        <label className="block text-xs">
          <span className="mb-1 block font-medium">校区（选填）</span>
          <input name="campus" className={inputClass} placeholder="浦东 / 松江" />
        </label>
        <label className="block text-xs">
          <span className="mb-1 block font-medium">初始密码</span>
          <input name="pwd" required minLength={6} className={inputClass} placeholder="≥6 位字母+数字" />
        </label>
        <div className="sm:col-span-5 flex items-center gap-4">
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? "提交中……" : "新建管理员"}
          </Button>
          {formMsg && (
            <p className={`text-xs ${formMsg.ok ? "text-primary" : "text-red-600"}`}>
              {formMsg.text}
            </p>
          )}
        </div>
      </form>

      {/* 账号列表 */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              {["学号/工号", "姓名", "角色", "校区", "状态", "操作"].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border/60 last:border-0">
                <td className="px-3 py-2">{u.username}</td>
                <td className="px-3 py-2">
                  {u.name}
                  {u.id === currentUid && (
                    <span className="ml-1.5 rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">
                      我
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {u.role === "super" ? "超级管理员" : "管理人员"}
                </td>
                <td className="px-3 py-2">{u.campus ?? "—"}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      u.status === "active"
                        ? "text-emerald-400"
                        : "text-zinc-500"
                    }
                  >
                    {u.status === "active" ? "启用" : "停用"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => handleAction(u.id, "reset_pwd")}
                    >
                      重置密码
                    </Button>
                    {u.id === currentUid ? (
                      <span className="px-1 text-xs text-muted-foreground">（自己）</span>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            handleAction(
                              u.id,
                              "set_role",
                              `确认把 ${u.name} 的角色调整为「${u.role === "super" ? "管理人员" : "超级管理员"}」？`,
                            )
                          }
                        >
                          {u.role === "super" ? "降为管理" : "升为超管"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          className="text-red-600 hover:bg-red-50"
                          onClick={() =>
                            handleAction(
                              u.id,
                              u.status === "active" ? "disable" : "enable",
                              u.status === "active"
                                ? `确认停用 ${u.name} 的账号？停用后其将无法登录后台。`
                                : undefined,
                            )
                          }
                        >
                          {u.status === "active" ? "停用" : "启用"}
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
