"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginFormProps = {
  intent: string;
  next: string;
  requestId: string;
};

export function LoginForm({ intent, next, requestId }: LoginFormProps) {
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    const params = new URLSearchParams();
    params.set("intent", intent || "pro");

    if (next) params.set("next", next);
    if (requestId) params.set("request", requestId);

    window.location.href = `/api/auth/after-login?${params.toString()}`;
  }

  return (
    <div className="card login-card">
      <p className="eyebrow">Welcome back</p>

      <h2>Log in</h2>

      <p>
        Enter your email and password to continue to your Fixly account.
      </p>

      <form onSubmit={handleSubmit} className="login-form">
        <label className="form-field">
          <span>Email</span>

          <input
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
    </div>
  );
}