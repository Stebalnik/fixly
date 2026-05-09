export const FIXA_USD_VALUE = 0.013;

export const FIXA_PRICE_CENTS = 1.3;

export const FIXA_PACKAGES = [
  {
    fixaAmount: 500,
    label: "Starter",
  },
  {
    fixaAmount: 1000,
    label: "Basic",
  },
  {
    fixaAmount: 2500,
    label: "Growth",
  },
  {
    fixaAmount: 5000,
    label: "Pro",
  },
] as const;

export function calculateFixaPriceUsd(fixaAmount: number) {
  if (!Number.isInteger(fixaAmount) || fixaAmount <= 0) {
    throw new Error("Invalid FIXA amount.");
  }

  return fixaAmount * FIXA_USD_VALUE;
}

export function calculateFixaPriceCents(fixaAmount: number) {
  if (!Number.isInteger(fixaAmount) || fixaAmount <= 0) {
    throw new Error("Invalid FIXA amount.");
  }

  return Math.round(fixaAmount * FIXA_PRICE_CENTS);
}