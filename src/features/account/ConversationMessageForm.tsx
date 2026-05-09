"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ConversationMessageFormProps = {
  conversationId: string;
};

type SendMessageResult = {
  ok?: boolean;
  error?: string;
};

export function ConversationMessageForm({
  conversationId,
}: ConversationMessageFormProps) {
  const router = useRouter();

  const [body, setBody] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const message = body.trim();

    if (message.length < 1) {
      setErrorMessage("Message cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body: message,
          }),
        }
      );

      const result = (await response.json().catch(() => ({}))) as SendMessageResult;

      if (!response.ok) {
        setErrorMessage(result.error ?? "Unable to send message.");
        setIsSubmitting(false);
        return;
      }

      setBody("");
      router.refresh();
    } catch {
      setErrorMessage("Unable to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="conversation-message-form" onSubmit={sendMessage}>
      <label className="form-field">
        <span>Message</span>

        <textarea
          className="form-textarea"
          rows={4}
          value={body}
          required
          disabled={isSubmitting}
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
        disabled={isSubmitting || body.trim().length < 1}
      >
        {isSubmitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}