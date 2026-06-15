"use client";

import Link from "next/link";
import { useState } from "react";

type LoginFormProps = {
  intent: string;
  next: string;
  requestId: string;
  lead?: string;
  initialError?: string;
};

type LoginResponse = {
  ok?: boolean;
  error?: string;
  redirectTo?: string;
};

function getSignupHref(intent: string, next: string, requestId: string, lead?: string) {
  const params = new URLSearchParams();

  if (next) params.set("next", next);
  if (requestId) params.set("request", requestId);
  if (lead) params.set("lead", lead);

  const query = params.toString();

  if (intent === "pro") {
    return `/pro/signup${query ? `?${query}` : ""}`;
  }

  return `/customer/signup${query ? `?${query}` : ""}`;
}

export function LoginForm({
  intent,
  next,
  requestId,
  lead,
  initialError = "",
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(initialError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signupHref = getSignupHref(intent, next, requestId, lead);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          intent: intent || "pro",
          next,
          request: requestId,
          lead,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as LoginResponse;

      if (!response.ok || result.ok === false || !result.redirectTo) {
        setErrorMessage(result.error ?? "Login failed.");
        setIsSubmitting(false);
        return;
      }

      window.location.assign(result.redirectTo);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Login failed."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card login-card">
      <p className="eyebrow">Welcome back</p>

      <h2>Log in</h2>

      <p>Enter your email and password to continue to your Fixly account.</p>

      <form onSubmit={handleSubmit} className="login-form">
        <label className="form-field">
          <span>Email</span>

          <input
            className="form-input"
            type="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrorMessage("");
            }}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className="form-field">
          <span>Password</span>

          <input
            className="form-input"
            type="password"
            required
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrorMessage("");
            }}
            placeholder="Your password"
            autoComplete="current-password"
          />
        </label>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <button
          type="submit"
          className="button button-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <div className="form-footer">
        {intent === "pro" ? (
          <p className="text-muted">
            Don&apos;t have a pro account?{" "}
            <Link href={signupHref}>Create pro account</Link>
          </p>
        ) : (
          <p className="text-muted">
            Don&apos;t have an account?{" "}
            <Link href={signupHref}>Create account</Link>
          </p>
        )}
      </div>
    </div>
  );
}
