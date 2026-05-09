"use client";

import { useState } from "react";

type StartConversationButtonProps = {
  requestId: string;
  proUserId: string;
};

type StartConversationResponse = {
  error?: string;
  redirectTo?: string;
};

const defaultMessage =
  "Hi, I saw that you opened my request. Can you tell me more about your availability and pricing?";

export function StartConversationButton({
  requestId,
  proUserId,
}: StartConversationButtonProps) {
  const [message, setMessage] = useState(defaultMessage);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function startConversation() {
    if (isSubmitting) {
      return;
    }

    setErrorMessage("");

    const cleanMessage = message.trim();

    if (cleanMessage.length < 2) {
      setErrorMessage("Message is too short.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/conversations/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          proUserId,
          initialMessage: cleanMessage,
        }),
      });

      if (response.status === 401) {
        window.location.href = `/login?intent=customer&next=${encodeURIComponent(
          window.location.pathname
        )}`;
        return;
      }

      const result = (await response.json().catch(() => ({}))) as StartConversationResponse;

      if (!response.ok || !result.redirectTo) {
        setErrorMessage(result.error ?? "Unable to start conversation.");
        setIsSubmitting(false);
        return;
      }

      window.location.href = result.redirectTo;
    } catch {
      setErrorMessage("Unable to start conversation. Please try again.");
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        className="button button-primary"
        onClick={() => setIsOpen(true)}
      >
        Message pro
      </button>
    );
  }

  return (
    <div className="customer-message-start-box">
      <label className="form-field">
        <span>Message</span>

        <textarea
          className="form-textarea"
          rows={4}
          value={message}
          disabled={isSubmitting}
          onChange={(event) => {
            setMessage(event.target.value);
            setErrorMessage("");
          }}
          placeholder="Write your message..."
        />
      </label>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <div className="flex gap-sm">
        <button
          type="button"
          className="button button-primary"
          onClick={startConversation}
          disabled={isSubmitting || message.trim().length < 2}
        >
          {isSubmitting ? "Sending..." : "Send message"}
        </button>

        <button
          type="button"
          className="button button-secondary"
          onClick={() => {
            setIsOpen(false);
            setErrorMessage("");
          }}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}