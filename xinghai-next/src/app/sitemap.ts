import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** sitemap.xml：全部公开页面（/admin 与 /api 由 robots 禁止收录） */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/recruit", "/performances", "/members", "/contact"];
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
