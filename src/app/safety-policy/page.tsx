import type { Metadata } from "next";
import LegalPageTemplate from "@/features/legal/LegalPageTemplate";

export const metadata: Metadata = {
  title: "Safety Policy | Fixly",
  description:
    "Fixly marketplace safety standards for customers, professionals, communication, and platform use.",
};

export default function SafetyPolicyPage() {
  return (
    <LegalPageTemplate
      title="Safety Policy"
      description="This Safety Policy explains the standards and expectations for safe use of the Fixly platform."
      updatedAt="May 11, 2026"
    >
      <div className="legal-section">
        <h2>Marketplace Safety</h2>

        <p>
          Fixly is designed to help customers and professionals connect for home
          services and project-related work. Users are expected to interact
          honestly, respectfully, and lawfully.
        </p>
      </div>

      <div className="legal-section">
        <h2>Prohibited Conduct</h2>

        <ul>
          <li>Harassment, threats, or abusive communication</li>
          <li>Fraudulent or misleading activity</li>
          <li>Unsafe or illegal service offers</li>
          <li>Spam or unsolicited communication</li>
          <li>Misuse of customer or professional information</li>
          <li>Attempts to bypass platform protections unlawfully</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>Professional Responsibility</h2>

        <p>
          Professionals are responsible for following applicable safety
          standards, regulations, licensing requirements, and jobsite safety
          practices related to their work.
        </p>
      </div>

      <div className="legal-section">
        <h2>Customer Responsibility</h2>

        <p>
          Customers should provide accurate project details, communicate clearly,
          and avoid unsafe requests or unlawful activity through the platform.
        </p>
      </div>

      <div className="legal-section">
        <h2>Reporting Issues</h2>

        <p>
          Users may report suspicious, unsafe, fraudulent, or abusive activity
          through Fixly support or platform communication channels.
        </p>
      </div>

      <div className="legal-section">
        <h2>Account Enforcement</h2>

        <p>
          Fixly may restrict, suspend, or remove accounts involved in unsafe,
          abusive, fraudulent, or policy-violating behavior.
        </p>
      </div>
    </LegalPageTemplate>
  );
}