"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type InitialContact = {
  name: string;
  email: string;
  phone: string;
};

type CustomerSignupFormProps = {
  requestId: string;
  next: string;
  initialContact: InitialContact;
};

export function CustomerSignupForm({
  requestId,
  next,
  initialContact,
}: CustomerSignupFormProps) {
  const supabase = createSupabaseBrowserClient();

  const [fullName, setFullName] = useState(initialContact.name);
  const [email, setEmail] = useState(initialContact.email);
  const [phone, setPhone] = useState(initialContact.phone);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialContact.name || initialContact.email || initialContact.phone) {
      return;
    }

    const savedContact = window.sessionStorage.getItem(
      "fixly_customer_signup_contact"
    );

    if (!savedContact) return;

    try {
      const parsed = JSON.parse(savedContact) as InitialContact;

      setFullName(parsed.name ?? "");
      setEmail(parsed.email ?? "");
      setPhone(parsed.phone ?? "");
    } catch {
      window.sessionStorage.removeItem("fixly_customer_signup_contact");
    }
  }, [initialContact]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/customer/complete-signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        phone,
        password,
        requestId,
        next,
      }),
    });

    const result = (await response.json()) as {
      error?: string;
      email?: string;
      redirectTo?: string;
    };

    if (!response.ok) {
      setErrorMessage(result.error ?? "Unable to create customer account.");
      setIsSubmitting(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      window.location.href = `/login?intent=customer&next=${encodeURIComponent(
        result.redirectTo ?? "/customer"
      )}`;
      return;
    }

    window.sessionStorage.removeItem("fixly_customer_signup_contact");
    window.location.href = result.redirectTo ?? "/customer";
  }

  return (
    <div className="card customer-signup-card">
      <p className="eyebrow">Almost done</p>
      <h2>Create your password</h2>
      <p>
        Your request is created. Add a password to manage it from your customer
        dashboard.
      </p>

      <form onSubmit={handleSubmit} className="customer-signup-form">
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
            autoComplete="new-password"
          />
        </label>

        <label className="form-field">
          <span>Confirm password</span>
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
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