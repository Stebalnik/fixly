"use client";

import { useState } from "react";
import { StartConversationButton } from "@/features/customer/StartConversationButton";

type UnlockProContactButtonProps = {
  requestId: string;
  proUserId: string;
};

type ProContact = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
};

type UnlockProContactResponse = {
  ok: boolean;
  alreadyUnlocked?: boolean;
  priceFixas?: number;
  customerBalanceAfter?: number | null;
  proContact?: ProContact;
  error?: string;
};

const UNLOCK_PRICE_FIXAS = 100;

export function UnlockProContactButton({
  requestId,
  proUserId,
}: UnlockProContactButtonProps) {
  const [contact, setContact] = useState<ProContact | null>(null);
  const [alreadyUnlocked, setAlreadyUnlocked] = useState(false);
  const [customerBalanceAfter, setCustomerBalanceAfter] = useState<
    number | null
  >(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function unlockContact() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/customer/requests/${requestId}/unlock-pro`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            proUserId,
          }),
        }
      );

      if (response.status === 401) {
        window.location.href = `/login?intent=customer&next=${encodeURIComponent(
          window.location.pathname
        )}`;
        return;
      }

      const result =
        (await response.json().catch(() => ({}))) as UnlockProContactResponse;

      if (!response.ok || !result.proContact) {
        setErrorMessage(result.error ?? "Unable to unlock pro contact.");
        setIsSubmitting(false);
        return;
      }

      setContact(result.proContact);
      setAlreadyUnlocked(Boolean(result.alreadyUnlocked));
      setCustomerBalanceAfter(result.customerBalanceAfter ?? null);
    } catch {
      setErrorMessage("Unable to unlock pro contact. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (contact) {
    return (
      <div className="customer-pro-contact-box">
        <p className="eyebrow">Pro contact unlocked</p>

        <strong>{contact.companyName || "Fixly Pro"}</strong>

        {contact.contactName ? <p>{contact.contactName}</p> : null}
        {contact.phone ? <p>{contact.phone}</p> : null}
        {contact.email ? <p>{contact.email}</p> : null}

        {alreadyUnlocked ? (
          <div className="form-message form-message-success">
            You already unlocked this pro contact. No additional FIXAs were
            charged.
          </div>
        ) : null}

        {customerBalanceAfter !== null ? (
          <p className="text-muted">
            Balance after unlock: {customerBalanceAfter.toLocaleString()} FIXAs
          </p>
        ) : null}

        <StartConversationButton requestId={requestId} proUserId={proUserId} />
      </div>
    );
  }

  return (
    <div className="customer-response-unlock">
      <button
        type="button"
        className="button button-secondary"
        onClick={unlockContact}
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Unlocking..."
          : `Unlock pro contact · ${UNLOCK_PRICE_FIXAS} FIXAs`}
      </button>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
    </div>
  );
}