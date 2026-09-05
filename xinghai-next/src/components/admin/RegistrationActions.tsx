"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/**
 * 报名行内操作：归档 / 恢复 / 录取为成员 / 删除。
 * 录取与删除有确认弹窗；操作成功后刷新服务端渲染的数据。
 */

type Status = string | null;

async function runAction(
  id: string,
  action: "archive" | "restore" | "delete" | "admit",
): Promise<string | null> {
  const res = await fetch("/api/admin/registrations/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, action }),
  });
  const result = (await res.json()) as { success?: boolean; message?: string };
  return result.success ? null : (result.message ?? "操作失败");
}

export default function RegistrationActions({
  id,
  status,
}: {
  id: string;
  status: Status;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handle(action: "archive" | "restore" | "delete" | "admit", confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    try {
      const err = await runAction(id, action);
      if (err) window.alert(err);
      else router.refresh();
    } catch {
      window.alert("网络异常，请稍后再试");
    } finally {
      setBusy(false);
    }
  }

  if (status === "已录取") {
    return <span className="text-xs text-muted-foreground">已是成员</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {status === null && (
        <>
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => handle("archive")}>
            归档
          </Button>
          <Button variant="ghost" size="sm" disabled={busy}
            onClick={() => handle("admit", "确认录取为成员？将按「意向方向=部门、当前年份=届别」建立成员记录（后台可再修正）。")}>
            录取
          </Button>
        </>
      )}
      {status === "已归档" && (
        <Button variant="ghost" size="sm" disabled={busy} onClick={() => handle("restore")}>
          恢复
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        disabled={busy}
        className="text-red-600 hover:bg-red-50"
        onClick={() => handle("delete", "确认删除这条报名记录？该操作不可恢复。")}
      >
        删除
      </Button>
    </div>
  );
}
