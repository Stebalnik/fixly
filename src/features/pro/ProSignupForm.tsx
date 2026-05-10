"use client";

import Link from "next/link";
import { useState } from "react";

type ProSignupFormProps = {
  lead: string;
  next: string;
};

export function ProSignupForm({ lead, next }: ProSignupFormProps) {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/pro/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          companyName,
          email,
          phone,
          password,
          next,
          lead,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok || !result.redirectTo) {
        throw new Error(result.error ?? "Unable to create pro account.");
      }

      window.location.href = result.redirectTo;
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
          <p className="text-muted">
            Create a pro account to buy FIXAs, unlock leads, and message
            customers.
          </p>
        </div>

        <Link className="button button-secondary" href="/pro/login">
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
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
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
            onChange={(event) => setCompanyName(event.target.value)}
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
          <span>Phone</span>
          <input
            className="form-input"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Password</span>
          <input
            className="form-input"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <button
          className="button button-primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create pro account"}
        </button>
      </form>
    </div>
  );
}