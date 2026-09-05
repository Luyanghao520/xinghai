import type { Metadata } from "next";
import RegisterForm from "@/components/RegisterForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "招新报名",
  description: "星海艺术团招新安排与在线报名（表单接口已就绪，内容待填充）",
};

/** 招新/报名页（占位）：招新说明待填充，报名表单已可提交到 /api/register */
export default function RecruitPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold">招新报名</h1>
      <p className="mt-2 text-muted-foreground">
        招新时间、面向对象与面试安排等说明内容待填充。
        下表单为可运行的占位版本：提交后将写入本地数据库（脚手架阶段）。
      </p>

      <Card className="mt-8 max-w-2xl">
        <h2 className="text-lg font-semibold">在线报名</h2>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          带星号（*）为必填项；正式招新字段待数据层接入后扩展。
        </p>
        <RegisterForm />
      </Card>
    </section>
  );
}
