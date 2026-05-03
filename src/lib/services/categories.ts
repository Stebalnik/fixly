export type Category = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  subcategories: string[]; // slugs
};

export const categories: Record<string, Category> = {
  handyman: {
    slug: "handyman",
    title: "Handyman Services",
    shortTitle: "Handyman",
    description:
      "Professional handyman services for repairs, installations, and maintenance around your home.",
    icon: "🔧",
    subcategories: [
      "furniture-assembly",
      "drywall-repair",
      "door-window-repair",
      "painting-touchups",
      "tv-mounting-shelves",
      "plumbing-electrical",
      "general-maintenance",
    ],
  },
  
  plumbing: {
  slug: "plumbing",
  title: "Plumbing Services",
  shortTitle: "Plumbing",
  description:
    "Licensed plumbers for leak repair, drain cleaning, fixture installation, toilet repair, water heaters, garbage disposals, pipe repair, and emergency plumbing needs.",
  icon: "🚿",
  subcategories: [
    "leak-detection-repair",
    "plumbing-fixtures",
    "drain-cleaning",
    "toilet-repair-installation",
    "water-heater-repair-installation",
    "garbage-disposal-plumbing",
    "pipe-repair",
    "sump-pump-repair",
  ],
},

  electrical: {
    slug: "electrical",
    title: "Electrical Services",
    shortTitle: "Electrical",
    description:
      "Licensed electricians for safe and reliable electrical work in your home.",
    icon: "⚡",
    subcategories: ["lighting-electrical", "lighting-upgrades"],
  },
  cleaning: {
    slug: "cleaning",
    title: "Cleaning Services",
    shortTitle: "Cleaning",
    description:
      "Professional home cleaning — regular, deep clean, move-out, and more.",
    icon: "🧹",
    subcategories: [
      "residential-cleaning",
      "deep-cleaning",
      "move-out-cleaning",
    ],
  },
  painting: {
    slug: "painting",
    title: "Painting Services",
    shortTitle: "Painting",
    description:
      "Interior and exterior painting by professional painters. Clean results, fair prices.",
    icon: "🎨",
    subcategories: [
      "interior-painting",
      "exterior-painting",
      "popcorn-ceiling",
      "fence-deck-painting",
      "painting-drywall-repair",
      "drywall-painting-texturing",
    ],
  },
  "lawn-care": {
    slug: "lawn-care",
    title: "Lawn Care & Landscaping",
    shortTitle: "Lawn Care",
    description:
      "Lawn mowing, landscaping, and yard maintenance for a beautiful outdoor space.",
    icon: "🌿",
    subcategories: ["lawn-care-landscaping"],
  },
  roofing: {
    slug: "roofing",
    title: "Roofing Services",
    shortTitle: "Roofing",
    description:
      "Roof installation, repair, replacement, and storm damage restoration.",
    icon: "🏠",
    subcategories: [
      "roof-installation",
      "roof-repair",
      "roof-replacement",
      "storm-damage-restoration",
      "gutter-installation-repair",
      "roof-inspections-maintenance",
    ],
  },
  "appliance-repair-installation": {
    slug: "appliance-repair-installation",
    title: "Appliance Repair & Installation",
    shortTitle: "Appliances",
    description:
      "Expert repair and installation for all major home appliances.",
    icon: "🔌",
    subcategories: [
      "washer-dryer",
      "refrigerator-freezer",
      "dishwasher",
      "oven-range-microwave",
      "garbage-disposal",
      "ice-maker-water-line",
      "small-appliances",
      "new-hookups",
      "electric-fireplaces",
    ],
  },
  "pressure-washing": {
    slug: "pressure-washing",
    title: "Pressure Washing",
    shortTitle: "Pressure Washing",
    description:
      "Professional pressure washing for driveways, decks, siding, and more.",
    icon: "💧",
    subcategories: ["pressure-washing-exterior"],
  },
  "junk-removal": {
    slug: "junk-removal",
    title: "Junk Removal",
    shortTitle: "Junk Removal",
    description:
      "Fast and affordable junk removal — furniture, appliances, yard waste, and more.",
    icon: "🗑️",
    subcategories: [],
  },
  awnings: {
    slug: "awnings",
    title: "Awning Services",
    shortTitle: "Awnings",
    description:
      "Awning installation, repair, replacement, and seasonal setup.",
    icon: "⛱️",
    subcategories: [
      "retractable-installation",
      "fixed-canopy-setup",
      "commercial-storefront",
      "removal-disposal",
      "replacement",
      "seasonal-setup-takedown",
      "frame-fabric-repair",
      "lighting-installation",
      "selection-assistance",
    ],
  },
  "fence-installation-repair-services": {
    slug: "fence-installation-repair-services",
    title: "Fence Installation & Repair",
    shortTitle: "Fencing",
    description:
      "Fence installation, repair, and replacement for all fence types.",
    icon: "🪵",
    subcategories: [],
  },
  remodeling: {
    slug: "remodeling",
    title: "Remodeling Services",
    shortTitle: "Remodeling",
    description:
      "Full home remodeling — kitchen, bathroom, basement, and whole-house renovations.",
    icon: "🏗️",
    subcategories: [
      "kitchen-remodeling",
      "bathroom-remodeling",
      "basement-remodeling",
      "whole-house-renovation",
      "full-renovation",
      "cabinets-countertops",
      "backsplash-installation",
    ],
  },
  flooring: {
    slug: "flooring",
    title: "Flooring Services",
    shortTitle: "Flooring",
    description:
      "Flooring installation, repair, and replacement for all floor types.",
    icon: "🪟",
    subcategories: [],
  },
  "property-maintenance": {
    slug: "property-maintenance",
    title: "Property Maintenance",
    shortTitle: "Property Maintenance",
    description:
      "Comprehensive property maintenance for homeowners and landlords.",
    icon: "🏡",
    subcategories: [
      "property-inspections",
      "turnover-preparation",
      "emergency-handyman",
      "appliance-repair-installation",
    ],
  },
};

export function getCategoryBySlug(slug: string): Category | undefined {
  return Object.values(categories).find((c) => c.slug === slug);
}

export function getAllCategorySlugs(): string[] {
  return Object.values(categories).map((c) => c.slug);
}