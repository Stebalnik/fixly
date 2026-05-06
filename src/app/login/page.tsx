import PublicPageShell from "@/components/PublicPageShell";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata = {
  title: "Login | Fixly",
};

type PageProps = {
  searchParams: Promise<{
    intent?: string;
    next?: string;
    request?: string;
  }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <PublicPageShell>
      <main className="page">
        <section className="section">
          <div className="container-narrow">
            <LoginForm
              intent={params.intent ?? "pro"}
              next={params.next ?? ""}
              requestId={params.request ?? ""}
            />
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}