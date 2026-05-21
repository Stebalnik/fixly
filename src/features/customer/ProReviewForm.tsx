"use client";

import { useState } from "react";

type ProReviewFormProps = {
  requestId: string;
  proUserId: string;
};

export function ProReviewForm({ requestId, proUserId }: ProReviewFormProps) {
  const [rating, setRating] = useState("5");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/pro/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          proUserId,
          rating: Number(rating),
          reviewTitle,
          reviewText,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to submit review.");
      }

      setStatus("success");
      setMessage(payload?.message ?? "Review submitted for moderation.");
      setReviewTitle("");
      setReviewText("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit review. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="card-flat form-stack" onSubmit={handleSubmit}>
      <div className="flex-between gap-md">
        <div>
          <p className="eyebrow">Review this pro</p>
          <h4>Verified customer review</h4>
        </div>
        <label className="form-field">
          <span>Rating</span>
          <select
            className="form-input"
            value={rating}
            onChange={(event) => setRating(event.target.value)}
          >
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        </label>
      </div>

      <label className="form-field">
        <span>Review title</span>
        <input
          className="form-input"
          value={reviewTitle}
          maxLength={120}
          onChange={(event) => setReviewTitle(event.target.value)}
          placeholder="Clear communication, quick repair..."
        />
      </label>

      <label className="form-field">
        <span>Review text</span>
        <textarea
          className="form-textarea"
          value={reviewText}
          maxLength={2000}
          rows={4}
          onChange={(event) => setReviewText(event.target.value)}
          placeholder="Share what happened, how the pro communicated, and whether the work matched expectations."
        />
      </label>

      {message ? (
        <p className={status === "error" ? "form-error" : "form-helper"}>
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        className="button button-secondary"
        disabled={isSubmitting || status === "success"}
      >
        {isSubmitting ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
