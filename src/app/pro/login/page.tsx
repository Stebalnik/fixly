import PublicPageShell from "@/components/PublicPageShell";
import { ProLoginForm } from "@/features/pro/ProLoginForm";

export const metadata = {
  title: "Pro Login | Fixly Pro",
};

type PageProps = {
  searchParams: Promise<{
    lead?: string;
    next?: string;
  }>;
};

export default async function ProLoginPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <PublicPageShell>
      <main className="page">
        <section className="section">
          <div className="container-narrow">
            <ProLoginForm
              lead={params.lead ?? ""}
              next={params.next ?? "/pro/credits"}
            />
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}