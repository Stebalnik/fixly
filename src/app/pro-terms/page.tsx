import type { Metadata } from "next";
import LegalPageTemplate from "@/features/legal/LegalPageTemplate";

export const metadata: Metadata = {
  title: "Pro Terms | Fixly",
  description:
    "Terms for professionals using Fixly to access customer requests and marketplace opportunities.",
};

export default function ProTermsPage() {
  return (
    <LegalPageTemplate
      title="Pro Terms"
      description="These Pro Terms apply to service professionals using Fixly to access leads, communicate with customers, and participate in the marketplace."
      updatedAt="May 11, 2026"
    >
      <div className="legal-section">
        <h2>Independent Professionals</h2>
        <p>
          Professionals using Fixly operate independently. Fixly does not employ,
          supervise, or control professionals and does not guarantee service
          outcomes.
        </p>
      </div>

      <div className="legal-section">
        <h2>Licensing and Compliance</h2>
        <p>
          Professionals are responsible for maintaining all licenses, insurance,
          permits, certifications, tax registrations, and legal requirements
          applicable to their services and locations.
        </p>
      </div>

      <div className="legal-section">
        <h2>Lead Access</h2>
        <p>
          Professionals may use FIXAs or other payment methods to unlock customer
          requests. Lead access provides contact or request information but does
          not guarantee that a customer will hire, respond, or proceed.
        </p>
      </div>

      <div className="legal-section">
        <h2>Professional Conduct</h2>
        <ul>
          <li>Communicate honestly and respectfully</li>
          <li>Provide accurate pricing and availability</li>
          <li>Avoid spam, harassment, or misleading claims</li>
          <li>Perform work safely and lawfully</li>
          <li>Respect customer privacy and contact preferences</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>Account Suspension</h2>
        <p>
          Fixly may restrict, suspend, or remove professional accounts that
          violate platform rules, misuse customer data, create safety risks, or
          engage in fraudulent activity.
        </p>
      </div>
    </LegalPageTemplate>
  );
}