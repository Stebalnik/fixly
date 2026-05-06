"use client";

import Image from "next/image";
import { useState } from "react";

type Contact = {
  customerName: string;
  streetAddress: string;
  phoneCountryCode: string;
  phoneNumber: string;
  fullPhone: string;
  email: string;
};

type UnlockLeadButtonProps = {
  leadId: string;
  priceFixas: number;
};

export function UnlockLeadButton({
  leadId,
  priceFixas,
}: UnlockLeadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [contact, setContact] = useState<Contact | null>(null);
  const [balanceAfter, setBalanceAfter] = useState<number | null>(null);

  async function handleUnlock() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/requests/${leadId}/unlock`, {
        method: "POST",
      });

      if (response.status === 401) {
        const next = `${window.location.pathname}${window.location.search}`;

        window.location.href = `/pro/login?next=${encodeURIComponent(
          next
        )}&lead=${encodeURIComponent(leadId)}`;

        return;
      }

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to unlock lead.");
      }

      setContact(payload.contact);
      setBalanceAfter(payload.balanceAfter ?? null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (contact) {
    return (
      <div className="card-flat">
        <p className="eyebrow">Contact unlocked</p>
        <p>{contact.customerName}</p>
        <p>{contact.fullPhone}</p>
        <p>{contact.email}</p>
        {contact.streetAddress && <p>{contact.streetAddress}</p>}

        {balanceAfter !== null && (
          <p className="muted">
            Balance after unlock:{" "}
            <span className="button-fixa">
              <Image
                src="/fixacoin.png"
                alt="FIXA"
                width={16}
                height={16}
                className="button-fixa-icon"
              />
              {balanceAfter.toLocaleString()}
            </span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="form-stack">
      <button
        type="button"
        className="button button-secondary"
        onClick={handleUnlock}
        disabled={isLoading}
      >
        {isLoading ? (
          "Unlocking..."
        ) : (
          <span className="button-fixa">
            Unlock for
            <Image
              src="/fixacoin.png"
              alt="FIXA"
              width={16}
              height={16}
              className="button-fixa-icon"
            />
            {priceFixas.toLocaleString()}
          </span>
        )}
      </button>

      {errorMessage && <p className="form-error">{errorMessage}</p>}
    </div>
  );
}