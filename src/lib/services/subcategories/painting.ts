import type { SubcategoryMap } from "../types";

export const paintingSubcategories: SubcategoryMap = {
  "interior-painting": {
    slug: "interior-painting",
    title: "Interior Painting",
    shortTitle: "Interior Painting",
    parentSlug: "painting",
    description:
      "Interior painting for walls, ceilings, rooms, apartments, condos, and full homes.",
    commonProblems: [
      "Faded or outdated wall colors",
      "Scuffed walls and trim",
      "Move-in or move-out repainting",
      "Uneven paint coverage",
      "Paint peeling near moisture-prone areas",
    ],
    priceMin: 300,
    priceMax: 4500,
    priceUnit: "flat",
    relatedSlugs: [
      "wall-painting-touch-ups",
      "ceiling-painting",
      "door-trim-painting",
      "drywall-painting-texturing",
    ],
    formFields: [
      "propertyType",
      "roomsToPaint",
      "wallCondition",
      "paintProvided",
      "timeline",
    ],
  },

  "exterior-painting": {
    slug: "exterior-painting",
    title: "Exterior Painting",
    shortTitle: "Exterior Painting",
    parentSlug: "painting",
    description:
      "Exterior house painting for siding, stucco, trim, doors, shutters, and outdoor surfaces.",
    commonProblems: [
      "Faded exterior paint",
      "Peeling or cracked paint",
      "Weather-damaged trim",
      "HOA color updates",
      "Preparing a home for sale",
    ],
    priceMin: 1200,
    priceMax: 12000,
    priceUnit: "flat",
    relatedSlugs: [
      "stucco-painting",
      "door-trim-painting",
      "pressure-washing-paint-prep",
      "fence-deck-painting",
    ],
    formFields: [
      "homeStories",
      "surfaceMaterial",
      "paintCondition",
      "prepNeeded",
      "timeline",
    ],
  },

  "cabinet-painting": {
    slug: "cabinet-painting",
    title: "Cabinet Painting",
    shortTitle: "Cabinet Painting",
    parentSlug: "painting",
    description:
      "Kitchen, bathroom, and built-in cabinet painting or refinishing for a cleaner updated look.",
    commonProblems: [
      "Outdated cabinet color",
      "Worn cabinet finish",
      "Chipped paint on doors",
      "Grease or stain buildup",
      "Need to refresh kitchen without full replacement",
    ],
    priceMin: 900,
    priceMax: 6500,
    priceUnit: "flat",
    relatedSlugs: [
      "interior-painting",
      "door-trim-painting",
      "wall-painting-touch-ups",
    ],
    formFields: [
      "cabinetLocation",
      "numberOfDoors",
      "currentFinish",
      "hardwareRemoval",
      "timeline",
    ],
  },

  "wall-painting-touch-ups": {
    slug: "wall-painting-touch-ups",
    title: "Wall Painting & Touch-Ups",
    shortTitle: "Wall Touch-Ups",
    parentSlug: "painting",
    description:
      "Wall painting, patch touch-ups, color matching, repainting, and small paint repairs.",
    commonProblems: [
      "Scuffs and scratches",
      "Small wall patches",
      "Paint mismatch",
      "Tenant move-out marks",
      "Damaged areas after repairs",
    ],
    priceMin: 150,
    priceMax: 1500,
    priceUnit: "flat",
    relatedSlugs: [
      "interior-painting",
      "drywall-painting-texturing",
      "door-trim-painting",
    ],
    formFields: [
      "areasToTouchUp",
      "paintMatchNeeded",
      "wallCondition",
      "paintProvided",
      "timeline",
    ],
  },

  "ceiling-painting": {
    slug: "ceiling-painting",
    title: "Ceiling Painting",
    shortTitle: "Ceiling Painting",
    parentSlug: "painting",
    description:
      "Ceiling painting for bedrooms, living rooms, kitchens, bathrooms, garages, and full homes.",
    commonProblems: [
      "Water stains",
      "Yellowing ceiling paint",
      "Uneven ceiling color",
      "Smoke or odor stains",
      "Ceiling patches after repairs",
    ],
    priceMin: 250,
    priceMax: 3500,
    priceUnit: "flat",
    relatedSlugs: [
      "interior-painting",
      "popcorn-ceiling-removal",
      "drywall-painting-texturing",
    ],
    formFields: [
      "ceilingArea",
      "ceilingHeight",
      "stainsPresent",
      "textureType",
      "timeline",
    ],
  },

  "door-trim-painting": {
    slug: "door-trim-painting",
    title: "Door & Trim Painting",
    shortTitle: "Door & Trim",
    parentSlug: "painting",
    description:
      "Painting for interior doors, exterior doors, baseboards, crown molding, window trim, and casing.",
    commonProblems: [
      "Chipped trim paint",
      "Yellowed baseboards",
      "Door scratches",
      "Uneven gloss finish",
      "Trim color updates",
    ],
    priceMin: 200,
    priceMax: 3000,
    priceUnit: "flat",
    relatedSlugs: [
      "interior-painting",
      "exterior-painting",
      "cabinet-painting",
    ],
    formFields: [
      "itemsToPaint",
      "numberOfDoors",
      "trimLength",
      "paintProvided",
      "timeline",
    ],
  },

  "drywall-painting-texturing": {
    slug: "drywall-painting-texturing",
    title: "Drywall Painting & Texturing",
    shortTitle: "Drywall Paint",
    parentSlug: "painting",
    description:
      "Drywall painting, texture blending, skim coat preparation, and repainting after repairs.",
    commonProblems: [
      "Visible drywall patches",
      "Uneven texture",
      "Paint flashing",
      "New drywall needs primer",
      "Wall repairs need blending",
    ],
    priceMin: 300,
    priceMax: 4000,
    priceUnit: "flat",
    relatedSlugs: [
      "interior-painting",
      "wall-painting-touch-ups",
      "ceiling-painting",
    ],
    formFields: [
      "drywallCondition",
      "textureType",
      "repairCompleted",
      "primerNeeded",
      "timeline",
    ],
  },

  "popcorn-ceiling-removal": {
    slug: "popcorn-ceiling-removal",
    title: "Popcorn Ceiling Removal",
    shortTitle: "Popcorn Removal",
    parentSlug: "painting",
    description:
      "Popcorn ceiling removal, smoothing, texture updates, priming, and ceiling repainting.",
    commonProblems: [
      "Outdated popcorn texture",
      "Ceiling texture peeling",
      "Dust buildup on texture",
      "Uneven old ceiling finish",
      "Need for smooth modern ceilings",
    ],
    priceMin: 800,
    priceMax: 7000,
    priceUnit: "sqft",
    relatedSlugs: [
      "ceiling-painting",
      "drywall-painting-texturing",
      "interior-painting",
    ],
    formFields: [
      "ceilingSquareFeet",
      "homeAge",
      "paintedTexture",
      "roomsIncluded",
      "timeline",
    ],
  },

  "fence-deck-painting": {
    slug: "fence-deck-painting",
    title: "Fence & Deck Painting",
    shortTitle: "Fence & Deck",
    parentSlug: "painting",
    description:
      "Painting and staining for fences, decks, railings, pergolas, porches, and outdoor wood surfaces.",
    commonProblems: [
      "Faded deck stain",
      "Peeling fence paint",
      "Weathered wood",
      "Uneven outdoor finish",
      "Wood needs sealing before seasonal weather",
    ],
    priceMin: 400,
    priceMax: 6500,
    priceUnit: "flat",
    relatedSlugs: [
      "exterior-painting",
      "pressure-washing-paint-prep",
      "deck-fence-staining-sealing",
    ],
    formFields: [
      "surfaceType",
      "surfaceCondition",
      "squareFootage",
      "stainOrPaint",
      "timeline",
    ],
  },

  "deck-fence-staining-sealing": {
    slug: "deck-fence-staining-sealing",
    title: "Deck & Fence Staining / Sealing",
    shortTitle: "Staining & Sealing",
    parentSlug: "painting",
    description:
      "Deck and fence staining, sealing, weatherproofing, and finish refresh for outdoor wood.",
    commonProblems: [
      "Dry or gray wood",
      "Water no longer beads on surface",
      "Uneven stain color",
      "Sun damage",
      "Need to protect wood from moisture",
    ],
    priceMin: 450,
    priceMax: 6000,
    priceUnit: "flat",
    relatedSlugs: [
      "fence-deck-painting",
      "pressure-washing-paint-prep",
      "exterior-painting",
    ],
    formFields: [
      "woodSurface",
      "previousFinish",
      "surfaceCondition",
      "squareFootage",
      "timeline",
    ],
  },

  "wallpaper-removal": {
    slug: "wallpaper-removal",
    title: "Wallpaper Removal",
    shortTitle: "Wallpaper Removal",
    parentSlug: "painting",
    description:
      "Wallpaper removal, adhesive cleanup, wall preparation, priming, and repaint-ready surface work.",
    commonProblems: [
      "Old wallpaper peeling",
      "Multiple wallpaper layers",
      "Glue residue",
      "Damaged drywall surface",
      "Need to repaint after removal",
    ],
    priceMin: 300,
    priceMax: 4500,
    priceUnit: "flat",
    relatedSlugs: [
      "interior-painting",
      "drywall-painting-texturing",
      "wall-painting-touch-ups",
    ],
    formFields: [
      "roomsWithWallpaper",
      "wallpaperAge",
      "numberOfLayers",
      "paintAfterRemoval",
      "timeline",
    ],
  },

  "stucco-painting": {
    slug: "stucco-painting",
    title: "Stucco Painting",
    shortTitle: "Stucco Painting",
    parentSlug: "painting",
    description:
      "Stucco painting, exterior coating, crack preparation, and color refresh for stucco homes.",
    commonProblems: [
      "Faded stucco color",
      "Hairline cracks before painting",
      "Chalky exterior surface",
      "Moisture stains",
      "Uneven exterior finish",
    ],
    priceMin: 1500,
    priceMax: 14000,
    priceUnit: "flat",
    relatedSlugs: [
      "exterior-painting",
      "pressure-washing-paint-prep",
      "door-trim-painting",
    ],
    formFields: [
      "homeStories",
      "stuccoCondition",
      "cracksPresent",
      "pressureWashingNeeded",
      "timeline",
    ],
  },

  "commercial-painting": {
    slug: "commercial-painting",
    title: "Commercial Painting",
    shortTitle: "Commercial Painting",
    parentSlug: "painting",
    description:
      "Commercial painting for offices, retail spaces, rental properties, small buildings, and tenant improvements.",
    commonProblems: [
      "Tenant turnover repainting",
      "Office refresh",
      "Retail space repainting",
      "After-hours painting needs",
      "High-traffic wall wear",
    ],
    priceMin: 800,
    priceMax: 25000,
    priceUnit: "flat",
    relatedSlugs: [
      "interior-painting",
      "exterior-painting",
      "wall-painting-touch-ups",
    ],
    formFields: [
      "businessType",
      "squareFootage",
      "afterHoursNeeded",
      "surfaceCondition",
      "timeline",
    ],
  },

  "pressure-washing-paint-prep": {
    slug: "pressure-washing-paint-prep",
    title: "Pressure Washing for Paint Prep",
    shortTitle: "Paint Prep Washing",
    parentSlug: "painting",
    description:
      "Exterior washing and surface preparation before painting, staining, sealing, or coating.",
    commonProblems: [
      "Dirt before exterior painting",
      "Mildew on siding",
      "Chalky paint residue",
      "Deck or fence needs prep",
      "Poor paint adhesion risk",
    ],
    priceMin: 200,
    priceMax: 1800,
    priceUnit: "flat",
    relatedSlugs: [
      "exterior-painting",
      "fence-deck-painting",
      "deck-fence-staining-sealing",
    ],
    formFields: [
      "surfaceType",
      "areasToWash",
      "mildewPresent",
      "paintingAfter",
      "timeline",
    ],
  },
};