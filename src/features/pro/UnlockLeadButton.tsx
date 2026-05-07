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

type UnlockLeadResponse = {
  contact: Contact;
  balanceAfter?: number;
  requestId: string;
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
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isMessageSubmitting, setIsMessageSubmitting] = useState(false);
  const [message, setMessage] = useState(
    "Hi, I opened your request on Fixly. I can help with this job. What time works best for you?"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [messageError, setMessageError] = useState("");
  const [contact, setContact] = useState<Contact | null>(null);
  const [requestId, setRequestId] = useState("");
  const [balanceAfter, setBalanceAfter] = useState<number | null>(null);
  const [customerHasAccount, setCustomerHasAccount] = useState(true);

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

      const payload = (await response.json().catch(() => null)) as
        | UnlockLeadResponse
        | { error?: string }
        | null;

      if (!response.ok) {
  const errorPayload = payload as { error?: string } | null;

  throw new Error(errorPayload?.error ?? "Unable to unlock lead.");
}

      if (!payload || !("contact" in payload)) {
        throw new Error("Contact details not returned.");
      }

      setContact(payload.contact);
      setRequestId(payload.requestId);
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

  async function startConversation() {
    setMessageError("");

    if (!requestId) {
      setMessageError("Request ID is missing.");
      return;
    }

    const cleanMessage = message.trim();

    if (cleanMessage.length < 2) {
      setMessageError("Message is too short.");
      return;
    }

    setIsMessageSubmitting(true);

    const response = await fetch("/api/conversations/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId,
        proUserId: "self",
        initialMessage: cleanMessage,
      }),
    });

    const result = (await response.json()) as {
      error?: string;
      redirectTo?: string;
    };

    if (!response.ok || !result.redirectTo) {
  if (result.error === "Request owner not found.") {
    setCustomerHasAccount(false);
    setMessageError("");
    setIsMessageSubmitting(false);
    return;
  }

  setMessageError(result.error ?? "Unable to start conversation.");
  setIsMessageSubmitting(false);
  return;
}

    window.location.href = result.redirectTo;
  }

  if (contact) {
    return (
      <div className="card-flat">
        <p className="eyebrow">Contact unlocked</p>

        <p>{contact.customerName}</p>
        <p>{contact.fullPhone}</p>
        <p>{contact.email}</p>
        {contact.streetAddress ? <p>{contact.streetAddress}</p> : null}

        {balanceAfter !== null ? (
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
        ) : null}

        {!customerHasAccount ? (
  <div className="form-message form-message-warning">
    This customer has not created a Fixly account yet. Please contact them
    directly using the phone or email shown above.
  </div>
) : !isMessageOpen ? (
  <button
    type="button"
    className="button button-primary"
    onClick={() => setIsMessageOpen(true)}
  >
    Start conversation
  </button>
) : (
          <div className="lead-message-box">
            <label className="form-field">
              <span>Message customer</span>

              <textarea
                className="form-textarea"
                rows={4}
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  setMessageError("");
                }}
              />
            </label>

            {messageError ? <p className="form-error">{messageError}</p> : null}

            <div className="flex gap-sm">
              <button
                type="button"
                className="button button-primary"
                onClick={startConversation}
                disabled={isMessageSubmitting}
              >
                {isMessageSubmitting ? "Sending..." : "Send message"}
              </button>

              <button
                type="button"
                className="button button-secondary"
                onClick={() => setIsMessageOpen(false)}
                disabled={isMessageSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="button button-primary"
        onClick={handleUnlock}
        disabled={isLoading}
      >
        {isLoading ? "Unlocking..." : `Unlock lead · ${priceFixas} FIXAs`}
      </button>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
    </div>
  );
}