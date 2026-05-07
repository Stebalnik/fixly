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

export function UnlockProContactButton({
  requestId,
  proUserId,
}: UnlockProContactButtonProps) {
  const [contact, setContact] = useState<ProContact | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function unlockContact() {
    setIsSubmitting(true);
    setErrorMessage("");

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

    const result = (await response.json()) as {
      error?: string;
      proContact?: ProContact;
    };

    if (!response.ok || !result.proContact) {
      setErrorMessage(result.error ?? "Unable to unlock pro contact.");
      setIsSubmitting(false);
      return;
    }

    setContact(result.proContact);
    setIsSubmitting(false);
  }

  if (contact) {
    return (
      <div className="customer-pro-contact-box">
        <strong>{contact.companyName}</strong>

        {contact.contactName ? <p>{contact.contactName}</p> : null}
        {contact.phone ? <p>{contact.phone}</p> : null}
        {contact.email ? <p>{contact.email}</p> : null}
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
        {isSubmitting ? "Unlocking..." : "Unlock pro contact · 100 FIXAs"}
      </button>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
    </div>
  );
}