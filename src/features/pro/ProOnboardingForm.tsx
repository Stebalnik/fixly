"use client";

import { useState } from "react";
import Link from "next/link";

type ProOnboardingFormProps = {
  lead: string;
  next: string;
};

export function ProOnboardingForm({ lead, next }: ProOnboardingFormProps) {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginHref = `/login?intent=pro&next=${encodeURIComponent(
    next || "/account/fixa"
  )}${lead ? `&lead=${encodeURIComponent(lead)}` : ""}`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/pro/complete-onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          companyName,
          lead,
          next,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        redirectTo?: string;
      } | null;

      if (!response.ok || !payload?.redirectTo) {
        throw new Error(payload?.error ?? "Unable to complete onboarding.");
      }

      window.location.href = payload.redirectTo;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card">
      <div className="flex-between gap-md">
        <div>
          <p className="eyebrow">Fixly Pro</p>
          <h2>Complete pro onboarding</h2>
          <p className="text-muted">
            Confirm your pro profile before buying FIXAs and unlocking leads.
          </p>
        </div>

        <Link className="button button-secondary" href={loginHref}>
          Log in
        </Link>
      </div>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Full name</span>
          <input
            className="form-input"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setErrorMessage("");
            }}
          />
        </label>

        <label className="form-field">
          <span>Company name</span>
          <input
            className="form-input"
            type="text"
            autoComplete="organization"
            required
            value={companyName}
            onChange={(event) => {
              setCompanyName(event.target.value);
              setErrorMessage("");
            }}
          />
        </label>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <button
          className="button button-primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Please wait..." : "Continue to buy FIXAs"}
        </button>
      </form>
    </div>
  );
}