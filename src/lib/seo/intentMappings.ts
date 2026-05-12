import type { Category } from "@/lib/services/categories";
import type { Subcategory } from "@/lib/services/types";
import type { ServiceIntentSlug } from "@/lib/seo/intents";

export type IntentStrength = "blocked" | "weak" | "strong";

export type IntentValidationResult = {
  status: IntentStrength;
  reason: string;
};

type IntentRule = {
  universal?: boolean;
  strongCategorySlugs?: string[];
  blockedCategorySlugs?: string[];
  strongTextMatches?: string[];
  blockedTextMatches?: string[];
};

const intentRules: Record<ServiceIntentSlug, IntentRule> = {
  "near-me": {
    universal: true,
  },

  price: {
    universal: true,
  },

  residential: {
    universal: true,
  },

  commercial: {
    universal: true,
  },

  insured: {
    universal: true,
  },

  weekend: {
    universal: true,
  },

  cheap: {
    universal: true,
    blockedTextMatches: [
      "emergency",
      "gas line",
      "electrical panel",
      "structural",
      "permit required",
    ],
  },

  licensed: {
    universal: true,
    strongCategorySlugs: [
      "plumbing",
      "electrical",
      "roofing",
      "hvac",
      "remodeling",
      "flooring",
      "solar",
      "pool",
      "fence-installation-repair-services",
    ],
  },

  "same-day": {
    universal: true,
    strongTextMatches: [
      "repair",
      "junk",
      "clean",
      "cleaning",
      "handyman",
      "assembly",
      "mounting",
      "installation",
      "pickup",
      "removal",
      "clog",
      "leak",
      "broken",
      "urgent",
    ],
  },

  emergency: {
    universal: true,
    blockedCategorySlugs: [
      "moving",
      "painting",
    ],
    strongCategorySlugs: [
      "plumbing",
      "electrical",
      "roofing",
      "hvac",
      "appliance-repair-installation",
      "garage",
      "pest",
      "pool",
    ],
    strongTextMatches: [
      "repair",
      "leak",
      "broken",
      "clog",
      "damage",
      "storm",
      "water",
      "power",
      "heat",
      "cooling",
      "door",
      "pump",
      "emergency",
    ],
  },

  "24-hour": {
    universal: true,
    blockedCategorySlugs: [
      "moving",
      "painting",
    ],
    strongCategorySlugs: [
      "plumbing",
      "electrical",
      "roofing",
      "hvac",
      "garage",
      "appliance-repair-installation",
      "pest",
    ],
    strongTextMatches: [
      "repair",
      "emergency",
      "leak",
      "broken",
      "clog",
      "damage",
      "door",
      "power",
      "heat",
      "cooling",
    ],
  },

  "move-out": {
    universal: false,
    strongCategorySlugs: [
      "cleaning",
      "moving",
    ],
    strongTextMatches: [
      "clean",
      "cleaning",
      "move",
      "moving",
      "move-out",
      "move out",
    ],
  },

  "deep-cleaning": {
    universal: false,
    strongCategorySlugs: [
      "cleaning",
    ],
    strongTextMatches: [
      "clean",
      "cleaning",
      "deep",
    ],
  },
};

const semanticGarbagePairs: Array<{
  intentSlug: ServiceIntentSlug;
  blockedCategorySlugs: string[];
}> = [
  {
    intentSlug: "move-out",
    blockedCategorySlugs: [
      "roofing",
      "electrical",
      "plumbing",
      "hvac",
      "solar",
      "pool",
      "lawn-care",
      "pressure-washing",
      "junk-removal",
      "fence-installation-repair-services",
      "flooring",
      "remodeling",
    ],
  },
  {
    intentSlug: "deep-cleaning",
    blockedCategorySlugs: [
      "roofing",
      "electrical",
      "plumbing",
      "hvac",
      "solar",
      "pool",
      "lawn-care",
      "junk-removal",
      "fence-installation-repair-services",
      "flooring",
      "remodeling",
      "moving",
      "painting",
    ],
  },
];

function normalizeText(value: string) {
  return value.toLowerCase();
}

function getSearchableText(args: {
  category?: Category | null;
  subcategory?: Subcategory | null;
}) {
  const { category, subcategory } = args;

  return normalizeText(
    [
      category?.slug,
      category?.title,
      category?.shortTitle,
      category?.description,
      subcategory?.slug,
      subcategory?.title,
      subcategory?.shortTitle,
      subcategory?.description,
      ...(subcategory?.commonProblems ?? []),
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function hasAnyMatch(text: string, matches?: string[]) {
  if (!matches || matches.length === 0) {
    return false;
  }

  return matches.some((match) => text.includes(match));
}

function hasBlockedMatch(text: string, matches?: string[]) {
  if (!matches || matches.length === 0) {
    return false;
  }

  return matches.some((match) => text.includes(match));
}

function isSemanticGarbage(args: {
  categorySlug: string;
  intentSlug: ServiceIntentSlug;
}) {
  return semanticGarbagePairs.some((pair) => {
    return (
      pair.intentSlug === args.intentSlug &&
      pair.blockedCategorySlugs.includes(args.categorySlug)
    );
  });
}

export function getIntentValidation(args: {
  category?: Category | null;
  subcategory?: Subcategory | null;
  intentSlug: string;
}): IntentValidationResult {
  const { category, subcategory, intentSlug } = args;

  if (!category) {
    return {
      status: "blocked",
      reason: "Missing category.",
    };
  }

  const typedIntentSlug = intentSlug as ServiceIntentSlug;
  const rule = intentRules[typedIntentSlug];

  if (!rule) {
    return {
      status: "blocked",
      reason: "Unknown intent.",
    };
  }

  if (
    isSemanticGarbage({
      categorySlug: category.slug,
      intentSlug: typedIntentSlug,
    })
  ) {
    return {
      status: "blocked",
      reason: "Semantically invalid category and intent combination.",
    };
  }

  if (rule.blockedCategorySlugs?.includes(category.slug)) {
    return {
      status: "blocked",
      reason: "Intent is blocked for this category.",
    };
  }

  const text = getSearchableText({
    category,
    subcategory,
  });

  if (hasBlockedMatch(text, rule.blockedTextMatches)) {
    return {
      status: "weak",
      reason: "Intent is plausible but not a primary SEO match.",
    };
  }

  if (rule.strongCategorySlugs?.includes(category.slug)) {
    return {
      status: "strong",
      reason: "Intent is a strong category match.",
    };
  }

  if (hasAnyMatch(text, rule.strongTextMatches)) {
    return {
      status: "strong",
      reason: "Intent is a strong text match.",
    };
  }

  if (rule.universal) {
    return {
      status: "weak",
      reason: "Intent is broadly plausible but not a strong match.",
    };
  }

  return {
    status: "blocked",
    reason: "Intent is not valid for this service.",
  };
}

export function isIntentAllowedForService(args: {
  category?: Category | null;
  subcategory?: Subcategory | null;
  intentSlug: string;
}) {
  return getIntentValidation(args).status !== "blocked";
}

export function isStrongIntentForService(args: {
  category?: Category | null;
  subcategory?: Subcategory | null;
  intentSlug: string;
}) {
  return getIntentValidation(args).status === "strong";
}

export function getAllowedIntentsForService(args: {
  category?: Category | null;
  subcategory?: Subcategory | null;
  intentSlugs: ServiceIntentSlug[];
}) {
  return args.intentSlugs.filter((intentSlug) =>
    isIntentAllowedForService({
      category: args.category,
      subcategory: args.subcategory,
      intentSlug,
    })
  );
}

export function getStrongIntentsForService(args: {
  category?: Category | null;
  subcategory?: Subcategory | null;
  intentSlugs: ServiceIntentSlug[];
}) {
  return args.intentSlugs.filter((intentSlug) =>
    isStrongIntentForService({
      category: args.category,
      subcategory: args.subcategory,
      intentSlug,
    })
  );
}

export function isIntentAllowedForCategory(
  categorySlug: string,
  intentSlug: string
) {
  return isIntentAllowedForService({
    category: {
      slug: categorySlug,
      title: categorySlug,
      shortTitle: categorySlug,
      description: categorySlug,
      icon: "",
    } as Category,
    intentSlug,
  });
}