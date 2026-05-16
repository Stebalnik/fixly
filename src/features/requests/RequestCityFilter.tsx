"use client";

import { useEffect, useState } from "react";

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
};

async function fetchMarketOptions(query: string): Promise<MarketOption[]> {
  const params = new URLSearchParams();
  params.set("q", query.trim());

  const response = await fetch(`/api/geo/market-options?${params}`);

  if (!response.ok) return [];

  return (await response.json()) as MarketOption[];
}

export default function RequestCityFilter({
  initialCitySearch,
  initialMarket,
}: RequestCityFilterProps) {
  const [citySearch, setCitySearch] = useState(initialCitySearch);
  const [marketSlug, setMarketSlug] = useState(initialMarket);
  const [options, setOptions] = useState<MarketOption[]>([]);

  const query = citySearch.trim();
  const shouldSearch = query.length >= 3 && !marketSlug;
  const shouldShowOptions = shouldSearch && options.length > 0;

  useEffect(() => {
    if (!shouldSearch) return;

    let active = true;

    const timer = window.setTimeout(() => {
      fetchMarketOptions(query).then((items) => {
        if (!active) return;
        setOptions(items);
      });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, shouldSearch]);

  function selectMarket(market: MarketOption) {
    setCitySearch(`${market.city}, ${market.state}`);
    setMarketSlug(market.slug);
    setOptions([]);
  }

  return (
    <div className="marketplace-autocomplete">
      <input
        className="form-input"
        name="citySearch"
        placeholder="Start typing city..."
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