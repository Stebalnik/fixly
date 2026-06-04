export type SupportedCountryOption = {
  code: string;
  label: string;
};

export const supportedCountryOptions: SupportedCountryOption[] = [
  { code: "us", label: "United States" },
  { code: "au", label: "Australia" },
  { code: "nz", label: "New Zealand" },
  { code: "ca", label: "Canada" },
  { code: "gb", label: "United Kingdom" },
  { code: "sg", label: "Singapore" },
];

export const supportedCountryCodes = supportedCountryOptions.map(
  (country) => country.code
);

export function getSupportedCountryLabel(countryCode: string) {
  const normalized = countryCode.toLowerCase();

  return (
    supportedCountryOptions.find((country) => country.code === normalized)
      ?.label ?? countryCode.toUpperCase()
  );
}
