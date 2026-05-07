export const FIXA_USD_VALUE = 0.013;

export const FIXA_USD_CENTS = Math.round(FIXA_USD_VALUE * 100);

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
];

export function calculateFixaPriceUsd(fixaAmount: number) {
  return fixaAmount * FIXA_USD_VALUE;
}

export function calculateFixaPriceCents(fixaAmount: number) {
  return Math.round(calculateFixaPriceUsd(fixaAmount) * 100);
}