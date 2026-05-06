import PublicPageShell from "@/components/PublicPageShell";
import { CustomerSignupForm } from "@/features/customer/CustomerSignupForm";

export const metadata = {
  title: "Create Customer Account | Fixly",
};

type PageProps = {
  searchParams: Promise<{
    request?: string;
    next?: string;
  }>;
};

export default async function CustomerSignupPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <PublicPageShell>
      <main className="page">
        <section className="section">
          <div className="container-narrow">
            <CustomerSignupForm
              requestId={params.request ?? ""}
              next={params.next ?? "/customer"}
            />
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}