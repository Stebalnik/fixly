import Link from "next/link";
import { requireAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AiGeneratedPageActions } from "@/features/account/AiGeneratedPageActions";

export const dynamic = "force-dynamic";

type GeneratedPage = {
  id: string;
  target_url: string;
  page_type: string;
  status: string;
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
  created_at: string;
};

export default async function GeneratedPagesPage() {
  await requireAdminUser();

  const admin = createSupabaseAdminClient();

  const { data: pages, error } = await admin
    .from("ai_generated_pages")
    .select(
      "id, target_url, page_type, status, title, meta_description, h1, intro, sections, faqs, internal_links, cta, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="page">
      <section className="section">
        <div className="container">
          <p className="eyebrow">Fixly AI Ops</p>

          <div className="flex flex-between gap-md">
            <div>
              <h1>Generated Page Drafts</h1>
              <p className="hero-text">
                Review AI-generated SEO page drafts before publishing.
              </p>
            </div>

            <Link href="/account/ai-agents" className="button button-secondary">
              Back to opportunities
            </Link>
          </div>

          <div className="grid-1">
            {(pages ?? []).map((page: GeneratedPage) => (
              <article key={page.id} className="card">
                <p className="eyebrow">
                  {page.status} · {page.page_type}
                </p>

                <h2>{page.h1 ?? page.title}</h2>

                <p>
                  <strong>Target URL:</strong>{" "}
                  <Link href={page.target_url}>{page.target_url}</Link>
                </p>
<AiGeneratedPageActions
  pageId={page.id}
  targetUrl={page.target_url}
  status={page.status}
/>
                <p>
                  <strong>Meta title:</strong> {page.title}
                </p>

                {page.meta_description ? (
                  <p>
                    <strong>Meta description:</strong>{" "}
                    {page.meta_description}
                  </p>
                ) : null}

                {page.intro ? <p>{page.intro}</p> : null}

                {Array.isArray(page.sections) && page.sections.length > 0 ? (
                  <div>
                    <h3>Sections</h3>

                    {page.sections.map((section, index) => (
                      <div key={`${section.heading}-${index}`}>
                        {section.heading ? <h4>{section.heading}</h4> : null}
                        {section.body ? <p>{section.body}</p> : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                {Array.isArray(page.faqs) && page.faqs.length > 0 ? (
                  <div>
                    <h3>FAQ</h3>

                    {page.faqs.map((faq, index) => (
                      <div key={`${faq.question}-${index}`}>
                        {faq.question ? <h4>{faq.question}</h4> : null}
                        {faq.answer ? <p>{faq.answer}</p> : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                {Array.isArray(page.internal_links) &&
                page.internal_links.length > 0 ? (
                  <div>
                    <h3>Internal links</h3>

                    <div className="service-seo-list">
                      {page.internal_links.map((link, index) =>
                        link.href && link.label ? (
                          <p key={`${link.href}-${index}`}>
                            <Link href={link.href}>{link.label}</Link>
                          </p>
                        ) : null
                      )}
                    </div>
                  </div>
                ) : null}

                {page.cta ? (
                  <div className="card-flat">
                    <p>{page.cta}</p>
                    <Link href="/book" className="button button-primary">
                      Request service
                    </Link>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}