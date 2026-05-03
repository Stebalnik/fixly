import type { SubcategoryMap } from "../types";

export const handymanSubcategories: SubcategoryMap = {
  "furniture-assembly": {
    slug: "furniture-assembly",
    title: "Furniture Assembly",
    shortTitle: "Furniture Assembly",
    parentSlug: "handyman",
    description:
      "Professional assembly of IKEA, Wayfair, and all flat-pack furniture.",
    commonProblems: [
      "IKEA furniture assembly",
      "Wayfair delivery assembly",
      "Office desk setup",
      "Bed frame assembly",
      "Bookshelf and storage units",
    ],
    priceMin: 60,
    priceMax: 250,
    priceUnit: "flat",
    relatedSlugs: ["tv-mounting-shelves", "general-maintenance"],
    formFields: ["brand", "item_count", "description", "photos"],
  },

  "drywall-repair": {
    slug: "drywall-repair",
    title: "Drywall Repair",
    shortTitle: "Drywall Repair",
    parentSlug: "handyman",
    description:
      "Patch holes, cracks, and water damage in drywall. Smooth finish guaranteed.",
    commonProblems: [
      "Hole in wall",
      "Crack repair",
      "Water damage patch",
      "Nail pops",
      "Corner bead damage",
    ],
    priceMin: 80,
    priceMax: 400,
    priceUnit: "flat",
    relatedSlugs: ["painting-touchups", "drywall-painting-texturing"],
    formFields: ["hole_size", "count", "description", "photos"],
  },

  "door-window-repair": {
    slug: "door-window-repair",
    title: "Door & Window Repair",
    shortTitle: "Door & Window",
    parentSlug: "handyman",
    description:
      "Fix sticking doors, broken locks, damaged frames, and window issues.",
    commonProblems: [
      "Door won't close",
      "Broken lock",
      "Sticking door",
      "Window won't open",
      "Damaged frame",
    ],
    priceMin: 75,
    priceMax: 300,
    priceUnit: "flat",
    relatedSlugs: ["general-maintenance"],
    formFields: ["door_type", "problem_type", "description", "photos"],
  },

  "painting-touchups": {
    slug: "painting-touchups",
    title: "Painting Touchups",
    shortTitle: "Paint Touchups",
    parentSlug: "handyman",
    description:
      "Small paint repairs, scuff touch-ups, and wall color matching.",
    commonProblems: [
      "Scuffs and scratches",
      "Nail holes to fill",
      "Color matching",
      "Small area repaint",
    ],
    priceMin: 60,
    priceMax: 200,
    priceUnit: "flat",
    relatedSlugs: ["drywall-repair", "interior-painting"],
    formFields: ["area_sqft", "description", "photos"],
  },

  "tv-mounting-shelves": {
    slug: "tv-mounting-shelves",
    title: "TV Mounting & Shelves",
    shortTitle: "TV Mounting",
    parentSlug: "handyman",
    description: "TV wall mounting, shelf installation, and wire concealment.",
    commonProblems: [
      "TV mount on drywall",
      "TV mount on brick/concrete",
      "Floating shelves",
      "Wire management",
    ],
    priceMin: 80,
    priceMax: 250,
    priceUnit: "flat",
    relatedSlugs: ["furniture-assembly", "general-maintenance"],
    formFields: ["tv_size", "wall_type", "description", "photos"],
  },

  "general-maintenance": {
    slug: "general-maintenance",
    title: "General Maintenance",
    shortTitle: "General Maintenance",
    parentSlug: "handyman",
    description:
      "Catch-all handyman tasks — minor repairs, installations, and home upkeep.",
    commonProblems: [
      "Miscellaneous repairs",
      "Caulking and sealing",
      "Weatherstripping",
      "Gutter cleaning",
      "Smoke detector install",
    ],
    priceMin: 75,
    priceMax: 350,
    priceUnit: "hourly",
    relatedSlugs: ["furniture-assembly", "door-window-repair"],
    formFields: ["task_list", "description", "photos"],
  },
};