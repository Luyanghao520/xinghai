import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** robots.txt：公开页放行，后台与接口禁止收录 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
