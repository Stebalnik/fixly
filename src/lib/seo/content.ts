import type { Market } from "@/lib/geo";
import type { Category, Subcategory } from "@/lib/services";

export function getServiceSeoIntro(params: {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
}): string {
  const { market, category, subcategory } = params;

  const serviceName =
    subcategory?.shortTitle ?? category?.shortTitle ?? "home service";

  return `If you need ${serviceName.toLowerCase()} in ${market.city}, ${market.state}, Fixly helps you connect with local professionals who can review your request, respond quickly, and provide clear next steps. Whether it is a small repair, installation, maintenance task, or a larger home project, you can describe what you need and let available pros in the ${market.region} area respond.`;
}

export function getServiceSeoDetails(params: {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
}): string[] {
  const { market, category, subcategory } = params;

  const serviceName =
    subcategory?.shortTitle ?? category?.shortTitle ?? "home service";

  return [
    `${serviceName} requests in ${market.city} often depend on project size, access, materials, timing, and the condition of the property.`,
    `Fixly is designed to make the process easier by turning your request into a clear job description that local pros can understand and respond to.`,
    `Homeowners in ${market.city}, ${market.state} can use Fixly to request help without calling multiple companies one by one.`,
  ];
}

export function getServiceFaq(params: {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
}) {
  const { market, category, subcategory } = params;

  const serviceName =
    subcategory?.shortTitle ?? category?.shortTitle ?? "home service";

  return [
    {
      question: `How do I request ${serviceName.toLowerCase()} in ${market.city}?`,
      answer: `Start by describing the work you need, the location, timing, and any important details. Fixly turns that into a service request so local pros can respond.`,
    },
    {
      question: `How much does ${serviceName.toLowerCase()} cost in ${market.city}?`,
      answer: subcategory
        ? `Typical estimates may range from $${subcategory.priceMin} to $${subcategory.priceMax}, but the final price depends on scope, materials, access, and urgency.`
        : `Pricing depends on the type of work, project size, materials, access, and urgency.`,
    },
    {
      question: `Can local pros respond to my request?`,
      answer: `Yes. Fixly is being built as a request marketplace where homeowners can post service needs and registered pros can respond.`,
    },
  ];
}