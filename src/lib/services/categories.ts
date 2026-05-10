export type Category = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  subcategories: string[];
};

export const categories: Record<string, Category> = {
  handyman: {
    slug: "handyman",
    title: "Handyman Services",
    shortTitle: "Handyman",
    description:
      "Professional handyman services for repairs, installations, furniture assembly, drywall repair, mounting, and home maintenance.",
    icon: "handyman",
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
      "Licensed plumbers for leak repair, drain cleaning, fixture installation, toilet repair, water heaters, pipe repair, sewer lines, and emergency plumbing.",
    icon: "plumbing",
    subcategories: [
      "leak-detection-repair",
      "drain-cleaning",
      "toilet-repair-installation",
      "water-heater-repair-installation",
      "garbage-disposal-plumbing",
      "pipe-repair-replacement",
      "sump-pump-repair",
      "faucet-sink-repair-installation",
      "shower-bathtub-plumbing",
      "sewer-line-services",
      "water-line-services",
      "emergency-plumbing-repair",
      "backflow-prevention-testing",
      "commercial-plumbing-maintenance",
      "plumbing-fixtures",
    ],
  },

  electrical: {
    slug: "electrical",
    title: "Electrical Services",
    shortTitle: "Electrical",
    description:
      "Licensed electricians for electrical repair, panel upgrades, lighting, outlets, ceiling fans, EV chargers, generators, inspections, and emergency electrical work.",
    icon: "electrical",
    subcategories: [
      "lighting-electrical",
      "lighting-upgrades",
      "outlet-switch-installation",
      "electrical-panel-upgrade",
      "ceiling-fan-installation",
      "ev-charger-installation",
      "generator-installation",
      "electrical-troubleshooting",
      "emergency-electrical-repair",
      "electrical-inspection",
      "commercial-electrical-service",
    ],
  },

  cleaning: {
    slug: "cleaning",
    title: "Cleaning Services",
    shortTitle: "Cleaning",
    description:
      "Professional cleaning services for regular home cleaning, deep cleaning, move-out cleaning, post-construction cleaning, rental turnover, and commercial spaces.",
    icon: "cleaning",
    subcategories: [
      "residential-cleaning",
      "deep-cleaning",
      "move-out-cleaning",
      "move-in-cleaning",
      "post-construction-cleaning",
      "rental-turnover-cleaning",
      "office-commercial-cleaning",
      "carpet-upholstery-cleaning",
      "window-cleaning",
    ],
  },

  painting: {
    slug: "painting",
    title: "Painting Services",
    shortTitle: "Painting",
    description:
      "Interior and exterior painting by professional painters, including drywall repair, ceiling painting, cabinet painting, fence painting, and touch-ups.",
    icon: "painting",
    subcategories: [
      "interior-painting",
      "exterior-painting",
      "popcorn-ceiling",
      "fence-deck-painting",
      "painting-drywall-repair",
      "drywall-painting-texturing",
      "cabinet-painting",
      "ceiling-painting",
      "wallpaper-removal",
      "commercial-painting",
    ],
  },

  solar: {
    slug: "solar",
    title: "Solar Services",
    shortTitle: "Solar",
    description:
      "Solar panel installation, repair, replacement, inverter service, battery backup, inspections, cleaning, maintenance, and commercial solar support.",
    icon: "solar",
    subcategories: [
      "solar-panel-installation",
      "solar-panel-repair",
      "solar-panel-replacement",
      "solar-inverter-repair",
      "solar-battery-backup",
      "solar-panel-cleaning",
      "solar-system-inspection",
      "solar-maintenance-service",
      "off-grid-solar-systems",
      "commercial-solar-service",
    ],
  },

  "lawn-care": {
    slug: "lawn-care",
    title: "Lawn Care & Landscaping",
    shortTitle: "Lawn Care",
    description:
      "Lawn mowing, landscaping, yard cleanup, sod installation, leaf removal, hedge trimming, sprinkler repair, and seasonal outdoor maintenance.",
    icon: "lawn",
    subcategories: [
      "lawn-care-landscaping",
      "lawn-mowing-service",
      "lawn-maintenance-service",
      "yard-cleanup-service",
      "leaf-removal-service",
      "sod-installation-service",
      "lawn-repair-service",
      "flower-bed-maintenance",
      "mulch-installation-service",
      "hedge-trimming-service",
      "small-tree-shrub-removal",
      "lawn-grading-leveling",
      "seasonal-lawn-care",
      "sprinkler-repair-service",
    ],
  },

  pool: {
    slug: "pool",
    title: "Pool Services",
    shortTitle: "Pool",
    description:
      "Pool cleaning, weekly maintenance, chemical balancing, green pool cleanup, pump repair, heater repair, leak detection, filter service, and seasonal pool care.",
    icon: "pool",
    subcategories: [
      "pool-cleaning-service",
      "weekly-pool-maintenance",
      "green-pool-cleanup",
      "pool-chemical-balancing",
      "pool-pump-repair",
      "pool-filter-cleaning",
      "pool-filter-repair",
      "pool-heater-repair",
      "pool-leak-detection",
      "pool-equipment-repair",
      "saltwater-pool-service",
      "pool-opening-service",
      "pool-closing-winterization",
      "pool-inspection",
      "pool-cover-installation",
    ],
  },

  roofing: {
    slug: "roofing",
    title: "Roofing Services",
    shortTitle: "Roofing",
    description:
      "Roof installation, repair, replacement, leak repair, storm damage restoration, gutter work, inspections, and roof maintenance.",
    icon: "roofing",
    subcategories: [
      "roof-installation",
      "roof-repair",
      "roof-replacement",
      "storm-damage-restoration",
      "gutter-installation-repair",
      "roof-inspections-maintenance",
      "roof-leak-repair",
      "shingle-roofing",
      "metal-roofing",
      "flat-roofing",
      "commercial-roofing",
    ],
  },

  "appliance-repair-installation": {
    slug: "appliance-repair-installation",
    title: "Appliance Repair & Installation",
    shortTitle: "Appliances",
    description:
      "Expert repair and installation for washers, dryers, refrigerators, dishwashers, ovens, ranges, microwaves, garbage disposals, and appliance hookups.",
    icon: "appliances",
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
      "Professional pressure washing for driveways, siding, decks, patios, sidewalks, roofs, fences, pool decks, and commercial surfaces.",
    icon: "pressure",
    subcategories: [
      "pressure-washing-exterior",
      "driveway-pressure-washing",
      "house-pressure-washing",
      "deck-pressure-washing",
      "patio-pressure-washing",
      "sidewalk-pressure-washing",
      "fence-pressure-washing",
      "roof-soft-washing",
      "pool-deck-pressure-washing",
      "commercial-pressure-washing",
      "oil-stain-pressure-washing",
    ],
  },

  "junk-removal": {
    slug: "junk-removal",
    title: "Junk Removal",
    shortTitle: "Junk Removal",
    description:
      "Fast junk removal for household junk, furniture, appliances, garage cleanouts, attic cleanouts, yard waste, construction debris, and eviction cleanouts.",
    icon: "junk",
    subcategories: [
      "household-junk-removal",
      "furniture-junk-removal",
      "appliance-junk-removal",
      "garage-cleanout-service",
      "attic-basement-cleanout",
      "yard-waste-removal",
      "construction-debris-removal",
      "estate-cleanout-service",
      "eviction-cleanout-service",
      "hot-tub-removal",
      "mattress-removal",
      "commercial-junk-removal",
    ],
  },

  awnings: {
    slug: "awnings",
    title: "Awning Services",
    shortTitle: "Awnings",
    description:
      "Awning installation, repair, replacement, fabric replacement, frame repair, motorized awning service, removal, lighting, and seasonal setup.",
    icon: "awnings",
    subcategories: [
      "retractable-awning-installation",
      "patio-awning-installation",
      "fixed-awning-installation",
      "commercial-storefront-awning",
      "awning-repair",
      "awning-fabric-replacement",
      "awning-frame-repair",
      "motorized-awning-service",
      "awning-replacement",
      "awning-removal-disposal",
      "seasonal-awning-setup-takedown",
      "awning-lighting-installation",
    ],
  },

  "fence-installation-repair-services": {
    slug: "fence-installation-repair-services",
    title: "Fence Installation & Repair",
    shortTitle: "Fencing",
    description:
      "Fence installation, repair, replacement, gates, wood fencing, vinyl fencing, chain link fencing, privacy fences, and commercial fence work.",
    icon: "fence",
    subcategories: [
      "wood-fence-installation",
      "vinyl-fence-installation",
      "chain-link-fence-installation",
      "privacy-fence-installation",
      "fence-repair-service",
      "fence-replacement-service",
      "gate-installation-repair",
      "commercial-fence-service",
      "pool-fence-installation",
      "decorative-fence-installation",
    ],
  },

  remodeling: {
    slug: "remodeling",
    title: "Remodeling Services",
    shortTitle: "Remodeling",
    description:
      "Kitchen, bathroom, basement, whole-house, cabinet, countertop, backsplash, flooring, and full renovation services.",
    icon: "remodeling",
    subcategories: [
      "kitchen-remodeling",
      "bathroom-remodeling",
      "basement-remodeling",
      "whole-house-renovation",
      "full-renovation",
      "cabinets-countertops",
      "backsplash-installation",
      "shower-remodeling",
      "flooring-remodeling",
      "home-addition-remodeling",
    ],
  },

  flooring: {
    slug: "flooring",
    title: "Flooring Services",
    shortTitle: "Flooring",
    description:
      "Flooring installation, repair, replacement, refinishing, removal, leveling, tile, hardwood, laminate, vinyl, carpet, and commercial flooring.",
    icon: "flooring",
    subcategories: [
      "flooring-installation",
      "flooring-repair",
      "flooring-replacement",
      "hardwood-floor-installation",
      "hardwood-floor-refinishing",
      "laminate-flooring-installation",
      "vinyl-plank-flooring-installation",
      "tile-floor-installation",
      "carpet-installation",
      "floor-removal-service",
      "subfloor-repair-leveling",
      "commercial-flooring",
    ],
  },

  maintenance: {
    slug: "maintenance",
    title: "Maintenance Services",
    shortTitle: "Maintenance",
    description:
      "Home maintenance, rental property maintenance, seasonal upkeep, preventive checks, punch list repairs, emergency handyman help, and small commercial property maintenance.",
    icon: "maintenance",
    subcategories: [
      "home-maintenance-services",
      "rental-property-maintenance",
      "seasonal-home-maintenance",
      "preventive-home-maintenance",
      "punch-list-repairs",
      "property-inspections",
      "turnover-preparation",
      "emergency-handyman",
      "small-commercial-maintenance",
    ],
  },

  hvac: {
    slug: "hvac",
    title: "HVAC & Air Conditioning Services",
    shortTitle: "HVAC",
    description:
      "AC repair, heating repair, furnace service, HVAC installation, maintenance, inspections, ductwork, thermostats, emergency HVAC, and commercial HVAC service.",
    icon: "hvac",
    subcategories: [
      "ac-repair-service",
      "ac-installation-replacement",
      "furnace-repair-service",
      "furnace-installation-replacement",
      "heat-pump-service",
      "mini-split-installation-repair",
      "hvac-maintenance-tune-up",
      "hvac-inspection-troubleshooting",
      "ductwork-repair-installation",
      "thermostat-installation-repair",
      "emergency-hvac-repair",
      "commercial-hvac-service",
    ],
  },

  garage: {
    slug: "garage",
    title: "Garage Door Repair & Installation",
    shortTitle: "Garage Door",
    description:
      "Garage door repair, opener installation, spring replacement, cable repair, track repair, panel replacement, installation, replacement, and maintenance.",
    icon: "garage",
    subcategories: [
      "garage-door-repair",
      "garage-door-installation",
      "garage-door-opener-installation",
      "garage-door-opener-repair",
      "garage-door-spring-replacement",
      "garage-door-cable-repair",
      "garage-door-track-repair",
      "garage-door-panel-replacement",
      "garage-door-maintenance",
      "commercial-garage-door-service",
    ],
  },

  pest: {
    slug: "pest",
    title: "Pest Control Services",
    shortTitle: "Pest Control",
    description:
      "Pest inspections, extermination, rodent control, termite service, bed bug treatment, mosquito control, wasp removal, ant control, cockroach control, and prevention.",
    icon: "pest",
    subcategories: [
      "general-pest-control",
      "pest-inspection",
      "ant-control-service",
      "cockroach-extermination",
      "rodent-control-service",
      "termite-inspection-treatment",
      "bed-bug-treatment",
      "mosquito-control",
      "wasp-hornet-removal",
      "spider-control",
      "flea-tick-treatment",
      "wildlife-removal",
      "commercial-pest-control",
    ],
  },

  moving: {
    slug: "moving",
    title: "Moving Services",
    shortTitle: "Moving",
    description:
      "Local movers, apartment moving, packing, loading, unloading, furniture moving, office moves, senior moves, storage moving help, and urgent moving labor.",
    icon: "moving",
    subcategories: [
      "local-moving-service",
      "apartment-moving-service",
      "house-moving-service",
      "packing-unpacking-service",
      "loading-unloading-help",
      "furniture-moving-service",
      "single-item-moving",
      "office-moving-service",
      "senior-moving-service",
      "storage-unit-moving",
      "same-day-moving-help",
      "commercial-moving-service",
    ],
  },
};

export function getCategoryBySlug(slug: string): Category | undefined {
  return Object.values(categories).find((category) => category.slug === slug);
}

export function getAllCategorySlugs(): string[] {
  return Object.values(categories).map((category) => category.slug);
}