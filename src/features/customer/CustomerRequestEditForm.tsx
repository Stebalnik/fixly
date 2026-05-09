"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CustomerRequestEditFormProps = {
  request: {
    id: string;
    publicSlug: string;
    publicDescription: string;
    status: string;
  };
};

type ApiResult = {
  error?: string;
};

export function CustomerRequestEditForm({
  request,
}: CustomerRequestEditFormProps) {
  const router = useRouter();

  const [description, setDescription] = useState(request.publicDescription);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isArchived = request.status === "archived";
  const isDeleted = request.status === "deleted";
  const isClosed = isArchived || isDeleted;

  async function updateRequest() {
    if (isSubmitting) {
      return;
    }

    const cleanDescription = description.trim();

    if (cleanDescription.length < 20) {
      setErrorMessage("Description must be at least 20 characters.");
      setSuccessMessage("");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/customer/requests/${request.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicDescription: cleanDescription,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as ApiResult;

      if (!response.ok) {
        setErrorMessage(result.error ?? "Unable to update request.");
        setIsSubmitting(false);
        return;
      }

      setDescription(cleanDescription);
      setSuccessMessage("Request updated successfully.");
      router.refresh();
    } catch {
      setErrorMessage("Unable to update request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function archiveRequest() {
    if (isSubmitting || isArchived) {
      return;
    }

    const confirmed = window.confirm(
      "Archive this request? Pros will no longer be able to unlock it."
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/customer/requests/${request.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "archive",
        }),
      });

      const result = (await response.json().catch(() => ({}))) as ApiResult;

      if (!response.ok) {
        setErrorMessage(result.error ?? "Unable to archive request.");
        setIsSubmitting(false);
        return;
      }

      router.push("/customer");
      router.refresh();
    } catch {
      setErrorMessage("Unable to archive request. Please try again.");
      setIsSubmitting(false);
    }
  }

  async function deleteRequest() {
    if (isSubmitting) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this request? This will close it for pros and remove it from your active dashboard."
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/customer/requests/${request.id}`, {
        method: "DELETE",
      });

      const result = (await response.json().catch(() => ({}))) as ApiResult;

      if (!response.ok) {
        setErrorMessage(result.error ?? "Unable to delete request.");
        setIsSubmitting(false);
        return;
      }

      router.push("/customer");
      router.refresh();
    } catch {
      setErrorMessage("Unable to delete request. Please try again.");
      setIsSubmitting(false);
    }
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
          disabled={isSubmitting || isClosed}
          onChange={(event) => {
            setDescription(event.target.value);
            setErrorMessage("");
            setSuccessMessage("");
          }}
        />
      </label>

      {isClosed ? (
        <div className="form-message form-message-warning">
          This request is closed and can no longer be edited.
        </div>
      ) : null}

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      {successMessage ? (
        <div className="form-message form-message-success">
          {successMessage}
        </div>
      ) : null}

      <div className="customer-edit-actions">
        <button
          type="button"
          className="button button-primary"
          onClick={updateRequest}
          disabled={
            isSubmitting ||
            isClosed ||
            description.trim().length < 20 ||
            description.trim() === request.publicDescription.trim()
          }
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
          disabled={isSubmitting || isClosed}
        >
          Archive
        </button>

        <button
          type="button"
          className="button button-danger"
          onClick={deleteRequest}
          disabled={isSubmitting || isDeleted}
        >
          Delete
        </button>
      </div>
    </div>
  );
}