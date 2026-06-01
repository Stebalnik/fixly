"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type SubmitStatus = "idle" | "success" | "error";

type CreateListingResponse = {
  ok?: boolean;
  error?: string;
  email?: string;
  redirectTo?: string;
  existingUser?: boolean;
  loginUrl?: string;
};

const categories = [
  ["lumber", "Lumber, plywood, and sheet goods"],
  ["tile-flooring", "Tile, stone, vinyl, and flooring"],
  ["paint-coatings", "Paint, primer, stain, and coatings"],
  ["doors-windows-trim", "Doors, windows, trim, and moulding"],
  ["fixtures-hardware", "Fixtures, hardware, plumbing, and electrical"],
  ["tools-supplies", "Tools, fasteners, and jobsite supplies"],
  ["other", "Other leftover building materials"],
] as const;

const conditions = [
  ["leftover", "Leftover from a project"],
  ["new", "New and unopened"],
  ["open_box", "Open box or partial package"],
  ["used", "Used but usable"],
  ["salvaged", "Salvaged or reclaimed"],
] as const;

export default function MaterialListingForm() {
  const supabase = createSupabaseBrowserClient();
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function resetStatus() {
    setStatus("idle");
    setErrorMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: formData.get("title"),
      category: formData.get("category"),
      condition: formData.get("condition"),
      price: formData.get("price"),
      city: formData.get("city"),
      state: formData.get("state"),
      description: formData.get("description"),
      sellerName: formData.get("sellerName"),
      sellerEmail: formData.get("sellerEmail"),
      sellerPhone: formData.get("sellerPhone"),
      password,
    };

    if (password.length < 8) {
      setStatus("error");
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    resetStatus();

    try {
      const response = await fetch("/api/materials/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result =
        (await response.json().catch(() => ({}))) as CreateListingResponse;

      if (!response.ok) {
        if (result.existingUser && result.loginUrl) {
          window.location.href = result.loginUrl;
          return;
        }

        setStatus("error");
        setErrorMessage(result.error ?? "Unable to submit listing.");
        setIsSubmitting(false);
        return;
      }

      const sellerEmail = String(payload.sellerEmail ?? "")
        .trim()
        .toLowerCase();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: result.email ?? sellerEmail,
        password,
      });

      if (signInError) {
        window.location.href = `/login?next=${encodeURIComponent(
          result.redirectTo ?? "/account"
        )}`;
        return;
      }

      window.location.href = result.redirectTo ?? "/account";
    } catch {
      setStatus("error");
      setErrorMessage("Unable to submit listing. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="materials-listing-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="title">
          Listing title
        </label>
        <input
          id="title"
          name="title"
          className="form-input"
          required
          minLength={8}
          maxLength={120}
          disabled={isSubmitting}
          onChange={resetStatus}
          placeholder="Example: 14 boxes of leftover subway tile"
        />
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="form-select"
            required
            defaultValue=""
            disabled={isSubmitting}
            onChange={resetStatus}
          >
            <option value="">Choose category</option>
            {categories.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="condition">
            Condition
          </label>
          <select
            id="condition"
            name="condition"
            className="form-select"
            required
            defaultValue="leftover"
            disabled={isSubmitting}
            onChange={resetStatus}
          >
            {conditions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-3">
        <div className="form-group">
          <label className="form-label" htmlFor="price">
            Asking price
          </label>
          <input
            id="price"
            name="price"
            className="form-input"
            type="number"
            min="0"
            step="0.01"
            disabled={isSubmitting}
            onChange={resetStatus}
            placeholder="75"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="city">
            City
          </label>
          <input
            id="city"
            name="city"
            className="form-input"
            required
            maxLength={80}
            disabled={isSubmitting}
            onChange={resetStatus}
            placeholder="Austin"
            autoComplete="address-level2"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="state">
            State
          </label>
          <input
            id="state"
            name="state"
            className="form-input"
            required
            maxLength={32}
            disabled={isSubmitting}
            onChange={resetStatus}
            placeholder="TX"
            autoComplete="address-level1"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className="form-textarea"
          required
          minLength={12}
          maxLength={2000}
          rows={7}
          disabled={isSubmitting}
          onChange={resetStatus}
          placeholder="Describe the leftover materials, quantity, brand, size, color, pickup details, and whether the box or package is sealed."
        />
      </div>

      <div className="grid-3">
        <div className="form-group">
          <label className="form-label" htmlFor="sellerName">
            Your name
          </label>
          <input
            id="sellerName"
            name="sellerName"
            className="form-input"
            required
            maxLength={100}
            disabled={isSubmitting}
            onChange={resetStatus}
            placeholder="Name"
            autoComplete="name"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="sellerEmail">
            Email
          </label>
          <input
            id="sellerEmail"
            name="sellerEmail"
            className="form-input"
            type="email"
            required
            maxLength={160}
            disabled={isSubmitting}
            onChange={resetStatus}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="sellerPhone">
            Phone
          </label>
          <input
            id="sellerPhone"
            name="sellerPhone"
            className="form-input"
            maxLength={40}
            disabled={isSubmitting}
            onChange={resetStatus}
            placeholder="Optional"
            autoComplete="tel"
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Create password
          </label>
          <input
            id="password"
            name="password"
            className="form-input"
            type="password"
            required
            minLength={8}
            value={password}
            disabled={isSubmitting}
            onChange={(event) => {
              setPassword(event.target.value);
              resetStatus();
            }}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            className="form-input"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            disabled={isSubmitting}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              resetStatus();
            }}
            placeholder="Repeat password"
            autoComplete="new-password"
          />
        </div>
      </div>

      <p className="text-muted">
        Your listing creates a Fixly Materials account automatically. After
        submit, you will go to your dashboard to manage the listing.
      </p>

      {status === "error" ? (
        <div className="form-message form-message-error">{errorMessage}</div>
      ) : null}

      {status === "success" ? (
        <div className="form-message form-message-success">
          Listing submitted. We will review it before publishing.
        </div>
      ) : null}

      <button
        type="submit"
        className="button button-primary"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit material listing"}
      </button>
    </form>
  );
}
