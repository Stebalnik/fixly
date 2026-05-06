"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type CustomerSignupFormProps = {
  requestId: string;
  next: string;
};

export function CustomerSignupForm({ requestId, next }: CustomerSignupFormProps) {
  const supabase = createSupabaseBrowserClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/api/customer/complete-signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        phone,
        requestId,
        next,
      }),
    });

    const result = (await response.json()) as {
      error?: string;
      redirectTo?: string;
    };

    if (!response.ok) {
      setErrorMessage(result.error ?? "Unable to create customer account.");
      setIsSubmitting(false);
      return;
    }

    window.location.href = result.redirectTo ?? "/customer";
  }

  return (
    <div className="card">
      <p className="eyebrow">Customer account</p>
      <h1>Manage your service request</h1>
      <p>
        Create an account to view your request status, archive it, edit it, or
        delete it later.
      </p>

      <form onSubmit={handleSubmit} className="form">
        <label className="form-field">
          <span>Full name</span>
          <input
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Phone</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <button
          type="submit"
          className="button button-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}