import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "联系我们",
  description: "联系星海艺术团：邮箱、社交账号与到访方式（内容待填充）",
};

/** 联系我们（占位页）：联系方式待填充，后续可再接留言表单 */
export default function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold">联系我们</h1>
      <p className="mt-2 text-muted-foreground">
        本页为占位页——联系方式内容待填充。
      </p>

      <Card className="mt-8 max-w-2xl">
        <ul className="space-y-3 text-sm leading-6">
          <li>
            <span className="font-medium">邮箱：</span>
            contact@example.com（待替换）
          </li>
          <li>
            <span className="font-medium">微信公众号：</span>待填充
          </li>
          <li>
            <span className="font-medium">QQ 群：</span>待填充
          </li>
          <li>
            <span className="font-medium">排练地址：</span>待填充
          </li>
        </ul>
        <p className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">
          如需合作或咨询招新，也可先通过
          <a href="/recruit" className="mx-1 font-medium text-primary hover:underline">
            招新报名
          </a>
          页面留下联系方式。
        </p>
      </Card>
    </section>
  );
}
