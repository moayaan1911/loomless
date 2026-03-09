import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://loomless.fun/sitemap.xml",
    host: "https://loomless.fun",
  };
}
