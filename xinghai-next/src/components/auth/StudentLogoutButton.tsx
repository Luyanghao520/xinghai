"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** 学生退出登录（/me 页使用） */
export default function StudentLogoutButton() {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      退出登录
    </Button>
  );
}
