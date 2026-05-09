"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ProOnboardingFormProps = {
  lead: string;
  next: string;
};

export function ProOnboardingForm({ lead, next }: ProOnboardingFormProps) {
  const supabase = createSupabaseBrowserClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginHref = `/pro/login?next=${encodeURIComponent(
    next || "/account/fixa"
  )}${lead ? `&lead=${encodeURIComponent(lead)}` : ""}`;

  async function completeOnboarding() {
    const response = await fetch("/api/pro/complete-onboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, lead, next }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error ?? "Unable to complete onboarding.");
    }

    const payload = (await response.json()) as {
      redirectTo: string;
    };

    window.location.href = payload.redirectTo;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: "pro",
            name,
          },
        },
      });

      if (error) throw error;

      if (!data.session) {
        setErrorMessage(
          "Check your email to confirm your account, then log in to continue."
        );
        return;
      }

      await completeOnboarding();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card">
      <div className="flex-between gap-md">
        <div>
          <p className="eyebrow">Fixly Pro</p>
          <h2>Create pro account</h2>
        </div>

        <Link className="button button-secondary" href={loginHref}>
          Log in
        </Link>
      </div>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Name</span>
          <input
            className="form-input"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Email</span>
          <input
            className="form-input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Password</span>
          <input
            className="form-input"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {errorMessage && <p className="form-error">{errorMessage}</p>}

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