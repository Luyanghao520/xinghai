/**
 * 站点对外 URL 的唯一来源。
 * 上线时在 .env 设置 NEXT_PUBLIC_SITE_URL（如 https://xinghai.example.com），
 * 未设置时回退本地地址——sitemap/robots/OG 链接全部基于它生成。
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE_NAME = "星海艺术团";
export const SITE_DESCRIPTION =
  "星海艺术团官方网站——社团介绍、招新报名、演出作品与成员风采";
