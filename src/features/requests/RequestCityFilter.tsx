"use client";

import { useEffect, useState } from "react";
import {
  supportedCountryCodes,
  supportedCountryOptions,
} from "@/lib/geo/country-options";

type MarketOption = {
  slug: string;
  city: string;
  state: string;
  region: string;
  zip: string[];
  countryCode: string;
};

type RequestCityFilterProps = {
  initialCitySearch: string;
  initialMarket: string;
  initialCountry: string;
};

const supportedCountries = new Set(supportedCountryCodes);

function detectBrowserCountry() {
  if (typeof navigator === "undefined") return "us";

  const locale = navigator.language || navigator.languages?.[0] || "";
  const country = locale.split("-")[1]?.toLowerCase();

  if (country && supportedCountries.has(country)) {
    return country;
  }

  return "us";
}

function getInitialCountry(initialCountry: string) {
  return initialCountry || detectBrowserCountry();
}

async function fetchMarketOptions(
  query: string,
  country: string
): Promise<MarketOption[]> {
  const params = new URLSearchParams();
  params.set("q", query.trim());
  params.set("country", country);

  const response = await fetch(`/api/geo/market-options?${params}`);

  if (!response.ok) return [];

  return (await response.json()) as MarketOption[];
}

export default function RequestCityFilter({
  initialCitySearch,
  initialMarket,
  initialCountry,
}: RequestCityFilterProps) {
  const [citySearch, setCitySearch] = useState(initialCitySearch);
  const [marketSlug, setMarketSlug] = useState(initialMarket);
  const [country, setCountry] = useState(() => getInitialCountry(initialCountry));
  const [options, setOptions] = useState<MarketOption[]>([]);

  const query = citySearch.trim();
  const shouldSearch = query.length >= 3 && !marketSlug;
  const shouldShowOptions = shouldSearch && options.length > 0;

  useEffect(() => {
    if (!shouldSearch) return;

    let active = true;

    const timer = window.setTimeout(() => {
      fetchMarketOptions(query, country).then((items) => {
        if (!active) return;
        setOptions(items);
      });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, country, shouldSearch]);

  function selectMarket(market: MarketOption) {
    setCitySearch(`${market.city}, ${market.state}`);
    setMarketSlug(market.slug);
    setCountry(market.countryCode.toLowerCase());
    setOptions([]);
  }

  return (
    <div className="marketplace-autocomplete">
      <label className="form-field">
        <span>Country</span>
        <select
          className="form-input"
          name="country"
          value={country}
          onChange={(event) => {
            setCountry(event.target.value);
            setMarketSlug("");
            setCitySearch("");
            setOptions([]);
          }}
        >
          {supportedCountryOptions.map((countryOption) => (
            <option key={countryOption.code} value={countryOption.code}>
              {countryOption.label}
            </option>
          ))}
        </select>
      </label>

      <input
        className="form-input"
        name="citySearch"
        placeholder="Start typing city or ZIP..."
        value={citySearch}
        autoComplete="off"
        onChange={(event) => {
          setCitySearch(event.target.value);
          setMarketSlug("");
          setOptions([]);
        }}
      />

      <input type="hidden" name="market" value={marketSlug} />

      {query.length > 0 && query.length < 3 ? (
        <small className="form-helper">Type at least 3 characters.</small>
      ) : null}

      {shouldShowOptions && (
        <div className="marketplace-autocomplete-menu">
          {options.map((market) => (
            <button
              key={market.slug}
              type="button"
              className="marketplace-autocomplete-option"
              onClick={() => selectMarket(market)}
            >
              <span>
                {market.city}, {market.state}
              </span>
              <small>{market.countryCode.toUpperCase()}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
