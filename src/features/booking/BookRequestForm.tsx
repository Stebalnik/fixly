"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { categories, getSubcategoriesByParent } from "@/lib/services";
import { getAllMarkets } from "@/lib/geo";

const phoneCountries = [
  { code: "+1", label: "US / Canada +1" },
  { code: "+44", label: "UK +44" },
  { code: "+61", label: "Australia +61" },
  { code: "+64", label: "New Zealand +64" },
  { code: "+353", label: "Ireland +353" },
  { code: "+971", label: "UAE +971" },
];

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, "");
}

function isValidPhone(value: string) {
  const digits = normalizePhone(value);
  return digits.length >= 7 && digits.length <= 14;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function BookRequestForm() {
  const searchParams = useSearchParams();
  const markets = getAllMarkets();

  const initialCategory = searchParams.get("category") ?? "";
  const initialSubcategory = searchParams.get("subcategory") ?? "";
  const initialMarket = searchParams.get("market") ?? "";

  const initialMarketData = markets.find(
    (market) => market.slug === initialMarket
  );

  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [subcategorySlug, setSubcategorySlug] = useState(initialSubcategory);
  const [citySearch, setCitySearch] = useState(
    initialMarketData
      ? `${initialMarketData.city}, ${initialMarketData.state}`
      : ""
  );
  const [marketSlug, setMarketSlug] = useState(initialMarket);
  const [streetAddress, setStreetAddress] = useState("");
  const [createAccount] = useState(false);
  const [notifyByEmail] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const subcategoryOptions = useMemo(() => {
    if (!categorySlug) return [];
    return getSubcategoriesByParent(categorySlug);
  }, [categorySlug]);

  const cityOptions = useMemo(() => {
    const query = citySearch.trim().toLowerCase();

    if (query.length < 1) return markets.slice(0, 8);

    return markets
      .filter((market) => {
        return (
          market.city.toLowerCase().includes(query) ||
          market.state.toLowerCase().includes(query) ||
          market.region.toLowerCase().includes(query) ||
          market.zip.some((zip) => zip.includes(query))
        );
      })
      .slice(0, 8);
  }, [citySearch, markets]);

  function resetStatus() {
    setStatus("idle");
    setErrorMessage("");
  }

  function selectMarket(slug: string, label: string) {
    setMarketSlug(slug);
    setCitySearch(label);
    resetStatus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanPhone = normalizePhone(phoneNumber);

    if (!categorySlug) {
      setStatus("error");
      setErrorMessage("Please select a main service category.");
      return;
    }

    if (!marketSlug) {
      setStatus("error");
      setErrorMessage("Please choose a city from the suggested locations.");
      return;
    }

    if (streetAddress.trim().length < 5) {
      setStatus("error");
      setErrorMessage("Please enter the street address for the job.");
      return;
    }

    if (customerName.trim().length < 2) {
      setStatus("error");
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!isValidPhone(cleanPhone)) {
      setStatus("error");
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    if (!isValidEmail(email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (description.trim().length < 20) {
      setStatus("error");
      setErrorMessage("Please describe the job with at least 20 characters.");
      return;
    }

    const requestDraft = {
      categorySlug,
      subcategorySlug: subcategorySlug || null,
      marketSlug,
      streetAddress: streetAddress.trim(),
      publicDescription: description.trim(),
      createAccountRequested: createAccount,
      notifyEmail: notifyByEmail,
      privateContact: {
        name: customerName.trim(),
        phoneCountryCode,
        phoneNumber: cleanPhone,
        fullPhone: `${phoneCountryCode}${cleanPhone}`,
        email: email.trim().toLowerCase(),
      },
    };

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestDraft),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(result.error ?? "Unable to submit request.");
        return;
      }

      setStatus("success");
      setErrorMessage("");
      window.location.href = result.requestUrl;
    } catch {
      setStatus("error");
      setErrorMessage("Unable to submit request. Please try again.");
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="category">
          Main service category
        </label>

        <select
          id="category"
          name="category"
          className="form-select"
          value={categorySlug}
          required
          onChange={(event) => {
            setCategorySlug(event.target.value);
            setSubcategorySlug("");
            resetStatus();
          }}
        >
          <option value="">Select category</option>

          {Object.values(categories).map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.title}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="subcategory">
          Specific service
        </label>

        <select
          id="subcategory"
          name="subcategory"
          className="form-select"
          value={subcategorySlug}
          onChange={(event) => {
            setSubcategorySlug(event.target.value);
            resetStatus();
          }}
          disabled={!categorySlug || subcategoryOptions.length === 0}
        >
          <option value="">
            {categorySlug ? "Select specific service" : "Select category first"}
          </option>

          {subcategoryOptions.map((subcategory) => (
            <option key={subcategory.slug} value={subcategory.slug}>
              {subcategory.title}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group booking-location-field">
        <label className="form-label" htmlFor="city">
          Location
        </label>

        <input
          id="city"
          name="city"
          className="form-input"
          value={citySearch}
          required
          onChange={(event) => {
            setCitySearch(event.target.value);
            setMarketSlug("");
            resetStatus();
          }}
          placeholder="Start typing your city"
          autoComplete="off"
        />

        {citySearch && !marketSlug && cityOptions.length > 0 && (
          <div className="booking-city-suggestions">
            {cityOptions.map((market) => {
              const label = `${market.city}, ${market.state}`;

              return (
                <button
                  key={market.slug}
                  type="button"
                  className="booking-city-option"
                  onClick={() => selectMarket(market.slug, label)}
                >
                  <span>{label}</span>
                  <small>{market.region}</small>
                </button>
              );
            })}
          </div>
        )}

        <input type="hidden" name="market" value={marketSlug} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="streetAddress">
          Street address
        </label>

        <input
          id="streetAddress"
          name="streetAddress"
          className="form-input"
          value={streetAddress}
          required
          onChange={(event) => {
            setStreetAddress(event.target.value);
            resetStatus();
          }}
          placeholder="Street address, apartment, unit"
          autoComplete="street-address"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="customerName">
          Your name
        </label>

        <input
          id="customerName"
          name="customerName"
          className="form-input"
          value={customerName}
          required
          onChange={(event) => {
            setCustomerName(event.target.value);
            resetStatus();
          }}
          placeholder="Your name"
          autoComplete="name"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="phoneNumber">
          Phone number
        </label>

        <div className="grid-2">
          <select
            id="phoneCountryCode"
            name="phoneCountryCode"
            className="form-select"
            value={phoneCountryCode}
            required
            onChange={(event) => {
              setPhoneCountryCode(event.target.value);
              resetStatus();
            }}
          >
            {phoneCountries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.label}
              </option>
            ))}
          </select>

          <input
            id="phoneNumber"
            name="phoneNumber"
            className="form-input"
            value={phoneNumber}
            required
            onChange={(event) => {
              setPhoneNumber(normalizePhone(event.target.value));
              resetStatus();
            }}
            placeholder="Phone number"
            inputMode="numeric"
            autoComplete="tel-national"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="email">
          Email
        </label>

        <input
          id="email"
          name="email"
          className="form-input"
          type="email"
          value={email}
          required
          onChange={(event) => {
            setEmail(event.target.value);
            resetStatus();
          }}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">
          Describe the job
        </label>

        <textarea
          id="description"
          name="description"
          className="form-textarea"
          rows={6}
          value={description}
          required
          minLength={20}
          onChange={(event) => {
            setDescription(event.target.value);
            resetStatus();
          }}
          placeholder="Example: I need help mounting a TV on drywall and hiding the wires."
        />
      </div>

      <p className="text-muted">
        Your address and contact details will not be shown publicly. They will
        only be available to pros after paid access.
      </p>

      {status === "error" && (
        <div className="form-message form-message-error">{errorMessage}</div>
      )}

      {status === "success" && (
        <div className="form-message form-message-success">
          Request created successfully.
        </div>
      )}

      <div className="flex gap-md">
        <button type="submit" className="button button-primary">
          Submit request
        </button>

        <Link href="/services" className="button button-secondary">
          Browse services
        </Link>
      </div>
    </form>
  );
}
