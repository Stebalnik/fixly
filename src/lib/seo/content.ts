import type { Market } from "@/lib/geo";
import type { Category, Subcategory } from "@/lib/services";
import type { ServiceIntent } from "@/lib/seo/intents";

function getServiceName(category?: Category, subcategory?: Subcategory) {
  return subcategory?.shortTitle ?? category?.shortTitle ?? "home service";
}

function getIntentServiceName(params: {
  serviceName: string;
  intent?: ServiceIntent;
}) {
  const { serviceName, intent } = params;

  if (!intent) return serviceName;

  if (intent.slug === "price") return `${serviceName} cost`;
  if (intent.slug === "near-me") return `${serviceName} near me`;
  if (intent.slug === "cheap") return `affordable ${serviceName}`;

  return `${intent.seoTitleSuffix.toLowerCase()} ${serviceName}`;
}

export function getServiceSeoIntro(params: {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
  intent?: ServiceIntent;
}): string {
  const { market, category, subcategory, intent } = params;

  const baseServiceName = getServiceName(category, subcategory);
  const serviceName = getIntentServiceName({
    serviceName: baseServiceName.toLowerCase(),
    intent,
  });

  if (intent) {
    return `If you need ${serviceName} in ${market.city}, ${market.state}, Fixly helps you describe the job clearly and connect with local professionals who can review the request, availability, timing, and pricing factors. This page focuses on ${intent.title.toLowerCase()} intent, so the request should include scope, urgency, access notes, photos when helpful, and the best time to respond.`;
  }

  return `If you need ${baseServiceName.toLowerCase()} in ${market.city}, ${market.state}, Fixly helps you connect with local professionals who can review your request, respond quickly, and provide clear next steps. Whether it is a small repair, installation, maintenance task, or a larger home project, you can describe what you need and let available pros in the ${market.region} area respond.`;
}

export function getServiceSeoDetails(params: {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
  intent?: ServiceIntent;
}): string[] {
  const { market, category, subcategory, intent } = params;

  const baseServiceName = getServiceName(category, subcategory);
  const serviceName = getIntentServiceName({
    serviceName: baseServiceName.toLowerCase(),
    intent,
  });

  if (intent) {
    return [
      `${serviceName} requests in ${market.city} often depend on project size, access, materials, timing, availability, and the condition of the property.`,
      `Fixly helps turn a ${intent.title.toLowerCase()} search into a clear local request that pros can evaluate before responding.`,
      `Homeowners in ${market.city}, ${market.state} can use Fixly to request help without calling multiple companies one by one.`,
    ];
  }

  return [
    `${baseServiceName} requests in ${market.city} often depend on project size, access, materials, timing, and the condition of the property.`,
    `Fixly is designed to make the process easier by turning your request into a clear job description that local pros can understand and respond to.`,
    `Homeowners in ${market.city}, ${market.state} can use Fixly to request help without calling multiple companies one by one.`,
  ];
}

export function getServiceFaq(params: {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
  intent?: ServiceIntent;
}) {
  const { market, category, subcategory, intent } = params;

  const baseServiceName = getServiceName(category, subcategory);
  const serviceName = getIntentServiceName({
    serviceName: baseServiceName.toLowerCase(),
    intent,
  });

  const baseFaq = [
    {
      question: `How do I request ${serviceName} in ${market.city}?`,
      answer: `Start by describing the work you need, the location, timing, and any important details. Fixly turns that into a service request so local pros can respond.`,
    },
    {
      question: `How much does ${serviceName} cost in ${market.city}?`,
      answer: subcategory
        ? `Typical estimates may range from $${subcategory.priceMin} to $${subcategory.priceMax}, but the final price depends on scope, materials, access, timing, and urgency.`
        : `Pricing depends on the type of work, project size, materials, access, timing, and urgency.`,
    },
    {
      question: `Can local pros respond to my request?`,
      answer: `Yes. Fixly is being built as a request marketplace where homeowners can post service needs and registered pros can respond.`,
    },
  ];

  if (!intent) return baseFaq;

  return [
    {
      question: `What should I include in a ${intent.title.toLowerCase()} ${baseServiceName.toLowerCase()} request?`,
      answer: `Include the problem, address area, timing, photos if available, access notes, and whether the issue is urgent, flexible, or tied to a specific appointment window.`,
    },
    ...baseFaq,
  ];
}