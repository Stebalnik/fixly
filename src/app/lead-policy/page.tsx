export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import LegalPageTemplate from "@/features/legal/LegalPageTemplate";

export const metadata: Metadata = {
  title: "Lead Policy | Fixly",
  description:
    "Fixly policy for customer requests, lead access, lead quality, and marketplace lead delivery.",
};

export default function LeadPolicyPage() {
  return (
    <LegalPageTemplate
      title="Lead Policy"
      description="This Lead Policy explains how customer requests and lead access work on Fixly."
      updatedAt="May 11, 2026"
    >
      <div className="legal-section">
        <h2>Customer Requests</h2>
        <p>
          Customers may submit service requests describing their project,
          location, timing, and contact preferences. Public request pages may
          show non-private request details to help professionals understand the
          opportunity.
        </p>
      </div>

      <div className="legal-section">
        <h2>Private Contact Data</h2>
        <p>
          Customer contact information is not intended for public display.
          Professionals may receive access to contact details only through
          authorized marketplace flows.
        </p>
      </div>

      <div className="legal-section">
        <h2>Lead Delivery</h2>
        <p>
          A lead is considered delivered when a professional unlocks or receives
          access to the request details or customer contact information through
          Fixly.
        </p>
      </div>

      <div className="legal-section">
        <h2>No Hiring Guarantee</h2>
        <p>
          Fixly does not guarantee that a customer will respond, hire a
          professional, accept an estimate, or proceed with the project after a
          lead is unlocked.
        </p>
      </div>

      <div className="legal-section">
        <h2>Lead Quality Review</h2>
        <p>
          Fixly may review leads for spam, duplicate submissions, incomplete
          information, or suspected abuse. Low-quality or unsafe requests may be
          removed or marked unavailable.
        </p>
      </div>
    </LegalPageTemplate>
  );
}