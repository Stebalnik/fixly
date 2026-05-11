import type { LegacyServiceRouteMap } from "./types";

const categorySlug = "fence-installation-repair-services";

export const fenceLegacyRoutes: LegacyServiceRouteMap = {
  [categorySlug]: {
    type: "category",
    categorySlug,
    title: "Fence Installation & Repair",
  },

  fence: {
    type: "category",
    categorySlug,
    title: "Fence Installation & Repair",
  },

  "fence-services": {
    type: "category",
    categorySlug,
    title: "Fence Services",
  },

  "fence-installation-repair": {
    type: "category",
    categorySlug,
    title: "Fence Installation & Repair",
  },

  ...Object.fromEntries(
    [
      ["fence-repair", "Fence Repair"],
      ["fence-installation", "Fence Installation"],
      ["privacy-fence-installation", "Privacy Fence Installation"],
      ["wood-fence-installation", "Wood Fence Installation"],
      ["wood-fence-repair", "Wood Fence Repair"],
      ["vinyl-fence-installation", "Vinyl Fence Installation"],
      ["vinyl-fence-repair", "Vinyl Fence Repair"],
      ["chain-link-fence-installation", "Chain Link Fence Installation"],
      ["chain-link-fence-repair", "Chain Link Fence Repair"],
      ["fence-post-repair", "Fence Post Repair"],
      ["gate-repair", "Fence Gate Repair"],
      ["gate-installation", "Fence Gate Installation"],
      ["fence-replacement", "Fence Replacement"],
      ["fence-staining-sealing", "Fence Staining & Sealing"],
      ["fence-maintenance", "Fence Maintenance"],
      ["commercial-fence-installation", "Commercial Fence Installation"],
    ].flatMap(([subcategorySlug, title]) => [
      [
        `${categorySlug}/${subcategorySlug}`,
        {
          type: "subcategory",
          categorySlug,
          subcategorySlug,
          title,
        },
      ],
      [
        `fence/${subcategorySlug}`,
        {
          type: "subcategory",
          categorySlug,
          subcategorySlug,
          title,
        },
      ],
      [
        subcategorySlug,
        {
          type: "subcategory",
          categorySlug,
          subcategorySlug,
          title,
        },
      ],
    ])
  ),
};