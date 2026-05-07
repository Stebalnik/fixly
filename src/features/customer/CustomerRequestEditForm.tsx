"use client";

import { useState } from "react";
import Link from "next/link";

type CustomerRequestEditFormProps = {
  request: {
    id: string;
    publicSlug: string;
    publicDescription: string;
    status: string;
  };
};

export function CustomerRequestEditForm({
  request,
}: CustomerRequestEditFormProps) {
  const [description, setDescription] = useState(request.publicDescription);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function updateRequest() {
    setErrorMessage("");
    setIsSubmitting(true);

    const response = await fetch(`/api/customer/requests/${request.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicDescription: description,
      }),
    });

    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setErrorMessage(result.error ?? "Unable to update request.");
      setIsSubmitting(false);
      return;
    }

    window.location.href = "/customer";
  }

  async function archiveRequest() {
    setErrorMessage("");
    setIsSubmitting(true);

    const response = await fetch(`/api/customer/requests/${request.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "archive",
      }),
    });

    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setErrorMessage(result.error ?? "Unable to archive request.");
      setIsSubmitting(false);
      return;
    }

    window.location.href = "/customer";
  }

  async function deleteRequest() {
    const confirmed = window.confirm(
      "Delete this request? This will close it for pros."
    );

    if (!confirmed) return;

    setErrorMessage("");
    setIsSubmitting(true);

    const response = await fetch(`/api/customer/requests/${request.id}`, {
      method: "DELETE",
    });

    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setErrorMessage(result.error ?? "Unable to delete request.");
      setIsSubmitting(false);
      return;
    }

    window.location.href = "/customer";
  }

  return (
    <div className="customer-edit-form">
      <label className="form-field">
        <span>Description</span>
        <textarea
          className="form-textarea"
          rows={8}
          minLength={20}
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setErrorMessage("");
          }}
        />
      </label>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <div className="customer-edit-actions">
        <button
          type="button"
          className="button button-primary"
          onClick={updateRequest}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>

        <Link
          href={`/requests/${request.publicSlug}`}
          className="button button-secondary"
        >
          View public page
        </Link>

        <button
          type="button"
          className="button button-outline"
          onClick={archiveRequest}
          disabled={isSubmitting || request.status === "archived"}
        >
          Archive
        </button>

        <button
          type="button"
          className="button button-danger"
          onClick={deleteRequest}
          disabled={isSubmitting}
        >
          Delete
        </button>
      </div>
    </div>
  );
}