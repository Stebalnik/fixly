import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://fixly.work";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/dashboard/",
          "/account/",
          "/login/",
          "/signup/",
          "/pro/leads/",
          "/pro/messages/",
          "/pro/settings/",
          "/pro/fixa/",
          "/pro/onboarding/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: "fixly.work",
  };
}