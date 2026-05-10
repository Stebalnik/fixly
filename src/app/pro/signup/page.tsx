import PublicPageShell from "@/components/PublicPageShell";
import { ProSignupForm } from "@/features/pro/ProSignupForm";

export const metadata = {
  title: "Create Pro Account | Fixly Pro",
};

type PageProps = {
  searchParams: Promise<{
    lead?: string;
    next?: string;
  }>;
};

export default async function ProSignupPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  return (
    <PublicPageShell>
      <main className="page">
        <section className="section">
          <div className="container-narrow">
            <ProSignupForm
              lead={params.lead ?? ""}
              next={params.next ?? "/pro/onboarding"}
            />
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}