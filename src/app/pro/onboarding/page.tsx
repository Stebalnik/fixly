import PublicPageShell from "@/components/PublicPageShell";
import { ProOnboardingForm } from "@/features/pro/ProOnboardingForm";

type PageProps = {
  searchParams?: Promise<{
    lead?: string;
    next?: string;
  }>;
};

export const metadata = {
  title: "Complete Pro Onboarding | Fixly",
};

export default async function ProOnboardingPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container-narrow">
            <p className="eyebrow">Fixly Pro</p>
            <h1>Complete your pro account</h1>
            <p className="hero-text">
              Confirm your pro profile, then buy FIXAs, unlock leads,
              and manage purchased requests.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-narrow">
            <ProOnboardingForm
              lead={params?.lead ?? ""}
              next={params?.next ?? "/account/fixa"}
            />
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}