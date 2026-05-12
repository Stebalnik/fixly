export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import LegalPageTemplate from "@/features/legal/LegalPageTemplate";

export const metadata: Metadata = {
  title: "Cookie Policy | Fixly",
  description:
    "Learn how Fixly uses cookies and related technologies across the platform.",
};

export default function CookiePolicyPage() {
  return (
    <LegalPageTemplate
      title="Cookie Policy"
      description="This Cookie Policy explains how Fixly uses cookies and similar technologies."
      updatedAt="May 11, 2026"
    >
      <div className="legal-section">
        <h2>What Are Cookies</h2>

        <p>
          Cookies are small text files stored on your device that help websites
          function properly and improve user experiences.
        </p>
      </div>

      <div className="legal-section">
        <h2>How Fixly Uses Cookies</h2>

        <ul>
          <li>Maintain sessions and authentication</li>
          <li>Remember preferences and settings</li>
          <li>Analyze platform performance and traffic</li>
          <li>Improve security and fraud prevention</li>
          <li>Support analytics and operational reporting</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>Third-Party Services</h2>

        <p>
          Some third-party providers such as analytics or payment processors may
          also use cookies or related technologies.
        </p>
      </div>

      <div className="legal-section">
        <h2>Managing Cookies</h2>

        <p>
          Users may control or disable cookies through browser settings. Certain
          platform functionality may not operate correctly if cookies are
          disabled.
        </p>
      </div>
    </LegalPageTemplate>
  );
}