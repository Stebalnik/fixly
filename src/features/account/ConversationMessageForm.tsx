"use client";

import { useState } from "react";

type ConversationMessageFormProps = {
  conversationId: string;
};

export function ConversationMessageForm({
  conversationId,
}: ConversationMessageFormProps) {
  const [body, setBody] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = body.trim();

    if (!message) {
      setErrorMessage("Message cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: message,
      }),
    });

    const result = (await response.json()) as {
      error?: string;
    };

    if (!response.ok) {
      setErrorMessage(result.error ?? "Unable to send message.");
      setIsSubmitting(false);
      return;
    }

    window.location.reload();
  }

  return (
    <form className="conversation-message-form" onSubmit={sendMessage}>
      <label className="form-field">
        <span>Message</span>

        <textarea
          className="form-textarea"
          rows={4}
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
            setErrorMessage("");
          }}
          placeholder="Write your message..."
        />
      </label>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <button
        type="submit"
        className="button button-primary"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}