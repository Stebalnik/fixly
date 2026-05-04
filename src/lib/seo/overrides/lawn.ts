function makeLawnOverride(service: string) {
  return {
    includedItems: [
      `${service} request review`,
      "Property condition and access notes",
      "Scope discussion before work starts",
      "Basic timing and availability coordination",
      "Residential and small commercial support",
      "Cleanup expectations when included in scope",
    ],
    priceFactors: [
      "Yard size and service area",
      "Current lawn or landscape condition",
      "Grass height, debris amount, or overgrowth level",
      "Haul-away, bagging, or material needs",
      "Equipment access, slope, gates, and parking",
      "One-time, same-day, or recurring service timing",
    ],
    whenToHirePro: [
      "The yard is overgrown or difficult to maintain safely.",
      "You need the property cleaned up quickly for guests, sale, rent, or HOA compliance.",
      "The job requires equipment, repeated work, or hauling.",
      "You want a clearer plan for ongoing lawn care instead of one-off fixes.",
    ],
    searchPhrases: [
      `${service} near me`,
      `same day ${service.toLowerCase()}`,
      `affordable ${service.toLowerCase()}`,
      `local ${service.toLowerCase()} pro`,
      `best ${service.toLowerCase()} company`,
      `${service.toLowerCase()} cost`,
      `${service.toLowerCase()} price`,
      `residential ${service.toLowerCase()}`,
      `commercial ${service.toLowerCase()}`,
      `urgent ${service.toLowerCase()}`,
    ],
    localSeoParagraphs: [
      `${service} requests are often time-sensitive because outdoor conditions can change quickly during growing season, after storms, or before move-ins and property showings.`,
      `A strong lawn request should describe the yard size, current condition, access, debris amount, photos, and whether the work is one-time or recurring.`,
      `Fixly helps homeowners submit structured lawn care requests so local pros can respond with relevant availability, scope, and price guidance.`,
    ],
    faq: [
      {
        question: `How much does ${service.toLowerCase()} cost?`,
        answer:
          "Cost depends on yard size, current condition, access, cleanup needs, materials, haul-away, and urgency. A small routine job costs less than heavy cleanup, repair, or installation work.",
      },
      {
        question: `Can I request same-day ${service.toLowerCase()}?`,
        answer:
          "Same-day availability depends on local pro schedules, weather, daylight, and job size. Include photos and timing needs so pros can respond faster.",
      },
      {
        question: `What should I include in a ${service.toLowerCase()} request?`,
        answer:
          "Include yard size, grass height or condition, photos, access notes, gate details, pets, parking, service frequency, and whether debris or material hauling is needed.",
      },
    ],
  };
}

export const lawnOverrides = {
  "lawn-mowing-service": makeLawnOverride("Lawn mowing service"),
  "lawn-maintenance-service": makeLawnOverride("Lawn maintenance service"),
  "yard-cleanup-service": makeLawnOverride("Yard cleanup service"),
  "leaf-removal-service": makeLawnOverride("Leaf removal service"),
  "weed-control-service": makeLawnOverride("Weed control service"),
  "mulch-installation-service": makeLawnOverride("Mulch installation service"),
  "flower-bed-maintenance": makeLawnOverride("Flower bed maintenance"),
  "landscape-edging-service": makeLawnOverride("Landscape edging service"),
  "sod-installation-service": makeLawnOverride("Sod installation service"),
  "lawn-repair-service": makeLawnOverride("Lawn repair service"),
  "grass-seeding-overseeding": makeLawnOverride("Grass seeding and overseeding"),
  "lawn-aeration-service": makeLawnOverride("Lawn aeration service"),
  "lawn-fertilization-service": makeLawnOverride("Lawn fertilization service"),
  "brush-removal-service": makeLawnOverride("Brush removal service"),
  "hedge-trimming-service": makeLawnOverride("Hedge trimming service"),
  "small-tree-shrub-removal": makeLawnOverride("Small tree and shrub removal"),
  "lawn-grading-leveling": makeLawnOverride("Lawn grading and leveling"),
  "seasonal-lawn-care": makeLawnOverride("Seasonal lawn care"),
  "sprinkler-repair-service": makeLawnOverride("Sprinkler repair service"),
};