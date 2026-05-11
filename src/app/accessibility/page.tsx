import type { Metadata } from "next";
import LegalPageTemplate from "@/features/legal/LegalPageTemplate";

export const metadata: Metadata = {
  title: "Accessibility | Fixly",
  description:
    "Learn about Fixly's commitment to accessibility and inclusive platform experiences.",
};

export default function AccessibilityPage() {
  return (
    <LegalPageTemplate
      title="Accessibility"
      description="Fixly is committed to improving accessibility and creating a more inclusive marketplace experience."
      updatedAt="May 11, 2026"
    >
      <div className="legal-section">
        <h2>Accessibility Commitment</h2>

        <p>
          Fixly aims to provide a platform experience that is accessible and
          usable for as many people as possible across devices, browsers, and
          assistive technologies.
        </p>
      </div>

      <div className="legal-section">
        <h2>Ongoing Improvements</h2>

        <p>
          Accessibility is an ongoing effort. We continue improving navigation,
          readability, semantic structure, responsiveness, and compatibility
          across the platform.
        </p>
      </div>

      <div className="legal-section">
        <h2>Compatibility</h2>

        <p>
          Fixly is designed to function across modern browsers and mobile
          devices. Some areas of the platform may evolve over time as new
          features are introduced.
        </p>
      </div>

      <div className="legal-section">
        <h2>Feedback</h2>

        <p>
          Users who experience accessibility barriers or usability issues are
          encouraged to contact Fixly so improvements can be reviewed and
          prioritized.
        </p>
      </div>
    </LegalPageTemplate>
  );
}