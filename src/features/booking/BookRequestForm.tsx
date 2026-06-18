"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { categories, getSubcategoriesByParent } from "@/lib/services";
import { phoneCountries } from "@/lib/phone/countries";
import { trackEvent } from "@/lib/analytics";

type MarketOption = {
  slug: string;
  city: string;
  state: string;
  region: string;
  zip: string[];
  countryCode: string;
};

type CreateRequestResponse = {
  ok?: boolean;
  error?: string;
  requestId?: string;
  publicSlug?: string;
  requestUrl?: string;
};

async function fetchMarketOptions(params: {
  query?: string;
  initial?: string;
}): Promise<MarketOption[]> {
  const searchParams = new URLSearchParams();

  if (params.query) searchParams.set("q", params.query);
  if (params.initial) searchParams.set("initial", params.initial);

  const response = await fetch(`/api/geo/market-options?${searchParams}`);

  if (!response.ok) return [];

  return (await response.json()) as MarketOption[];
}

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

  const initialCategory = searchParams.get("category") ?? "";
  const initialSubcategory = searchParams.get("subcategory") ?? "";
  const initialMarket = searchParams.get("market") ?? "";

  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [subcategorySlug, setSubcategorySlug] = useState(initialSubcategory);
  const [citySearch, setCitySearch] = useState("");
  const [cityOptions, setCityOptions] = useState<MarketOption[]>([]);
  const [marketSlug, setMarketSlug] = useState(initialMarket);
  const [streetAddress, setStreetAddress] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  const [notifyByEmail] = useState(true);
  const [maxResponses, setMaxResponses] = useState(5);
  const [customerName, setCustomerName] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subcategoryOptions = useMemo(() => {
    if (!categorySlug) return [];
    return getSubcategoriesByParent(categorySlug);
  }, [categorySlug]);

  useEffect(() => {
    let active = true;

    if (!initialMarket) return;

    fetchMarketOptions({ initial: initialMarket }).then((options) => {
      if (!active) return;

      const market = options[0];

      if (market) {
        setCitySearch(`${market.city}, ${market.state}`);
      }
    });

    return () => {
      active = false;
    };
  }, [initialMarket]);

  useEffect(() => {
    let active = true;

    if (marketSlug) {
  return;
}

    fetchMarketOptions({ query: citySearch }).then((options) => {
      if (!active) return;
      setCityOptions(options);
    });

    return () => {
      active = false;
    };
  }, [citySearch, marketSlug]);

  function resetStatus() {
    setStatus("idle");
    setErrorMessage("");
  }

  function selectMarket(slug: string, label: string) {
    setMarketSlug(slug);
    setCitySearch(label);
    setCityOptions([]);
    resetStatus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const cleanPhone = normalizePhone(phoneNumber);
    const cleanEmail = email.trim().toLowerCase();
    const cleanDescription = description.trim();
    const cleanName = customerName.trim();
    const cleanStreetAddress = streetAddress.trim();

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

    if (cleanStreetAddress.length < 5) {
      setStatus("error");
      setErrorMessage("Please enter the street address for the job.");
      return;
    }

    if (cleanName.length < 2) {
      setStatus("error");
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!isValidPhone(cleanPhone)) {
      setStatus("error");
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (cleanDescription.length < 20) {
      setStatus("error");
      setErrorMessage("Please describe the job with at least 20 characters.");
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    trackEvent({
      action: "customer_request_submit_attempt",
      category: "request",
      label: marketSlug,
    });

    const requestDraft = {
      categorySlug,
      subcategorySlug: subcategorySlug || null,
      marketSlug,
      streetAddress: cleanStreetAddress,
      publicDescription: cleanDescription,
      createAccountRequested: createAccount,
      notifyEmail: notifyByEmail,
      maxResponses,
      privateContact: {
        name: cleanName,
        phoneCountryCode,
        phoneNumber: cleanPhone,
        fullPhone: `${phoneCountryCode}${cleanPhone}`,
        email: cleanEmail,
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

      const result =
        (await response.json().catch(() => ({}))) as CreateRequestResponse;

      if (!response.ok) {
        trackEvent({
          action: "customer_request_submit_failed",
          category: "request",
          label: result.error ?? "unknown",
        });
        setStatus("error");
        setErrorMessage(result.error ?? "Unable to submit request.");
        setIsSubmitting(false);
        return;
      }

      if (!result.requestId || !result.publicSlug) {
        trackEvent({
          action: "customer_request_submit_failed",
          category: "request",
          label: "incomplete_response",
        });
        setStatus("error");
        setErrorMessage("Request was created, but response was incomplete.");
        setIsSubmitting(false);
        return;
      }

      trackEvent({
        action: "customer_request_submit_success",
        category: "request",
        label: marketSlug,
      });

      setStatus("success");

      if (createAccount) {
        window.sessionStorage.setItem(
          "fixly_customer_signup_contact",
          JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            phone: `${phoneCountryCode}${cleanPhone}`,
          })
        );

        window.location.href = `/customer/signup?request=${result.requestId}&next=/customer`;
        return;
      }

      window.location.href =
        result.requestUrl ?? `/requests/${result.publicSlug}`;
    } catch {
      trackEvent({
        action: "customer_request_submit_failed",
        category: "request",
        label: "network_error",
      });
      setStatus("error");
      setErrorMessage("Unable to submit request. Please try again.");
      setIsSubmitting(false);
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
          disabled={isSubmitting}
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
          disabled={!categorySlug || subcategoryOptions.length === 0 || isSubmitting}
          onChange={(event) => {
            setSubcategorySlug(event.target.value);
            resetStatus();
          }}
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
          disabled={isSubmitting}
          onChange={(event) => {
            setCitySearch(event.target.value);
            setMarketSlug("");
            resetStatus();
          }}
          placeholder="Start typing your city"
          autoComplete="off"
        />

        {citySearch && !marketSlug && cityOptions.length > 0 ? (
          <div className="booking-city-suggestions">
            {cityOptions.map((market) => {
              const label = `${market.city}, ${market.state}`;

              return (
                <button
                  key={market.slug}
                  type="button"
                  className="booking-city-option"
                  disabled={isSubmitting}
                  onClick={() => selectMarket(market.slug, label)}
                >
                  <span>{label}</span>
                  <small>{market.region}</small>
                </button>
              );
            })}
          </div>
        ) : null}

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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
            disabled={isSubmitting}
            onChange={(event) => {
              setPhoneCountryCode(event.target.value);
              resetStatus();
            }}
          >
            {phoneCountries.map((country) => (
              <option
                key={`${country.code}-${country.label}`}
                value={country.code}
              >
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
            disabled={isSubmitting}
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
          disabled={isSubmitting}
          onChange={(event) => {
            setEmail(event.target.value);
            resetStatus();
          }}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="maxResponses">
          Response limit
        </label>

        <select
          id="maxResponses"
          name="maxResponses"
          className="form-select"
          value={maxResponses}
          disabled={isSubmitting}
          onChange={(event) => {
            setMaxResponses(Number(event.target.value));
            resetStatus();
          }}
        >
          <option value={3}>Up to 3 pro responses</option>
          <option value={5}>Up to 5 pro responses</option>
          <option value={10}>Up to 10 pro responses</option>
        </select>

        <p className="text-muted">
          Your request will close automatically when this response limit is
          reached.
        </p>
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
          disabled={isSubmitting}
          minLength={20}
          onChange={(event) => {
            setDescription(event.target.value);
            resetStatus();
          }}
          placeholder="Example: I need help mounting a TV on drywall and hiding the wires."
        />
      </div>

      <div className="form-group">
        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={createAccount}
            disabled={isSubmitting}
            onChange={(event) => {
              setCreateAccount(event.target.checked);
              resetStatus();
            }}
          />

          <span>
            Create account to manage this request
            <small>
              You’ll be able to edit, archive, or delete your request. Requests
              are automatically archived after 10 days or when the response
              limit is reached.
            </small>
          </span>
        </label>
      </div>

      <p className="text-muted">
        Your address and contact details will not be shown publicly. They will
        only be available to pros after paid access.
      </p>

      {status === "error" ? (
        <div className="form-message form-message-error">{errorMessage}</div>
      ) : null}

      {status === "success" ? (
        <div className="form-message form-message-success">
          Request created successfully.
        </div>
      ) : null}

      <div className="flex gap-md">
        <button
          type="submit"
          className="button button-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit request"}
        </button>

        <Link href="/services" className="button button-secondary">
          Browse services
        </Link>
      </div>
    </form>
  );
}
