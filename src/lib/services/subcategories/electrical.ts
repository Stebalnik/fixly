import type { SubcategoryMap } from "../types";

export const electricalSubcategories: SubcategoryMap = {
  "outlet-switch-repair-installation": {
    slug: "outlet-switch-repair-installation",
    title: "Outlet & Switch Repair and Installation",
    shortTitle: "Outlets & Switches",
    parentSlug: "electrical",
    description:
      "Repair, replacement, and installation of outlets, switches, dimmers, USB outlets, GFCI devices, and damaged electrical wall devices.",
    commonProblems: [
      "Loose outlets",
      "Dead outlets",
      "Sparking switches",
      "Broken dimmers",
      "Warm outlet plates",
      "Outdated two-prong outlets",
    ],
    priceMin: 95,
    priceMax: 450,
    priceUnit: "flat",
    relatedSlugs: [
      "gfci-outlet-installation",
      "dedicated-circuit-installation",
      "wiring-repair-troubleshooting",
    ],
    formFields: ["device_count", "device_type", "power_issue", "photos", "description"],
  },

  "gfci-outlet-installation": {
    slug: "gfci-outlet-installation",
    title: "GFCI Outlet Installation and Replacement",
    shortTitle: "GFCI Outlets",
    parentSlug: "electrical",
    description:
      "Installation and replacement of GFCI outlets for kitchens, bathrooms, garages, laundry rooms, basements, exterior areas, and other wet-location spaces.",
    commonProblems: [
      "Outlet will not reset",
      "Bathroom outlet not working",
      "Kitchen GFCI keeps tripping",
      "Outdoor outlet has no protection",
      "Older outlet near water",
      "Inspection correction needed",
    ],
    priceMin: 120,
    priceMax: 500,
    priceUnit: "flat",
    relatedSlugs: [
      "outlet-switch-repair-installation",
      "electrical-safety-inspection",
      "wiring-repair-troubleshooting",
    ],
    formFields: ["outlet_count", "location", "existing_gfci", "tripping_issue", "photos"],
  },

  "light-fixture-installation": {
    slug: "light-fixture-installation",
    title: "Light Fixture Installation",
    shortTitle: "Light Fixtures",
    parentSlug: "electrical",
    description:
      "Installation and replacement of ceiling lights, chandeliers, pendant lights, vanity lights, recessed lights, sconces, and exterior fixtures.",
    commonProblems: [
      "Old fixture replacement",
      "New fixture needs wiring",
      "Fixture is heavy",
      "Light flickers",
      "No ceiling box",
      "Incorrect mounting hardware",
    ],
    priceMin: 120,
    priceMax: 750,
    priceUnit: "flat",
    relatedSlugs: [
      "lighting-upgrades",
      "ceiling-fan-installation",
      "wiring-repair-troubleshooting",
    ],
    formFields: ["fixture_type", "fixture_count", "ceiling_height", "existing_wiring", "photos"],
  },

  "lighting-upgrades": {
    slug: "lighting-upgrades",
    title: "Lighting Upgrades",
    shortTitle: "Lighting Upgrades",
    parentSlug: "electrical",
    description:
      "Electrical lighting upgrades including LED conversions, recessed lighting, dimmers, fixture replacement, exterior lighting, and room-by-room lighting improvements.",
    commonProblems: [
      "Poor room lighting",
      "Outdated fixtures",
      "High energy usage",
      "Missing dimmers",
      "Dark kitchen or hallway",
      "Exterior lighting upgrades",
    ],
    priceMin: 250,
    priceMax: 2500,
    priceUnit: "flat",
    relatedSlugs: [
      "light-fixture-installation",
      "outlet-switch-repair-installation",
      "dedicated-circuit-installation",
    ],
    formFields: ["room_count", "lighting_goal", "fixture_count", "dimmer_needed", "photos"],
  },

  "ceiling-fan-installation": {
    slug: "ceiling-fan-installation",
    title: "Ceiling Fan Installation",
    shortTitle: "Ceiling Fans",
    parentSlug: "electrical",
    description:
      "Ceiling fan installation, replacement, wiring, remote control setup, fan-rated box installation, and troubleshooting for residential rooms and covered outdoor areas.",
    commonProblems: [
      "Fan replacement",
      "No fan-rated box",
      "Fan wobbling",
      "Remote not working",
      "No wall switch",
      "High ceiling installation",
    ],
    priceMin: 150,
    priceMax: 650,
    priceUnit: "flat",
    relatedSlugs: [
      "light-fixture-installation",
      "wiring-repair-troubleshooting",
      "outlet-switch-repair-installation",
    ],
    formFields: ["fan_count", "ceiling_height", "existing_fixture", "fan_rated_box", "photos"],
  },

  "breaker-panel-repair": {
    slug: "breaker-panel-repair",
    title: "Breaker Panel Repair",
    shortTitle: "Breaker Panel",
    parentSlug: "electrical",
    description:
      "Troubleshooting and repair for breaker panels, tripping breakers, damaged breakers, labeled circuits, subpanels, and electrical capacity concerns.",
    commonProblems: [
      "Breaker keeps tripping",
      "Panel buzzing",
      "Burning smell near panel",
      "Breaker will not reset",
      "Unlabeled panel",
      "Overloaded circuit",
    ],
    priceMin: 150,
    priceMax: 1500,
    priceUnit: "flat",
    relatedSlugs: [
      "electrical-safety-inspection",
      "dedicated-circuit-installation",
      "wiring-repair-troubleshooting",
    ],
    formFields: ["panel_type", "breaker_issue", "affected_area", "urgency", "photos"],
  },

  "dedicated-circuit-installation": {
    slug: "dedicated-circuit-installation",
    title: "Dedicated Circuit Installation",
    shortTitle: "Dedicated Circuits",
    parentSlug: "electrical",
    description:
      "Installation of dedicated electrical circuits for appliances, microwaves, HVAC equipment, garage tools, office equipment, EV chargers, and high-load devices.",
    commonProblems: [
      "Appliance trips breaker",
      "New equipment needs power",
      "Garage tool circuit needed",
      "Microwave needs dedicated circuit",
      "Home office power upgrade",
      "Panel capacity check needed",
    ],
    priceMin: 350,
    priceMax: 1800,
    priceUnit: "flat",
    relatedSlugs: [
      "breaker-panel-repair",
      "ev-charger-installation",
      "wiring-repair-troubleshooting",
    ],
    formFields: ["equipment_type", "distance_from_panel", "panel_access", "voltage_needed", "photos"],
  },

  "wiring-repair-troubleshooting": {
    slug: "wiring-repair-troubleshooting",
    title: "Wiring Repair and Troubleshooting",
    shortTitle: "Wiring Repair",
    parentSlug: "electrical",
    description:
      "Electrical troubleshooting for dead circuits, flickering lights, partial power loss, damaged wiring, loose connections, and unknown electrical issues.",
    commonProblems: [
      "Flickering lights",
      "Partial power outage",
      "Dead room circuit",
      "Loose wiring",
      "Burning smell",
      "Unknown electrical problem",
    ],
    priceMin: 125,
    priceMax: 1200,
    priceUnit: "flat",
    relatedSlugs: [
      "electrical-safety-inspection",
      "breaker-panel-repair",
      "outlet-switch-repair-installation",
    ],
    formFields: ["issue_type", "affected_rooms", "when_started", "breaker_tripping", "photos"],
  },

  "ev-charger-installation": {
    slug: "ev-charger-installation",
    title: "EV Charger Installation",
    shortTitle: "EV Chargers",
    parentSlug: "electrical",
    description:
      "Level 2 EV charger installation, outlet installation, circuit installation, load assessment, garage wiring, and charger replacement for electric vehicles.",
    commonProblems: [
      "Level 2 charger needed",
      "Garage outlet not sufficient",
      "Panel capacity concern",
      "Long wire run",
      "Charger replacement",
      "Permit or inspection required",
    ],
    priceMin: 500,
    priceMax: 2500,
    priceUnit: "flat",
    relatedSlugs: [
      "dedicated-circuit-installation",
      "breaker-panel-repair",
      "electrical-safety-inspection",
    ],
    formFields: ["charger_model", "garage_location", "panel_location", "distance_from_panel", "photos"],
  },

  "generator-transfer-switch-installation": {
    slug: "generator-transfer-switch-installation",
    title: "Generator Transfer Switch Installation",
    shortTitle: "Transfer Switch",
    parentSlug: "electrical",
    description:
      "Installation of generator transfer switches, inlet boxes, interlock kits, and backup power connections for safer home generator use.",
    commonProblems: [
      "Portable generator connection needed",
      "Unsafe extension cord setup",
      "Backup power planning",
      "Interlock kit needed",
      "Panel compatibility check",
      "Storm outage preparation",
    ],
    priceMin: 650,
    priceMax: 2500,
    priceUnit: "flat",
    relatedSlugs: [
      "breaker-panel-repair",
      "dedicated-circuit-installation",
      "electrical-safety-inspection",
    ],
    formFields: ["generator_type", "panel_type", "circuits_needed", "inlet_location", "photos"],
  },

  "surge-protection-installation": {
    slug: "surge-protection-installation",
    title: "Whole-Home Surge Protection Installation",
    shortTitle: "Surge Protection",
    parentSlug: "electrical",
    description:
      "Whole-home surge protector installation and replacement to help protect appliances, electronics, HVAC equipment, and smart home devices from power surges.",
    commonProblems: [
      "Frequent power surges",
      "Sensitive electronics",
      "Storm protection",
      "HVAC equipment protection",
      "Panel-mounted device needed",
      "Old surge device replacement",
    ],
    priceMin: 250,
    priceMax: 900,
    priceUnit: "flat",
    relatedSlugs: [
      "breaker-panel-repair",
      "electrical-safety-inspection",
      "dedicated-circuit-installation",
    ],
    formFields: ["panel_type", "surge_device_available", "home_size", "recent_surge_damage", "photos"],
  },

  "electrical-safety-inspection": {
    slug: "electrical-safety-inspection",
    title: "Electrical Safety Inspection",
    shortTitle: "Safety Inspection",
    parentSlug: "electrical",
    description:
      "Electrical inspections for older homes, remodels, home purchases, insurance requests, recurring breaker trips, unsafe wiring, and safety concerns.",
    commonProblems: [
      "Older home wiring",
      "Home purchase inspection",
      "Insurance correction",
      "Burning smell",
      "Repeated breaker trips",
      "Unpermitted electrical work",
    ],
    priceMin: 150,
    priceMax: 700,
    priceUnit: "flat",
    relatedSlugs: [
      "breaker-panel-repair",
      "wiring-repair-troubleshooting",
      "gfci-outlet-installation",
    ],
    formFields: ["inspection_reason", "home_age", "known_issues", "deadline", "photos"],
  },

  "smoke-detector-installation": {
    slug: "smoke-detector-installation",
    title: "Smoke Detector Installation",
    shortTitle: "Smoke Detectors",
    parentSlug: "electrical",
    description:
      "Installation, replacement, and troubleshooting of hardwired smoke detectors, carbon monoxide detectors, interconnected alarms, and battery backup devices.",
    commonProblems: [
      "Old smoke detectors",
      "Hardwired detector replacement",
      "Detector chirping",
      "CO detector needed",
      "Interconnected alarms",
      "Inspection correction",
    ],
    priceMin: 100,
    priceMax: 600,
    priceUnit: "flat",
    relatedSlugs: [
      "electrical-safety-inspection",
      "wiring-repair-troubleshooting",
      "outlet-switch-repair-installation",
    ],
    formFields: ["detector_count", "hardwired_existing", "co_detector_needed", "ceiling_height", "photos"],
  },

  "commercial-electrical-maintenance": {
    slug: "commercial-electrical-maintenance",
    title: "Commercial Electrical Maintenance",
    shortTitle: "Commercial Electrical",
    parentSlug: "electrical",
    description:
      "Electrical maintenance and repair for small businesses, offices, retail spaces, rental properties, restaurants, and light commercial spaces.",
    commonProblems: [
      "Lighting outage",
      "Breaker issues",
      "Tenant improvement electrical",
      "Exit sign or emergency light issue",
      "Outlet repairs",
      "Scheduled maintenance",
    ],
    priceMin: 175,
    priceMax: 2500,
    priceUnit: "flat",
    relatedSlugs: [
      "lighting-upgrades",
      "breaker-panel-repair",
      "electrical-safety-inspection",
    ],
    formFields: ["business_type", "issue_type", "access_hours", "urgency", "photos"],
  },
};