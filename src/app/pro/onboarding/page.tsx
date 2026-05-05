import { ProOnboardingForm } from "@/features/pro/ProOnboardingForm";

type PageProps = {
  searchParams?: Promise<{
    lead?: string;
    next?: string;
  }>;
};

export const metadata = {
  title: "Create Pro Account | Fixly",
};

export default async function ProOnboardingPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <main className="page">
      <section className="service-hero">
        <div className="container-narrow">
          <p className="eyebrow">Fixly Pro</p>
          <h1>Create your pro account</h1>
          <p className="hero-text">
            Sign up to buy FIXAs, unlock homeowner leads, and manage purchased
            requests.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow">
          <ProOnboardingForm
            lead={params?.lead ?? ""}
            next={params?.next ?? ""}
          />
        </div>
      </section>
    </main>
  );
}