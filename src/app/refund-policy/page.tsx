import type { Metadata } from "next";
import LegalPageTemplate from "@/features/legal/LegalPageTemplate";

export const metadata: Metadata = {
  title: "Refund Policy | Fixly",
  description:
    "Fixly refund policy for marketplace credits, FIXAs, lead access, and platform payments.",
};

export default function RefundPolicyPage() {
  return (
    <LegalPageTemplate
      title="Refund Policy"
      description="This Refund Policy explains how Fixly handles refunds for platform payments, FIXAs, and lead access."
      updatedAt="May 11, 2026"
    >
      <div className="legal-section">
        <h2>General Policy</h2>
        <p>
          Payments made on Fixly may include purchases of FIXAs, lead access, or
          other marketplace features. Refund eligibility depends on whether the
          purchased feature has been used, delivered, or accessed.
        </p>
      </div>

      <div className="legal-section">
        <h2>FIXA Purchases</h2>
        <p>
          FIXAs are platform credits used inside Fixly. Unused FIXA purchases may
          be reviewed for refund eligibility. FIXAs already used to unlock leads
          or access marketplace features are generally not refundable.
        </p>
      </div>

      <div className="legal-section">
        <h2>Lead Access</h2>
        <p>
          Once a professional unlocks or purchases access to a customer request,
          the lead information is considered delivered. Lead access fees are
          generally non-refundable after delivery.
        </p>
      </div>

      <div className="legal-section">
        <h2>Duplicate or Technical Errors</h2>
        <p>
          Fixly may review refund requests caused by duplicate charges, technical
          processing errors, or platform access failures.
        </p>
      </div>

      <div className="legal-section">
        <h2>How to Request a Refund</h2>
        <p>
          Refund requests should include the account email, transaction date,
          payment amount, and a short explanation of the issue.
        </p>
      </div>
    </LegalPageTemplate>
  );
}