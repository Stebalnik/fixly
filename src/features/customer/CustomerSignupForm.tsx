"use client";

import { useMemo, useState } from "react";
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

type CompleteSignupResponse = {
  ok?: boolean;
  error?: string;
  email?: string;
  redirectTo?: string;
  existingUser?: boolean;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getSessionContact(initialContact: InitialContact): InitialContact {
  if (initialContact.name || initialContact.email || initialContact.phone) {
    return initialContact;
  }

  if (typeof window === "undefined") {
    return initialContact;
  }

  const savedContact = window.sessionStorage.getItem(
    "fixly_customer_signup_contact"
  );

  if (!savedContact) {
    return initialContact;
  }

  try {
    const parsed = JSON.parse(savedContact) as Partial<InitialContact>;

    return {
      name: parsed.name ?? "",
      email: parsed.email ?? "",
      phone: parsed.phone ?? "",
    };
  } catch {
    window.sessionStorage.removeItem("fixly_customer_signup_contact");
    return initialContact;
  }
}

export function CustomerSignupForm({
  requestId,
  next,
  initialContact,
}: CustomerSignupFormProps) {
  const supabase = createSupabaseBrowserClient();

  const contact = useMemo(
    () => getSessionContact(initialContact),
    [initialContact]
  );

  const [fullName, setFullName] = useState(contact.name);
  const [email, setEmail] = useState(contact.email);
  const [phone, setPhone] = useState(contact.phone);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    setErrorMessage("");

    if (cleanFullName.length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setErrorMessage("Please enter a valid email.");
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

    try {
      const response = await fetch("/api/customer/complete-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: cleanFullName,
          email: cleanEmail,
          phone: cleanPhone,
          password,
          requestId,
          next,
        }),
      });

      const result =
        (await response.json().catch(() => ({}))) as CompleteSignupResponse;

      if (!response.ok) {
        setErrorMessage(result.error ?? "Unable to create customer account.");
        setIsSubmitting(false);
        return;
      }

      if (result.existingUser) {
        window.sessionStorage.removeItem("fixly_customer_signup_contact");
        window.location.href = `/login?intent=customer&next=${encodeURIComponent(
          result.redirectTo ?? "/customer"
        )}`;
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInError) {
        window.sessionStorage.removeItem("fixly_customer_signup_contact");
        window.location.href = `/login?intent=customer&next=${encodeURIComponent(
          result.redirectTo ?? "/customer"
        )}`;
        return;
      }

      window.sessionStorage.removeItem("fixly_customer_signup_contact");
      window.location.href = result.redirectTo ?? "/customer";
    } catch {
      setErrorMessage("Unable to create customer account. Please try again.");
      setIsSubmitting(false);
    }
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
            disabled={isSubmitting}
            onChange={(event) => {
              setFullName(event.target.value);
              setErrorMessage("");
            }}
            autoComplete="name"
          />
        </label>

        <label className="form-field">
          <span>Email</span>

          <input
            type="email"
            required
            value={email}
            disabled={isSubmitting}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrorMessage("");
            }}
            autoComplete="email"
          />
        </label>

        <label className="form-field">
          <span>Phone</span>

          <input
            value={phone}
            disabled={isSubmitting}
            onChange={(event) => {
              setPhone(event.target.value);
              setErrorMessage("");
            }}
            autoComplete="tel"
          />
        </label>

        <label className="form-field">
          <span>Password</span>

          <input
            type="password"
            required
            minLength={8}
            value={password}
            disabled={isSubmitting}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrorMessage("");
            }}
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
            disabled={isSubmitting}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setErrorMessage("");
            }}
            autoComplete="new-password"
          />
        </label>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <button
          type="submit"
          className="button button-primary"
          disabled={
            isSubmitting ||
            fullName.trim().length < 2 ||
            !isValidEmail(email) ||
            password.length < 8 ||
            password !== confirmPassword
          }
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}