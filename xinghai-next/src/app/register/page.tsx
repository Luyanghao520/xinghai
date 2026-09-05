import type { Metadata } from "next";
import RegisterAuthForm from "@/components/auth/RegisterAuthForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "注册申请账号",
  description: "注册星海艺术团申请账号，跟踪招新审核进度",
};

/** 注册页（对齐旧栈 register.html：学号+密码 的申请账号；注册 ≠ 录取） */
export default function RegisterPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <Card className="mx-auto max-w-md">
        <h1 className="mb-1 text-center text-xl font-bold">注册申请账号</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          注册后等待主席团审核，期间可随时登录查看进度
        </p>
        <RegisterAuthForm />
      </Card>
    </section>
  );
}
