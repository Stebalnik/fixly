export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import LegalPageTemplate from "@/features/legal/LegalPageTemplate";

export const metadata: Metadata = {
  title: "Terms of Service | Fixly",
  description:
    "Terms and conditions governing the use of the Fixly marketplace platform.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageTemplate
      title="Terms of Service"
      description="These Terms govern access to and use of the Fixly platform."
      updatedAt="May 11, 2026"
    >
      <div className="legal-section">
        <h2>Marketplace Platform</h2>

        <p>
          Fixly is a marketplace platform connecting customers and independent
          service professionals. Fixly does not directly perform home services.
        </p>
      </div>

      <div className="legal-section">
        <h2>User Responsibilities</h2>

        <ul>
          <li>Provide accurate information</li>
          <li>Use the platform lawfully</li>
          <li>Avoid fraudulent or misleading activity</li>
          <li>Respect communication and marketplace rules</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>Professional Accounts</h2>

        <p>
          Professionals are independently responsible for licensing, insurance,
          permits, certifications, pricing, service quality, and compliance with
          applicable laws.
        </p>
      </div>

      <div className="legal-section">
        <h2>Lead Access and FIXAs</h2>

        <p>
          Certain marketplace features may require FIXAs or paid access to
          customer requests. FIXAs are platform-based marketplace credits used
          for lead access and related services.
        </p>
      </div>

      <div className="legal-section">
        <h2>Limitation of Liability</h2>

        <p>
          Fixly is not liable for disputes, damages, losses, delays, or service
          outcomes arising from interactions between customers and independent
          professionals.
        </p>
      </div>

      <div className="legal-section">
        <h2>Platform Changes</h2>

        <p>
          Fixly may modify, suspend, or discontinue features or services at any
          time without prior notice.
        </p>
      </div>
    </LegalPageTemplate>
  );
}