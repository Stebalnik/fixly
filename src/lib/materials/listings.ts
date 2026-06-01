export function formatMaterialPrice(priceCents: number | null) {
  if (priceCents === null) return "Make offer";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}

export function formatMaterialCategory(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatMaterialCondition(value: string) {
  return value.replace("_", " ");
}

export function getMaterialListingPath(publicSlug: string) {
  return `/marketplace/${publicSlug}`;
}
