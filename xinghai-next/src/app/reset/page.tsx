import type { Metadata } from "next";
import ResetPwdForm from "@/components/auth/ResetPwdForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "重置密码",
  description: "重置星海艺术团申请账号密码",
};

/** 重置密码页（对齐旧栈 reset.html 语义：验证旧密码后设置新密码） */
export default function ResetPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <Card className="mx-auto max-w-md">
        <h1 className="mb-1 text-center text-xl font-bold">重置密码</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          验证旧密码后设置新密码
        </p>
        <ResetPwdForm />
      </Card>
    </section>
  );
}
