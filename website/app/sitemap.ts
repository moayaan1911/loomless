import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-04-23T00:00:00.000Z");

  return [
    {
      url: "https://loomless.fun",
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://loomless.fun/free-screen-recorder",
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://loomless.fun/chrome-screen-recorder",
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://loomless.fun/screen-recorder-for-mac",
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://loomless.fun/faq",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://loomless.fun/loomless-studio-privacy-policy",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
