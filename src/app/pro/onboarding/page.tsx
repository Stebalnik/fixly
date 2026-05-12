import PublicPageShell from "@/components/PublicPageShell";
import { ProOnboardingForm } from "@/features/pro/ProOnboardingForm";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    lead?: string;
    next?: string;
  }>;
};

export const metadata = {
  title: "Complete Pro Profile | Fixly",
};

export default async function ProOnboardingPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container-narrow">
            <p className="eyebrow">Fixly Pro</p>

            <h1>Complete your pro profile</h1>

            <p className="hero-text">
              Add your business details to start buying FIXAs, unlocking leads,
              and connecting with customers.
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