"use client";

import { useState } from "react";

type MessageMode = "initial" | "followup";

type StartLeadConversationButtonProps = {
  requestId: string;
  messageMode?: MessageMode;
};

const messageTemplates: Record<MessageMode, string> = {
  initial:
    "Hi, I opened your request on Fixly. I can help with this job. What time works best for you?",
  followup:
    "Hi, I wanted to ask a few additional questions about your request so I can better understand the job.",
};

export function StartLeadConversationButton({
  requestId,
  messageMode = "initial",
}: StartLeadConversationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(messageTemplates[messageMode]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function startConversation() {
    const cleanMessage = message.trim();

    if (cleanMessage.length < 2) {
      setErrorMessage("Message is too short.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
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

      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };

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
        Message customer
      </button>
    );
  }

  return (
    <div className="lead-message-box">
      <label className="form-field">
        <span>Message customer</span>

        <textarea
          className="form-textarea"
          rows={4}
          value={message}
          disabled={isSubmitting}
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
          disabled={isSubmitting || message.trim().length < 2}
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