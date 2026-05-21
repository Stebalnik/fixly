"use client";

import { useEffect, useMemo, useState } from "react";

type CategoryOption = {
  slug: string;
  title: string;
  shortTitle: string;
};

type SubcategoryOption = {
  slug: string;
  parentSlug: string;
  title: string;
  shortTitle: string;
};

type MarketOption = {
  slug: string;
  city: string;
  state: string;
  region: string;
  countryCode: string;
};

type ServiceAreaPreviewItem = {
  slug: string;
  label: string;
  countryCode: string;
  href: string;
};

type ServiceAreaPreview = {
  items: ServiceAreaPreviewItem[];
  total: number;
  message: string | null;
};

type ProProfileFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  categories: CategoryOption[];
  subcategories: SubcategoryOption[];
  initial: {
    companyName: string;
    displayName: string;
    bio: string;
    yearsExperience: number | "";
    avatarUrl: string;
    logoUrl: string;
    homeMarketSlug: string;
    homeMarketLabel: string;
    serviceRadiusMiles: number;
    serviceCategories: string[];
    serviceSubcategories: string[];
    licenseText: string;
    insuranceVerified: boolean;
  };
};

const radiusOptions = [5, 15, 30, 50];

async function fetchMarketOptions(query: string): Promise<MarketOption[]> {
  const params = new URLSearchParams();
  params.set("q", query.trim());

  const response = await fetch(`/api/geo/market-options?${params}`);
  if (!response.ok) return [];

  const items = (await response.json()) as MarketOption[];
  return items.slice(0, 5);
}

async function fetchServiceAreaPreview(
  marketSlug: string,
  radiusMiles: number
): Promise<ServiceAreaPreview> {
  const params = new URLSearchParams();
  params.set("market", marketSlug);
  params.set("radius", String(radiusMiles));

  const response = await fetch(`/api/geo/service-area-preview?${params}`);
  if (!response.ok) {
    return {
      items: [],
      total: 0,
      message: "Unable to calculate service areas right now.",
    };
  }

  return (await response.json()) as ServiceAreaPreview;
}

export function ProProfileForm({
  action,
  categories,
  subcategories,
  initial,
}: ProProfileFormProps) {
  const [marketSearch, setMarketSearch] = useState(initial.homeMarketLabel);
  const [homeMarketSlug, setHomeMarketSlug] = useState(initial.homeMarketSlug);
  const [marketOptions, setMarketOptions] = useState<MarketOption[]>([]);
  const [radiusMiles, setRadiusMiles] = useState(initial.serviceRadiusMiles);
  const [preview, setPreview] = useState<ServiceAreaPreview>({
    items: [],
    total: 0,
    message: homeMarketSlug
      ? null
      : "Select your hometown to calculate service areas.",
  });
  const [selectedCategories, setSelectedCategories] = useState(
    () => new Set(initial.serviceCategories)
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState(
    () => new Set(initial.serviceSubcategories)
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState(
    initial.serviceSubcategories.length === 0
      ? "Choose at least one specific service for better lead matching."
      : ""
  );

  const selectedCategoryList = useMemo(
    () => Array.from(selectedCategories),
    [selectedCategories]
  );
  const visibleSubcategories = useMemo(() => {
    return selectedCategoryList.map((categorySlug) => ({
      category: categories.find((category) => category.slug === categorySlug),
      subcategories: subcategories.filter(
        (subcategory) => subcategory.parentSlug === categorySlug
      ),
    }));
  }, [categories, selectedCategoryList, subcategories]);

  useEffect(() => {
    const query = marketSearch.trim();
    if (query.length < 3 || homeMarketSlug) {
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      fetchMarketOptions(query).then((items) => {
        if (active) setMarketOptions(items);
      });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [homeMarketSlug, marketSearch]);

  useEffect(() => {
    let active = true;

    if (!homeMarketSlug) {
      return;
    }

    fetchServiceAreaPreview(homeMarketSlug, radiusMiles).then((result) => {
      if (active) setPreview(result);
    });

    return () => {
      active = false;
    };
  }, [homeMarketSlug, radiusMiles]);

  function selectMarket(market: MarketOption) {
    setMarketSearch(`${market.city}, ${market.state}, ${market.countryCode}`);
    setHomeMarketSlug(market.slug);
    setMarketOptions([]);
    setErrorMessage("");
  }

  function toggleCategory(slug: string, checked: boolean) {
    setErrorMessage("");
    setSelectedCategories((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(slug);
      } else {
        next.delete(slug);
        setSelectedSubcategories((subCurrent) => {
          const subNext = new Set(subCurrent);
          subcategories
            .filter((subcategory) => subcategory.parentSlug === slug)
            .forEach((subcategory) => subNext.delete(subcategory.slug));
          return subNext;
        });
      }
      return next;
    });
  }

  function toggleSubcategory(slug: string, checked: boolean) {
    setWarningMessage("");
    setSelectedSubcategories((current) => {
      const next = new Set(current);
      if (checked) next.add(slug);
      else next.delete(slug);
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    setErrorMessage("");

    const typedMarket = marketSearch.trim();
    if (!homeMarketSlug || typedMarket.length === 0) {
      event.preventDefault();
      setErrorMessage("Please choose a hometown from the suggested markets.");
      return;
    }

    if (selectedCategories.size === 0) {
      event.preventDefault();
      setErrorMessage("Please choose at least one service category.");
      return;
    }

    if (selectedSubcategories.size === 0) {
      setWarningMessage(
        "Saved categories are valid, but specific services improve lead matching."
      );
    }
  }

  return (
    <form action={action} className="card form-stack" onSubmit={handleSubmit}>
      <div className="grid-2">
        <label className="form-field">
          <span>Company name</span>
          <input
            className="form-input"
            name="company_name"
            type="text"
            defaultValue={initial.companyName}
            required
          />
        </label>

        <label className="form-field">
          <span>Public display name</span>
          <input
            className="form-input"
            name="display_name"
            type="text"
            defaultValue={initial.displayName}
          />
        </label>
      </div>

      <label className="form-field">
        <span>Bio</span>
        <textarea
          className="form-textarea"
          name="bio"
          rows={5}
          defaultValue={initial.bio}
        />
      </label>

      <div className="grid-3">
        <label className="form-field">
          <span>Years experience</span>
          <input
            className="form-input"
            name="years_experience"
            type="number"
            min="0"
            defaultValue={initial.yearsExperience}
          />
        </label>

        <label className="form-field">
          <span>Avatar URL placeholder</span>
          <input
            className="form-input"
            name="avatar_url"
            type="url"
            defaultValue={initial.avatarUrl}
          />
        </label>

        <label className="form-field">
          <span>Logo URL placeholder</span>
          <input
            className="form-input"
            name="logo_url"
            type="url"
            defaultValue={initial.logoUrl}
          />
        </label>
      </div>

      <div className="grid-2">
        <div className="form-field marketplace-autocomplete">
          <span>Hometown</span>
          <input
            className="form-input"
            value={marketSearch}
            placeholder="Start typing your city"
            autoComplete="off"
            onChange={(event) => {
              setMarketSearch(event.target.value);
              setHomeMarketSlug("");
              setMarketOptions([]);
              setErrorMessage("");
            }}
          />
          <input type="hidden" name="home_market_slug" value={homeMarketSlug} />
          {marketSearch.trim().length > 0 &&
          marketSearch.trim().length < 3 &&
          !homeMarketSlug ? (
            <small className="form-helper">Type at least 3 characters.</small>
          ) : null}
          {marketOptions.length > 0 ? (
            <div className="marketplace-autocomplete-menu">
              {marketOptions.map((market) => (
                <button
                  key={market.slug}
                  type="button"
                  className="marketplace-autocomplete-option"
                  onClick={() => selectMarket(market)}
                >
                  <span>
                    {market.city}, {market.state}
                  </span>
                  <small>
                    {market.region} · {market.countryCode.toUpperCase()}
                  </small>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <label className="form-field">
          <span>Service radius</span>
          <select
            className="form-input"
            name="service_radius_miles"
            value={radiusMiles}
            onChange={(event) => setRadiusMiles(Number(event.target.value))}
          >
            {radiusOptions.map((radius) => (
              <option key={radius} value={radius}>
                {radius} miles
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="card-flat">
        <p className="eyebrow">Generated service cities preview</p>
        <p>
          {!homeMarketSlug
            ? "Select your hometown to calculate service areas."
            : preview.message ??
            `${preview.items.map((item) => item.label).join(", ")}${
              preview.total > preview.items.length
                ? ` +${preview.total - preview.items.length} more`
                : ""
            }`}
        </p>
      </div>

      <fieldset className="card-flat">
        <legend>Service categories</legend>
        <div className="service-list">
          {categories.map((category) => (
            <label key={category.slug}>
              <input
                type="checkbox"
                name="service_categories"
                value={category.slug}
                checked={selectedCategories.has(category.slug)}
                onChange={(event) =>
                  toggleCategory(category.slug, event.target.checked)
                }
              />{" "}
              {category.shortTitle}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="card-flat">
        <legend>Specific services</legend>
        <p>Choose categories first. Then select the specific services you offer.</p>
        {selectedCategories.size > 0 ? (
          <div className="service-list">
            {visibleSubcategories.map(({ category, subcategories: items }) => (
              <div key={category?.slug ?? items[0]?.parentSlug} className="card-flat">
                <p className="eyebrow">{category?.shortTitle ?? "Services"}</p>
                {items.map((subcategory) => (
                  <label key={subcategory.slug}>
                    <input
                      type="checkbox"
                      name="service_subcategories"
                      value={subcategory.slug}
                      checked={selectedSubcategories.has(subcategory.slug)}
                      onChange={(event) =>
                        toggleSubcategory(subcategory.slug, event.target.checked)
                      }
                    />{" "}
                    {subcategory.shortTitle}
                  </label>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p>Select at least one category to see specific services.</p>
        )}
      </fieldset>

      <label className="form-field">
        <span>License info</span>
        <textarea
          className="form-textarea"
          name="licenses"
          rows={4}
          defaultValue={initial.licenseText}
        />
      </label>

      <div className="card-flat">
        <p className="eyebrow">Verification</p>
        <p>
          Insurance status:{" "}
          {initial.insuranceVerified ? "verified" : "not verified"}.
          Verification review will be available soon.
        </p>
      </div>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      {warningMessage ? <p className="form-helper">{warningMessage}</p> : null}

      <button type="submit" className="button button-primary">
        Save profile
      </button>
    </form>
  );
}
