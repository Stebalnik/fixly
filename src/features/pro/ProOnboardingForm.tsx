"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ProOnboardingFormProps = {
  lead: string;
  next: string;
};

export function ProOnboardingForm({ lead, next }: ProOnboardingFormProps) {
  const supabase = createSupabaseBrowserClient();

  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function completeOnboarding() {
    const response = await fetch("/api/pro/complete-onboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ companyName, lead, next }),
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
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: "pro",
              company_name: companyName,
            },
          },
        });

        if (error) throw error;

        if (!data.session) {
          setErrorMessage(
            "Check your email to confirm your account, then log in to continue."
          );
          setMode("login");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
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
          <h2>{mode === "signup" ? "Create pro account" : "Log in as pro"}</h2>
        </div>

        <button
          type="button"
          className="button button-secondary"
          onClick={() => {
            setErrorMessage("");
            setMode(mode === "signup" ? "login" : "signup");
          }}
        >
          {mode === "signup" ? "Log in" : "Create account"}
        </button>
      </div>

      <form className="form-stack" onSubmit={handleSubmit}>
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
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Company name</span>
          <input
            className="form-input"
            required
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
          />
        </label>

        {errorMessage && (
          <p className="form-error">
            {errorMessage}
          </p>
        )}

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