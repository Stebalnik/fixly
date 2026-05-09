"use client";

import Image from "next/image";
import { useState } from "react";

type Contact = {
  customerName: string | null;
  streetAddress: string | null;
  phoneCountryCode: string | null;
  phoneNumber: string | null;
  fullPhone: string | null;
  email: string | null;
};

type UnlockLeadResponse = {
  ok: boolean;
  alreadyPurchased: boolean;
  requestId: string;
  publicSlug: string;
  priceFixas: number;
  balanceAfter?: number | null;
  customerHasAccount: boolean;
  customerUserId?: string | null;
  leadStatus?: string | null;
  purchaseCount?: number;
  maxPurchases?: number | null;
  contact: Contact;
};

type UnlockLeadButtonProps = {
  leadId: string;
  priceFixas: number;
};

type ApiError = {
  error?: string;
};

const defaultMessage =
  "Hi, I opened your request on Fixly. I can help with this job. What time works best for you?";

export function UnlockLeadButton({
  leadId,
  priceFixas,
}: UnlockLeadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isMessageSubmitting, setIsMessageSubmitting] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [errorMessage, setErrorMessage] = useState("");
  const [messageError, setMessageError] = useState("");
  const [unlockResult, setUnlockResult] = useState<UnlockLeadResponse | null>(
    null
  );

  async function handleUnlock() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setMessageError("");

    try {
      const response = await fetch(`/api/requests/${leadId}/unlock`, {
        method: "POST",
      });

      if (response.status === 401) {
        const next = `${window.location.pathname}${window.location.search}`;

        window.location.href = `/login?intent=pro&next=${encodeURIComponent(
          next
        )}&lead=${encodeURIComponent(leadId)}`;

        return;
      }

      const payload = (await response.json().catch(() => null)) as
        | UnlockLeadResponse
        | ApiError
        | null;

      if (!response.ok) {
        const errorPayload = payload as ApiError | null;

        throw new Error(errorPayload?.error ?? "Unable to unlock lead.");
      }

      if (!payload || !("contact" in payload)) {
        throw new Error("Contact details not returned.");
      }

      setUnlockResult(payload);
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

    if (!unlockResult?.requestId) {
      setMessageError("Request ID is missing.");
      return;
    }

    if (!unlockResult.customerHasAccount) {
      setMessageError(
        "This customer has not created a Fixly account yet. Please contact them directly using the phone or email shown above."
      );
      return;
    }

    const cleanMessage = message.trim();

    if (cleanMessage.length < 2) {
      setMessageError("Message is too short.");
      return;
    }

    setIsMessageSubmitting(true);

    try {
      const response = await fetch("/api/conversations/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: unlockResult.requestId,
          proUserId: "self",
          initialMessage: cleanMessage,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok || !result.redirectTo) {
        setMessageError(result.error ?? "Unable to start conversation.");
        setIsMessageSubmitting(false);
        return;
      }

      window.location.href = result.redirectTo;
    } catch {
      setMessageError("Unable to start conversation. Please try again.");
      setIsMessageSubmitting(false);
    }
  }

  if (unlockResult) {
    const { contact } = unlockResult;
    const isSoldOut = unlockResult.leadStatus === "sold_out";

    return (
      <div className="card-flat">
        <p className="eyebrow">Contact unlocked</p>

        <div className="lead-contact-details">
          {contact.customerName ? <p>{contact.customerName}</p> : null}
          {contact.fullPhone ? <p>{contact.fullPhone}</p> : null}
          {contact.email ? <p>{contact.email}</p> : null}
          {contact.streetAddress ? <p>{contact.streetAddress}</p> : null}
        </div>

        {unlockResult.alreadyPurchased ? (
          <div className="form-message form-message-success">
            You already unlocked this lead. No additional FIXAs were charged.
          </div>
        ) : null}

        {isSoldOut ? (
          <div className="form-message form-message-warning">
            This request has reached its response limit and is now sold out.
          </div>
        ) : null}

        {typeof unlockResult.purchaseCount === "number" &&
        unlockResult.maxPurchases ? (
          <p className="text-muted">
            Responses: {unlockResult.purchaseCount} /{" "}
            {unlockResult.maxPurchases}
          </p>
        ) : null}

        {unlockResult.balanceAfter !== null &&
        unlockResult.balanceAfter !== undefined ? (
          <p className="text-muted">
            Balance after unlock:{" "}
            <span className="button-fixa">
              <Image
                src="/fixacoin.png"
                alt="FIXA"
                width={16}
                height={16}
                className="button-fixa-icon"
              />
              {unlockResult.balanceAfter.toLocaleString()}
            </span>
          </p>
        ) : null}

        {!unlockResult.customerHasAccount ? (
          <div className="form-message form-message-warning">
            This customer has not created a Fixly account yet. Please contact
            them directly using the phone or email shown above.
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
                disabled={isMessageSubmitting}
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
                disabled={isMessageSubmitting || message.trim().length < 2}
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