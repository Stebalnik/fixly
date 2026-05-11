export type SitemapEntry = {
  url: string;
  lastModified?: Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
};

export function buildUrlSet(entries: SitemapEntry[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map((entry) => {
    return `  <url>
    <loc>${entry.url}</loc>
    ${entry.lastModified ? `<lastmod>${entry.lastModified.toISOString()}</lastmod>` : ""}
    ${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ""}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ""}
  </url>`;
  })
  .join("\n")}
</urlset>`;
}