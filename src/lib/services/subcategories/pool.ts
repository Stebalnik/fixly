import type { SubcategoryMap } from "../types";

export const poolSubcategories: SubcategoryMap = {
  "pool-cleaning-service": {
    slug: "pool-cleaning-service",
    title: "Pool Cleaning Service",
    shortTitle: "Pool Cleaning",
    parentSlug: "pool",
    description:
      "Regular and one-time pool cleaning for leaves, debris, brushing, skimming, baskets, and water clarity.",
    commonProblems: [
      "Leaves and debris in the pool",
      "Cloudy pool water",
      "Dirty pool walls or tile line",
      "Clogged skimmer or pump baskets",
      "Pool needs cleaning before guests or listing photos",
    ],
    priceMin: 90,
    priceMax: 220,
    priceUnit: "flat",
    relatedSlugs: [
      "weekly-pool-maintenance",
      "green-pool-cleanup",
      "pool-chemical-balancing",
    ],
    formFields: [
      "poolType",
      "poolSize",
      "lastServiceDate",
      "waterCondition",
      "hasPhotos",
    ],
  },

  "weekly-pool-maintenance": {
    slug: "weekly-pool-maintenance",
    title: "Weekly Pool Maintenance",
    shortTitle: "Weekly Pool Service",
    parentSlug: "pool",
    description:
      "Recurring pool maintenance for cleaning, water testing, chemical balancing, equipment checks, and seasonal care.",
    commonProblems: [
      "Pool needs consistent weekly service",
      "Water chemistry changes quickly",
      "Algae keeps returning",
      "Filter pressure needs monitoring",
      "Homeowner wants hands-off pool care",
    ],
    priceMin: 120,
    priceMax: 320,
    priceUnit: "flat",
    relatedSlugs: [
      "pool-cleaning-service",
      "pool-chemical-balancing",
      "pool-filter-cleaning",
    ],
    formFields: [
      "poolType",
      "poolSize",
      "serviceFrequency",
      "equipmentType",
      "gateAccess",
    ],
  },

  "green-pool-cleanup": {
    slug: "green-pool-cleanup",
    title: "Green Pool Cleanup",
    shortTitle: "Green Pool Cleanup",
    parentSlug: "pool",
    description:
      "Green pool recovery for algae, cloudy water, debris removal, chemical treatment, brushing, filtration, and cleanup planning.",
    commonProblems: [
      "Pool water turned green",
      "Algae on walls or floor",
      "Pool has been neglected",
      "Water is cloudy after treatment",
      "Pool needs cleanup before reopening",
    ],
    priceMin: 180,
    priceMax: 650,
    priceUnit: "flat",
    relatedSlugs: [
      "pool-cleaning-service",
      "pool-chemical-balancing",
      "pool-filter-cleaning",
    ],
    formFields: [
      "poolType",
      "poolSize",
      "waterColor",
      "visibleDebris",
      "lastServiceDate",
    ],
  },

  "pool-chemical-balancing": {
    slug: "pool-chemical-balancing",
    title: "Pool Chemical Balancing",
    shortTitle: "Chemical Balancing",
    parentSlug: "pool",
    description:
      "Pool water testing and chemical balancing for chlorine, pH, alkalinity, stabilizer, calcium hardness, and safe swimming conditions.",
    commonProblems: [
      "Chlorine level is too low or too high",
      "pH is out of range",
      "Water irritates eyes or skin",
      "Pool smells strongly of chemicals",
      "Water chemistry is hard to stabilize",
    ],
    priceMin: 85,
    priceMax: 220,
    priceUnit: "flat",
    relatedSlugs: [
      "weekly-pool-maintenance",
      "pool-cleaning-service",
      "green-pool-cleanup",
    ],
    formFields: [
      "poolType",
      "poolSize",
      "waterCondition",
      "recentTestResults",
      "swimmingUrgency",
    ],
  },

  "pool-filter-cleaning": {
    slug: "pool-filter-cleaning",
    title: "Pool Filter Cleaning",
    shortTitle: "Filter Cleaning",
    parentSlug: "pool",
    description:
      "Pool filter cleaning for cartridge, DE, and sand filter systems to improve circulation, pressure, and water clarity.",
    commonProblems: [
      "High filter pressure",
      "Weak return flow",
      "Cloudy water after cleaning",
      "Filter has not been cleaned recently",
      "Pump is working harder than usual",
    ],
    priceMin: 100,
    priceMax: 280,
    priceUnit: "flat",
    relatedSlugs: [
      "weekly-pool-maintenance",
      "pool-pump-repair",
      "pool-cleaning-service",
    ],
    formFields: [
      "filterType",
      "filterPressure",
      "lastFilterCleaning",
      "poolSize",
      "equipmentAccess",
    ],
  },

  "pool-pump-repair": {
    slug: "pool-pump-repair",
    title: "Pool Pump Repair",
    shortTitle: "Pool Pump Repair",
    parentSlug: "pool",
    description:
      "Pool pump troubleshooting and repair for noisy pumps, leaks, weak suction, priming issues, and circulation problems.",
    commonProblems: [
      "Pool pump will not turn on",
      "Pump is loud or vibrating",
      "Pump loses prime",
      "Weak suction or poor circulation",
      "Water leaking near pump housing",
    ],
    priceMin: 150,
    priceMax: 650,
    priceUnit: "flat",
    relatedSlugs: [
      "pool-pump-replacement",
      "pool-filter-cleaning",
      "pool-leak-detection",
    ],
    formFields: [
      "pumpBrand",
      "pumpAge",
      "issueDescription",
      "isPumpRunning",
      "hasPhotos",
    ],
  },

  "pool-pump-replacement": {
    slug: "pool-pump-replacement",
    title: "Pool Pump Replacement",
    shortTitle: "Pump Replacement",
    parentSlug: "pool",
    description:
      "Pool pump replacement for failed, aging, inefficient, noisy, or undersized pumps, including variable-speed upgrade planning.",
    commonProblems: [
      "Old pump keeps failing",
      "Pump motor burned out",
      "Energy bill is too high",
      "Pump is undersized for the pool",
      "Homeowner wants a variable-speed pump",
    ],
    priceMin: 650,
    priceMax: 2200,
    priceUnit: "flat",
    relatedSlugs: [
      "pool-pump-repair",
      "pool-equipment-installation",
      "pool-filter-cleaning",
    ],
    formFields: [
      "currentPumpBrand",
      "pumpHorsepower",
      "poolSize",
      "equipmentPadPhotos",
      "preferredPumpType",
    ],
  },

  "pool-heater-repair": {
    slug: "pool-heater-repair",
    title: "Pool Heater Repair",
    shortTitle: "Pool Heater Repair",
    parentSlug: "pool",
    description:
      "Pool heater troubleshooting and repair for gas, electric, and heat pump systems with ignition, temperature, flow, and error-code issues.",
    commonProblems: [
      "Pool heater will not turn on",
      "Heater shows an error code",
      "Water is not getting warm",
      "Heater starts and shuts off",
      "Low flow prevents heating",
    ],
    priceMin: 180,
    priceMax: 900,
    priceUnit: "flat",
    relatedSlugs: [
      "pool-heater-installation",
      "pool-pump-repair",
      "pool-equipment-installation",
    ],
    formFields: [
      "heaterType",
      "heaterBrand",
      "errorCode",
      "poolSize",
      "fuelType",
    ],
  },

  "pool-heater-installation": {
    slug: "pool-heater-installation",
    title: "Pool Heater Installation",
    shortTitle: "Heater Installation",
    parentSlug: "pool",
    description:
      "Pool heater installation and replacement for gas heaters, electric heaters, and heat pumps based on pool size and heating goals.",
    commonProblems: [
      "Pool is too cold to use comfortably",
      "Old heater failed",
      "Homeowner wants longer swim season",
      "Existing heater is inefficient",
      "New pool needs heating equipment",
    ],
    priceMin: 1800,
    priceMax: 6500,
    priceUnit: "flat",
    relatedSlugs: [
      "pool-heater-repair",
      "pool-equipment-installation",
      "pool-pump-replacement",
    ],
    formFields: [
      "heaterType",
      "poolSize",
      "currentEquipment",
      "fuelAvailability",
      "installationPhotos",
    ],
  },

  "pool-leak-detection": {
    slug: "pool-leak-detection",
    title: "Pool Leak Detection",
    shortTitle: "Leak Detection",
    parentSlug: "pool",
    description:
      "Pool leak detection for water loss, suspected plumbing leaks, shell leaks, equipment leaks, and unexplained drops in water level.",
    commonProblems: [
      "Pool loses water every day",
      "Water level drops faster than evaporation",
      "Wet spots near pool or equipment",
      "Air bubbles in return lines",
      "Cracks or leaks are suspected",
    ],
    priceMin: 250,
    priceMax: 750,
    priceUnit: "flat",
    relatedSlugs: [
      "pool-plumbing-repair",
      "pool-pump-repair",
      "pool-tile-coping-repair",
    ],
    formFields: [
      "waterLossAmount",
      "poolType",
      "visibleCracks",
      "equipmentLeak",
      "hasPhotos",
    ],
  },

  "pool-plumbing-repair": {
    slug: "pool-plumbing-repair",
    title: "Pool Plumbing Repair",
    shortTitle: "Pool Plumbing",
    parentSlug: "pool",
    description:
      "Pool plumbing repair for leaking pipes, valves, unions, suction issues, return lines, equipment pad plumbing, and circulation problems.",
    commonProblems: [
      "Water leaking near pool equipment",
      "Broken or leaking valves",
      "Air in pool lines",
      "Poor circulation from plumbing issue",
      "Pool plumbing needs rerouting or repair",
    ],
    priceMin: 180,
    priceMax: 1200,
    priceUnit: "flat",
    relatedSlugs: [
      "pool-leak-detection",
      "pool-pump-repair",
      "pool-equipment-installation",
    ],
    formFields: [
      "leakLocation",
      "pipeMaterial",
      "equipmentPadPhotos",
      "poolType",
      "urgency",
    ],
  },

  "pool-equipment-installation": {
    slug: "pool-equipment-installation",
    title: "Pool Equipment Installation",
    shortTitle: "Equipment Installation",
    parentSlug: "pool",
    description:
      "Pool equipment installation for pumps, filters, heaters, salt systems, automation, valves, timers, and equipment pad upgrades.",
    commonProblems: [
      "New pool equipment needs installation",
      "Equipment pad needs upgrades",
      "Old pool system is inefficient",
      "Automation or timer needs setup",
      "Salt system or filter needs installation",
    ],
    priceMin: 250,
    priceMax: 3500,
    priceUnit: "flat",
    relatedSlugs: [
      "pool-pump-replacement",
      "pool-heater-installation",
      "pool-filter-cleaning",
    ],
    formFields: [
      "equipmentType",
      "existingSystem",
      "poolSize",
      "equipmentPhotos",
      "electricalNeeds",
    ],
  },

  "pool-tile-coping-repair": {
    slug: "pool-tile-coping-repair",
    title: "Pool Tile and Coping Repair",
    shortTitle: "Tile & Coping",
    parentSlug: "pool",
    description:
      "Pool tile and coping repair for loose coping stones, cracked tile, missing grout, damaged waterline tile, and cosmetic pool edge issues.",
    commonProblems: [
      "Loose or broken pool coping",
      "Cracked waterline tile",
      "Missing grout around pool tile",
      "Sharp edges near pool coping",
      "Pool edge looks worn or damaged",
    ],
    priceMin: 250,
    priceMax: 2500,
    priceUnit: "flat",
    relatedSlugs: [
      "pool-resurfacing",
      "pool-leak-detection",
      "pool-cleaning-service",
    ],
    formFields: [
      "damageArea",
      "tileType",
      "linearFeet",
      "hasLooseCoping",
      "hasPhotos",
    ],
  },

  "pool-resurfacing": {
    slug: "pool-resurfacing",
    title: "Pool Resurfacing",
    shortTitle: "Pool Resurfacing",
    parentSlug: "pool",
    description:
      "Pool resurfacing for worn plaster, rough surfaces, stains, cracks, peeling finish, and aging interior pool surfaces.",
    commonProblems: [
      "Pool surface feels rough",
      "Plaster is stained or worn",
      "Pool finish is peeling",
      "Small surface cracks are visible",
      "Pool needs renovation before heavy use",
    ],
    priceMin: 4500,
    priceMax: 18000,
    priceUnit: "flat",
    relatedSlugs: [
      "pool-tile-coping-repair",
      "pool-leak-detection",
      "pool-equipment-installation",
    ],
    formFields: [
      "poolSize",
      "surfaceType",
      "currentCondition",
      "desiredFinish",
      "hasPhotos",
    ],
  },

  "pool-opening-closing": {
    slug: "pool-opening-closing",
    title: "Pool Opening and Closing",
    shortTitle: "Opening & Closing",
    parentSlug: "pool",
    description:
      "Seasonal pool opening and closing services for startup, winterization, covers, equipment checks, water treatment, and reopening prep.",
    commonProblems: [
      "Pool needs opening for the season",
      "Pool needs winterization",
      "Cover needs removal or installation",
      "Equipment needs seasonal startup",
      "Water needs treatment after opening",
    ],
    priceMin: 200,
    priceMax: 650,
    priceUnit: "flat",
    relatedSlugs: [
      "pool-cleaning-service",
      "pool-chemical-balancing",
      "weekly-pool-maintenance",
    ],
    formFields: [
      "serviceType",
      "poolType",
      "coverType",
      "equipmentCondition",
      "preferredDate",
    ],
  },
};