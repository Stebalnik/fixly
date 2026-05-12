export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import LegalPageTemplate from "@/features/legal/LegalPageTemplate";

export const metadata: Metadata = {
  title: "Privacy Policy | Fixly",
  description:
    "Learn how Fixly collects, uses, and protects user information across the marketplace platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageTemplate
      title="Privacy Policy"
      description="This Privacy Policy explains how Fixly collects, uses, stores, and protects your information when using the platform."
      updatedAt="May 11, 2026"
    >
      <div className="legal-section">
        <h2>Information We Collect</h2>

        <p>
          Fixly may collect information you provide directly, including your
          name, phone number, email address, service request details, account
          information, and communication preferences.
        </p>

        <p>
          We also collect technical and usage information including browser
          type, IP address, device information, pages visited, and interactions
          with the platform.
        </p>
      </div>

      <div className="legal-section">
        <h2>How We Use Information</h2>

        <ul>
          <li>Provide marketplace functionality and service matching</li>
          <li>Process service requests and lead distribution</li>
          <li>Improve platform quality and security</li>
          <li>Prevent fraud, spam, and abuse</li>
          <li>Communicate updates and operational notices</li>
          <li>Analyze marketplace activity and performance</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>Lead Sharing</h2>

        <p>
          When customers submit requests through Fixly, selected information may
          be shared with professionals who unlock or purchase access to the
          request through the marketplace.
        </p>
      </div>

      <div className="legal-section">
        <h2>Cookies and Analytics</h2>

        <p>
          Fixly uses cookies, analytics tools, and related technologies to
          improve performance, measure traffic, personalize experiences, and
          maintain platform security.
        </p>
      </div>

      <div className="legal-section">
        <h2>Data Security</h2>

        <p>
          We implement reasonable technical and organizational measures to
          protect user information. However, no platform or internet
          transmission can be guaranteed completely secure.
        </p>
      </div>

      <div className="legal-section">
        <h2>Contact</h2>

        <p>
          Questions regarding this Privacy Policy may be submitted through the
          Fixly contact channels available on the platform.
        </p>
      </div>
    </LegalPageTemplate>
  );
}