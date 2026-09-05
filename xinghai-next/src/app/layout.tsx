import type { Metadata } from "next";
import HeroVideo from "@/components/HeroVideo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "@/styles/globals.css";

/**
 * 全局布局 = 旧栈 base.html 的角色：导航栏 + 内容区 + 页脚。
 * 所有页面自动继承，无需每页重复引入（App Router 模板继承能力）。
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {/* 全站固定背景：星云漩涡视频（fixed，所有页面共用，内容浮于其上）。
            暗纱统一压暗视频，保证各页普通文字的可读性 */}
        <div className="fixed inset-0 -z-10">
          <HeroVideo />
          <div className="absolute inset-0 bg-[#050810]/45" />
        </div>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
