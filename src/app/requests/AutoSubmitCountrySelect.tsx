"use client";

import { useRouter, useSearchParams } from "next/navigation";

type CountryOption = {
  code: string;
  label: string;
};

type AutoSubmitCountrySelectProps = {
  value: string;
  countries: CountryOption[];
};

export default function AutoSubmitCountrySelect({
  value,
  countries,
}: AutoSubmitCountrySelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(nextCountry: string) {
    if (!nextCountry) {
      router.push("/us/requests");
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    params.delete("market");
    params.delete("citySearch");
    params.delete("nearby");
    params.delete("page");

    const query = params.toString();

    router.push(
      query
        ? `/${nextCountry}/requests?${query}`
        : `/${nextCountry}/requests`
    );
  }

  return (
    <select
      className="form-input"
      name="country"
      value={value}
      onChange={(event) => handleChange(event.target.value)}
    >
      {countries.map((country) => (
        <option key={country.code} value={country.code}>
          {country.label}
        </option>
      ))}
    </select>
  );
}