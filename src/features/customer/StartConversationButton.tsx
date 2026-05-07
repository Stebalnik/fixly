"use client";

import { useState } from "react";

type StartConversationButtonProps = {
  requestId: string;
  proUserId: string;
};

export function StartConversationButton({
  requestId,
  proUserId,
}: StartConversationButtonProps) {
  const [message, setMessage] = useState(
    "Hi, I saw that you opened my request. Can you tell me more about your availability and pricing?"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function startConversation() {
    setErrorMessage("");

    if (message.trim().length < 2) {
      setErrorMessage("Message is too short.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/conversations/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId,
        proUserId,
        initialMessage: message.trim(),
      }),
    });

    const result = (await response.json()) as {
      error?: string;
      redirectTo?: string;
    };

    if (!response.ok || !result.redirectTo) {
      setErrorMessage(result.error ?? "Unable to start conversation.");
      setIsSubmitting(false);
      return;
    }

    window.location.href = result.redirectTo;
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
          onChange={(event) => {
            setMessage(event.target.value);
            setErrorMessage("");
          }}
        />
      </label>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <div className="flex gap-sm">
        <button
          type="button"
          className="button button-primary"
          onClick={startConversation}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send message"}
        </button>

        <button
          type="button"
          className="button button-secondary"
          onClick={() => setIsOpen(false)}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}