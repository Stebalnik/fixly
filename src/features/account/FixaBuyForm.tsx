"use client";

import Image from "next/image";
import { useState } from "react";
import {
  FIXA_PACKAGES,
  calculateFixaPriceUsd,
} from "@/lib/fixa/constants";

type FixaBuyFormProps = {
  currentBalance: number;
};

export function FixaBuyForm({ currentBalance }: FixaBuyFormProps) {
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleCheckout() {
    setIsSubmitting(true);
    setErrorMessage("");

    const response = await fetch("/api/account/fixa/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fixaAmount: selectedAmount,
      }),
    });

    const result = (await response.json()) as {
      error?: string;
      url?: string;
    };

    if (!response.ok || !result.url) {
      setErrorMessage(result.error ?? "Unable to start checkout.");
      setIsSubmitting(false);
      return;
    }

    window.location.href = result.url;
  }

  return (
    <div className="fixa-buy-form">
      <div className="fixa-current-balance">
        Current balance:{" "}
        <strong>{currentBalance.toLocaleString()} FIXAs</strong>
      </div>

      <div className="fixa-package-grid">
        {FIXA_PACKAGES.map((item) => (
          <button
            key={item.fixaAmount}
            type="button"
            className={
              selectedAmount === item.fixaAmount
                ? "fixa-package-card fixa-package-card-active"
                : "fixa-package-card"
            }
            onClick={() => setSelectedAmount(item.fixaAmount)}
          >
            <span className="fixa-package-label">{item.label}</span>

            <div className="fixa-package-amount">
              <Image
                src="/fixacoin.png"
                alt="FIXA"
                width={20}
                height={20}
              />

              <strong>
                {item.fixaAmount.toLocaleString()} FIXAs
              </strong>
            </div>

            <small>
              ${calculateFixaPriceUsd(item.fixaAmount).toFixed(2)}
            </small>
          </button>
        ))}
      </div>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <button
        type="button"
        className="button button-primary"
        onClick={handleCheckout}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Opening checkout..." : "Continue to payment"}
      </button>
    </div>
  );
}