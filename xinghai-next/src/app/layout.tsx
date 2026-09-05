import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/styles/globals.css";

/**
 * 全局布局 = 旧栈 base.html 的角色：导航栏 + 内容区 + 页脚。
 * 所有页面自动继承，无需每页重复引入（App Router 模板继承能力）。
 */
export const metadata: Metadata = {
  title: {
    default: "星海艺术团",
    template: "%s | 星海艺术团",
  },
  description: "星海艺术团官方网站——社团介绍、招新报名、演出作品与成员风采（新版建设中）",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
