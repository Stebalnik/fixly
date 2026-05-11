import type { ReactNode } from "react";

type LegalPageTemplateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  updatedAt: string;
  children: ReactNode;
};

export default function LegalPageTemplate({
  eyebrow = "Fixly Policy",
  title,
  description,
  updatedAt,
  children,
}: LegalPageTemplateProps) {
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <div className="container-narrow">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="hero-text">{description}</p>
          <p className="legal-updated">Last updated: {updatedAt}</p>
        </div>
      </section>

      <section className="legal-content">
        <div className="container-narrow">
          <div className="legal-card">{children}</div>
        </div>
      </section>
    </main>
  );
}