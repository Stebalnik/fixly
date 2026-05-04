import type { SubcategoryMap } from "../types";

export const pressureSubcategories: SubcategoryMap = {
  "house-pressure-washing": {
    slug: "house-pressure-washing",
    title: "House Pressure Washing",
    shortTitle: "House Washing",
    parentSlug: "pressure-washing",
    description:
      "Exterior house washing for siding, trim, porches, entry areas, and general buildup using pressure washing or soft washing when needed.",
    commonProblems: [
      "Siding has algae, mildew, dirt, or dark streaks",
      "Exterior walls look dull before selling or renting",
      "Porch, trim, or entry areas need cleaning",
      "Home exterior needs seasonal maintenance",
    ],
    priceMin: 180,
    priceMax: 550,
    priceUnit: "flat",
    relatedSlugs: [
      "soft-wash-house-cleaning",
      "siding-pressure-washing",
      "driveway-pressure-washing",
    ],
    formFields: [
      "homeExteriorMaterial",
      "numberOfStories",
      "approximateHomeSize",
      "waterAccess",
      "photos",
    ],
  },

  "soft-wash-house-cleaning": {
    slug: "soft-wash-house-cleaning",
    title: "Soft Wash House Cleaning",
    shortTitle: "Soft Washing",
    parentSlug: "pressure-washing",
    description:
      "Low-pressure exterior cleaning for siding, painted surfaces, stucco, wood, and delicate areas where high pressure may cause damage.",
    commonProblems: [
      "Painted or delicate siding needs cleaning",
      "Stucco or wood exterior has mildew buildup",
      "High-pressure washing may damage the surface",
      "Home needs safe exterior cleaning before painting",
    ],
    priceMin: 220,
    priceMax: 650,
    priceUnit: "flat",
    relatedSlugs: [
      "house-pressure-washing",
      "siding-pressure-washing",
      "roof-soft-washing",
    ],
    formFields: [
      "surfaceType",
      "numberOfStories",
      "sensitiveAreas",
      "waterAccess",
      "photos",
    ],
  },

  "driveway-pressure-washing": {
    slug: "driveway-pressure-washing",
    title: "Driveway Pressure Washing",
    shortTitle: "Driveway Washing",
    parentSlug: "pressure-washing",
    description:
      "Pressure washing for concrete, paver, asphalt, and stained driveways to remove dirt, algae, tire marks, and surface buildup.",
    commonProblems: [
      "Driveway looks dark, stained, or slippery",
      "Concrete has tire marks or mildew",
      "Pavers have dirt buildup between joints",
      "Driveway needs cleaning before sealing or listing",
    ],
    priceMin: 120,
    priceMax: 450,
    priceUnit: "flat",
    relatedSlugs: [
      "concrete-pressure-washing",
      "sidewalk-pressure-washing",
      "oil-stain-pressure-washing",
    ],
    formFields: [
      "drivewayMaterial",
      "approximateSquareFootage",
      "stainType",
      "waterAccess",
      "photos",
    ],
  },

  "concrete-pressure-washing": {
    slug: "concrete-pressure-washing",
    title: "Concrete Pressure Washing",
    shortTitle: "Concrete Washing",
    parentSlug: "pressure-washing",
    description:
      "Concrete cleaning for slabs, walkways, parking pads, garage aprons, pool decks, and exterior hardscape surfaces.",
    commonProblems: [
      "Concrete has black buildup or algae",
      "Walkways are slippery after rain",
      "Outdoor slabs need cleaning before sealing",
      "Parking pads or aprons have heavy dirt buildup",
    ],
    priceMin: 150,
    priceMax: 650,
    priceUnit: "flat",
    relatedSlugs: [
      "driveway-pressure-washing",
      "sidewalk-pressure-washing",
      "patio-pressure-washing",
    ],
    formFields: [
      "concreteAreaType",
      "approximateSquareFootage",
      "stainType",
      "waterAccess",
      "photos",
    ],
  },

  "sidewalk-pressure-washing": {
    slug: "sidewalk-pressure-washing",
    title: "Sidewalk Pressure Washing",
    shortTitle: "Sidewalk Washing",
    parentSlug: "pressure-washing",
    description:
      "Cleaning for sidewalks, walkways, front paths, entry paths, and pedestrian areas with dirt, algae, grime, or stains.",
    commonProblems: [
      "Sidewalk looks dark or unevenly stained",
      "Walkway becomes slippery when wet",
      "Front path needs curb appeal cleanup",
      "Public-facing concrete needs routine cleaning",
    ],
    priceMin: 100,
    priceMax: 400,
    priceUnit: "flat",
    relatedSlugs: [
      "driveway-pressure-washing",
      "concrete-pressure-washing",
      "patio-pressure-washing",
    ],
    formFields: [
      "walkwayLength",
      "surfaceMaterial",
      "stainType",
      "waterAccess",
      "photos",
    ],
  },

  "patio-pressure-washing": {
    slug: "patio-pressure-washing",
    title: "Patio Pressure Washing",
    shortTitle: "Patio Washing",
    parentSlug: "pressure-washing",
    description:
      "Pressure washing for patios, outdoor living areas, pavers, stone, concrete, and backyard surfaces.",
    commonProblems: [
      "Patio has dirt, mildew, or algae buildup",
      "Outdoor seating area needs cleanup",
      "Pavers or stone surfaces look stained",
      "Backyard area needs seasonal refresh",
    ],
    priceMin: 120,
    priceMax: 500,
    priceUnit: "flat",
    relatedSlugs: [
      "deck-pressure-washing",
      "pool-deck-pressure-washing",
      "concrete-pressure-washing",
    ],
    formFields: [
      "patioMaterial",
      "approximateSquareFootage",
      "furnitureRemovalNeeded",
      "waterAccess",
      "photos",
    ],
  },

  "deck-pressure-washing": {
    slug: "deck-pressure-washing",
    title: "Deck Pressure Washing",
    shortTitle: "Deck Washing",
    parentSlug: "pressure-washing",
    description:
      "Deck cleaning for wood, composite, and outdoor deck surfaces using controlled pressure or soft wash methods.",
    commonProblems: [
      "Deck has mildew or algae buildup",
      "Wood deck needs cleaning before staining",
      "Composite boards look dull or dirty",
      "Outdoor deck feels slippery",
    ],
    priceMin: 160,
    priceMax: 600,
    priceUnit: "flat",
    relatedSlugs: [
      "patio-pressure-washing",
      "fence-pressure-washing",
      "soft-wash-house-cleaning",
    ],
    formFields: [
      "deckMaterial",
      "approximateSquareFootage",
      "deckCondition",
      "waterAccess",
      "photos",
    ],
  },

  "fence-pressure-washing": {
    slug: "fence-pressure-washing",
    title: "Fence Pressure Washing",
    shortTitle: "Fence Washing",
    parentSlug: "pressure-washing",
    description:
      "Fence washing for wood, vinyl, composite, and painted fences with mildew, dirt, algae, or weather staining.",
    commonProblems: [
      "Fence looks green, gray, or weathered",
      "Vinyl fence has mildew or dirt buildup",
      "Wood fence needs cleaning before staining",
      "Fence line needs curb appeal cleanup",
    ],
    priceMin: 140,
    priceMax: 650,
    priceUnit: "flat",
    relatedSlugs: [
      "deck-pressure-washing",
      "soft-wash-house-cleaning",
      "house-pressure-washing",
    ],
    formFields: [
      "fenceMaterial",
      "approximateFenceLength",
      "fenceHeight",
      "waterAccess",
      "photos",
    ],
  },

  "roof-soft-washing": {
    slug: "roof-soft-washing",
    title: "Roof Soft Washing",
    shortTitle: "Roof Washing",
    parentSlug: "pressure-washing",
    description:
      "Low-pressure roof cleaning for algae streaks, moss, mildew, and organic buildup where standard pressure washing may damage roofing materials.",
    commonProblems: [
      "Roof has black streaks or algae",
      "Moss or mildew is visible on shingles",
      "Roof needs cleaning before listing a home",
      "High pressure is not safe for roof material",
    ],
    priceMin: 300,
    priceMax: 1100,
    priceUnit: "flat",
    relatedSlugs: [
      "soft-wash-house-cleaning",
      "gutter-brightening-cleaning",
      "house-pressure-washing",
    ],
    formFields: [
      "roofMaterial",
      "numberOfStories",
      "roofPitch",
      "visibleGrowth",
      "photos",
    ],
  },

  "gutter-brightening-cleaning": {
    slug: "gutter-brightening-cleaning",
    title: "Gutter Brightening & Exterior Cleaning",
    shortTitle: "Gutter Brightening",
    parentSlug: "pressure-washing",
    description:
      "Exterior gutter cleaning and brightening for dirt streaks, tiger stripes, mildew, and buildup on visible gutter faces.",
    commonProblems: [
      "Gutters have black streaks or tiger striping",
      "Exterior gutter faces look dirty",
      "Home exterior needs a cleaner roofline",
      "Gutters need washing with house exterior",
    ],
    priceMin: 120,
    priceMax: 450,
    priceUnit: "flat",
    relatedSlugs: [
      "house-pressure-washing",
      "roof-soft-washing",
      "soft-wash-house-cleaning",
    ],
    formFields: [
      "numberOfStories",
      "gutterLength",
      "streakSeverity",
      "waterAccess",
      "photos",
    ],
  },

  "pool-deck-pressure-washing": {
    slug: "pool-deck-pressure-washing",
    title: "Pool Deck Pressure Washing",
    shortTitle: "Pool Deck Washing",
    parentSlug: "pressure-washing",
    description:
      "Pool deck and surrounding surface cleaning for concrete, pavers, stone, textured coatings, and slippery buildup.",
    commonProblems: [
      "Pool deck feels slippery",
      "Concrete or pavers have algae buildup",
      "Outdoor pool area needs seasonal cleaning",
      "Stains or dirt collect around seating areas",
    ],
    priceMin: 150,
    priceMax: 600,
    priceUnit: "flat",
    relatedSlugs: [
      "patio-pressure-washing",
      "concrete-pressure-washing",
      "sidewalk-pressure-washing",
    ],
    formFields: [
      "poolDeckMaterial",
      "approximateSquareFootage",
      "drainageConcerns",
      "waterAccess",
      "photos",
    ],
  },

  "commercial-pressure-washing": {
    slug: "commercial-pressure-washing",
    title: "Commercial Pressure Washing",
    shortTitle: "Commercial Washing",
    parentSlug: "pressure-washing",
    description:
      "Exterior pressure washing for storefronts, sidewalks, entrances, small commercial buildings, dumpster pads, and customer-facing surfaces.",
    commonProblems: [
      "Storefront entry needs cleaning",
      "Commercial sidewalk has stains or gum",
      "Dumpster pad has heavy buildup",
      "Property needs routine exterior maintenance",
    ],
    priceMin: 250,
    priceMax: 1500,
    priceUnit: "flat",
    relatedSlugs: [
      "sidewalk-pressure-washing",
      "concrete-pressure-washing",
      "oil-stain-pressure-washing",
    ],
    formFields: [
      "propertyType",
      "surfaceAreas",
      "preferredServiceTime",
      "waterAccess",
      "photos",
    ],
  },

  "oil-stain-pressure-washing": {
    slug: "oil-stain-pressure-washing",
    title: "Oil Stain Pressure Washing",
    shortTitle: "Oil Stain Cleaning",
    parentSlug: "pressure-washing",
    description:
      "Targeted pressure washing and surface treatment for oil stains, grease spots, tire marks, and vehicle-related stains on concrete or pavers.",
    commonProblems: [
      "Driveway has oil or grease stains",
      "Garage apron has dark vehicle marks",
      "Parking pad needs stain treatment",
      "Concrete needs cleaning before sealing",
    ],
    priceMin: 120,
    priceMax: 500,
    priceUnit: "flat",
    relatedSlugs: [
      "driveway-pressure-washing",
      "concrete-pressure-washing",
      "commercial-pressure-washing",
    ],
    formFields: [
      "stainType",
      "stainAge",
      "surfaceMaterial",
      "approximateSquareFootage",
      "photos",
    ],
  },
};