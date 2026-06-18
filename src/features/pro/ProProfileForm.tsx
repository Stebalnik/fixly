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

type AvatarUploadResponse = {
  ok?: boolean;
  avatarUrl?: string;
  error?: string;
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
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(initial.avatarUrl);
  const [avatarUploadStatus, setAvatarUploadStatus] = useState("");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
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

    if (isAvatarUploading) {
      event.preventDefault();
      setErrorMessage("Please wait for the profile photo upload to finish.");
      return;
    }

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

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setErrorMessage("");
    setAvatarUploadStatus("Preparing profile photo...");
    setIsAvatarUploading(true);

    try {
      const compressed = await compressAvatarImage(file);
      const previewUrl = window.URL.createObjectURL(compressed);
      setAvatarPreviewUrl(previewUrl);

      const uploadData = new FormData();
      uploadData.set("file", compressed, compressed.name);

      const response = await fetch("/api/pro/profile/avatar", {
        method: "POST",
        body: uploadData,
      });
      const result = (await response.json().catch(() => ({}))) as AvatarUploadResponse;

      if (!response.ok || !result.avatarUrl) {
        throw new Error(result.error ?? "Unable to upload profile photo.");
      }

      setAvatarUrl(result.avatarUrl);
      setAvatarPreviewUrl(result.avatarUrl);
      setAvatarUploadStatus(
        `Profile photo optimized to ${formatFileSize(compressed.size)}.`
      );
    } catch (error) {
      setAvatarUploadStatus("");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload profile photo."
      );
    } finally {
      setIsAvatarUploading(false);
      event.target.value = "";
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

        <div className="form-field pro-avatar-field">
          <span>Profile photo</span>
          <div className="pro-avatar-upload">
            {avatarPreviewUrl ? (
              <img
                src={avatarPreviewUrl}
                alt="Profile preview"
                className="pro-avatar-preview"
              />
            ) : (
              <div className="pro-avatar-placeholder" aria-hidden="true">
                {getInitials(initial.displayName || initial.companyName)}
              </div>
            )}
            <div>
              <label className="button button-secondary">
                Upload photo
                <input
                  className="visually-hidden"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  disabled={isAvatarUploading}
                />
              </label>
              <p className="form-helper">
                {isAvatarUploading
                  ? "Uploading optimized photo..."
                  : avatarUploadStatus ||
                    "Photos are resized before upload to keep profiles light."}
              </p>
            </div>
          </div>
          <input type="hidden" name="avatar_url" value={avatarUrl} />
        </div>

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

async function compressAvatarImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }

  const image = await loadImage(file);
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to prepare this image.");
  }

  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = Math.max(0, (image.naturalWidth - sourceSize) / 2);
  const sourceY = Math.max(0, (image.naturalHeight - sourceSize) / 2);

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size, size);
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    size,
    size
  );

  const blob =
    (await canvasToBlob(canvas, "image/webp", 0.78)) ??
    (await canvasToBlob(canvas, "image/jpeg", 0.82));

  if (!blob) {
    throw new Error("Unable to optimize this image.");
  }

  const extension = blob.type === "image/webp" ? "webp" : "jpg";

  return new File([blob], `profile-photo.${extension}`, {
    type: blob.type,
  });
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = window.URL.createObjectURL(file);

    image.onload = () => {
      window.URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      window.URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read this image."));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function getInitials(value: string) {
  const initials = value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "FP";
}
