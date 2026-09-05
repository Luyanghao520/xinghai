"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** 后台退出登录（清除会话 Cookie 后刷新） */
export default function AdminLogout() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <Button
      variant="outline"
      size="md"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch("/api/admin/logout", { method: "POST" });
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
    >
      退出登录
    </Button>
  );
}
