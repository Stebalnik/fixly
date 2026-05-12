export const dynamic = "force-dynamic";

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
    lead?: string;
  }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <PublicPageShell>
      <main className="auth-page">
        <section className="auth-section">
          <div className="container">
            <div className="auth-layout">
              <div className="auth-content">
                <div className="auth-eyebrow">Fixly account</div>

                <h1 className="auth-title">Log in to Fixly</h1>

                <p className="auth-description">
                  Use one account for customer requests, pro leads, FIXA
                  balance, messages, and notifications.
                </p>

                <div className="auth-features">
                  <div className="auth-feature">
                    <span className="auth-feature-icon">✓</span>
                    <span>Manage service requests</span>
                  </div>

                  <div className="auth-feature">
                    <span className="auth-feature-icon">✓</span>
                    <span>Unlock leads and contacts with FIXAs</span>
                  </div>

                  <div className="auth-feature">
                    <span className="auth-feature-icon">✓</span>
                    <span>Message customers and pros</span>
                  </div>

                  <div className="auth-feature">
                    <span className="auth-feature-icon">✓</span>
                    <span>Switch between customer and pro areas</span>
                  </div>
                </div>
              </div>

              <div className="auth-card">
                <LoginForm
                  intent={params.intent ?? "pro"}
                  next={params.next ?? ""}
                  requestId={params.request ?? ""}
                  lead={params.lead ?? ""}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}