import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "登录",
  description: "登录星海艺术团申请账号，查看招新审核进度",
};

/** 登录页（对齐旧栈 login.html 的入口角色） */
export default function LoginPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <Card className="mx-auto max-w-sm">
        <h1 className="mb-1 text-center text-xl font-bold">登录</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          查看你的招新申请审核进度
        </p>
        <LoginForm />
      </Card>
    </section>
  );
}
