import Link from "next/link";

type AiGeneratedSeoPageProps = {
  page: {
    target_url: string;
    title: string;
    meta_description: string | null;
    h1: string | null;
    intro: string | null;
    sections: Array<{
      heading?: string;
      body?: string;
    }> | null;
    faqs: Array<{
      question?: string;
      answer?: string;
    }> | null;
    internal_links: Array<{
      label?: string;
      href?: string;
    }> | null;
    cta: string | null;
  };
};

export function AiGeneratedSeoPage({ page }: AiGeneratedSeoPageProps) {
  return (
    <main className="page">
      <section className="section service-hero">
        <div className="container">
          <p className="eyebrow">Fixly Local Services</p>

          <h1>{page.h1 ?? page.title}</h1>

          {page.intro ? <p className="hero-text">{page.intro}</p> : null}

          <div className="flex gap-md">
            <Link href="/book" className="button button-primary">
              Request service
            </Link>

            <Link href="/requests" className="button button-secondary">
              Browse open requests
            </Link>
          </div>
        </div>
      </section>

      {Array.isArray(page.sections) && page.sections.length > 0 ? (
        <section className="section">
          <div className="container grid-3">
            {page.sections.map((section, index) => (
              <article key={`${section.heading}-${index}`} className="card">
                {section.heading ? <h2>{section.heading}</h2> : null}
                {section.body ? <p>{section.body}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {Array.isArray(page.faqs) && page.faqs.length > 0 ? (
        <section className="section-sm">
          <div className="container">
            <h2>Common questions</h2>

            <div className="grid-2">
              {page.faqs.map((faq, index) => (
                <article key={`${faq.question}-${index}`} className="card">
                  {faq.question ? <h3>{faq.question}</h3> : null}
                  {faq.answer ? <p>{faq.answer}</p> : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {Array.isArray(page.internal_links) && page.internal_links.length > 0 ? (
        <section className="section-sm">
          <div className="container">
            <h2>Related Fixly pages</h2>

            <div className="service-seo-list">
              {page.internal_links.map((link, index) =>
                link.href && link.label ? (
                  <Link key={`${link.href}-${index}`} href={link.href}>
                    {link.label}
                  </Link>
                ) : null
              )}
            </div>
          </div>
        </section>
      ) : null}

      {page.cta ? (
        <section className="section-sm">
          <div className="container">
            <div className="card">
              <h2>Ready to get help?</h2>
              <p>{page.cta}</p>
              <Link href="/book" className="button button-primary">
                Post a request
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}