import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import PublicPageShell from "@/components/PublicPageShell";
import { CustomerSignupForm } from "@/features/customer/CustomerSignupForm";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "Finish Customer Account | Fixly",
};

type PageProps = {
  searchParams: Promise<{
    request?: string;
    next?: string;
  }>;
};

type InitialContact = {
  name: string;
  email: string;
  phone: string;
};

async function getInitialContact(requestId: string): Promise<InitialContact> {
  if (!requestId) {
    return {
      name: "",
      email: "",
      phone: "",
    };
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const admin = createSupabaseAdminClient();

  const { data: contact } = await admin
    .from("request_contacts")
    .select("customer_name, email, full_phone")
    .eq("request_id", requestId)
    .maybeSingle();

  return {
    name: contact?.customer_name ?? "",
    email: contact?.email ?? "",
    phone: contact?.full_phone ?? "",
  };
}

export default async function CustomerSignupPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const requestId = params.request ?? "";
  const initialContact = await getInitialContact(requestId);

  return (
    <PublicPageShell>
      <main className="auth-page">
        <section className="auth-section">
          <div className="container">
            <div className="auth-layout">
              <div className="auth-content">
                <div className="auth-eyebrow">Customer account</div>

                <h1 className="auth-title">
                  Finish creating your account
                </h1>

                <p className="auth-description">
                  Your service request is already created. Add a password to
                  manage this request, track responses from pros, and keep all
                  future service requests in one place.
                </p>

                <div className="auth-features">
                  <div className="auth-feature">
                    <span className="auth-feature-icon">✓</span>
                    <span>Your request details stay connected to your account</span>
                  </div>

                  <div className="auth-feature">
                    <span className="auth-feature-icon">✓</span>
                    <span>Track status and responses from local pros</span>
                  </div>

                  <div className="auth-feature">
                    <span className="auth-feature-icon">✓</span>
                    <span>Archive, edit, or delete requests anytime</span>
                  </div>

                  <div className="auth-feature">
                    <span className="auth-feature-icon">✓</span>
                    <span>Your contact details stay private</span>
                  </div>
                </div>
              </div>

              <div className="auth-card">
                <CustomerSignupForm
                  requestId={requestId}
                  next={params.next ?? "/customer"}
                  initialContact={initialContact}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}