"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ProLoginFormProps = {
  lead: string;
  next: string;
};

export function ProLoginForm({ lead, next }: ProLoginFormProps) {
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const redirectTo = new URL("/api/auth/after-login", window.location.origin);
      redirectTo.searchParams.set("intent", "pro");
      redirectTo.searchParams.set("next", next || "/pro");

      if (lead) {
        redirectTo.searchParams.set("lead", lead);
      }

      window.location.href = `${redirectTo.pathname}${redirectTo.search}`;
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
          <h2>Log in as pro</h2>
        </div>

        <Link
  className="button button-secondary"
  href={`/pro/signup?next=${encodeURIComponent(next)}${
    lead ? `&lead=${encodeURIComponent(lead)}` : ""
  }`}
>
  Create pro account
</Link>
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
            autoComplete="current-password"
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
          {isSubmitting ? "Please wait..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
