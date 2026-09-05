"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** 申请行内审核操作：通过 / 驳回 / 恢复待审 */
export default function ApplyActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handle(action: "approve" | "reject" | "pending") {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/applies/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const result = (await res.json()) as { success?: boolean; message?: string };
      if (!result.success) window.alert(result.message ?? "操作失败");
      else router.refresh();
    } catch {
      window.alert("网络异常，请稍后再试");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-1">
      {status === "待审" ? (
        <>
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => handle("approve")}>
            通过
          </Button>
          <Button variant="ghost" size="sm" disabled={busy} className="text-red-600 hover:bg-red-50"
            onClick={() => handle("reject")}>
            驳回
          </Button>
        </>
      ) : (
        <Button variant="ghost" size="sm" disabled={busy} onClick={() => handle("pending")}>
          恢复待审
        </Button>
      )}
    </div>
  );
}
