import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import PublicPageShell from "@/components/PublicPageShell";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CustomerRequestEditForm } from "@/features/customer/CustomerRequestEditForm";
import { UnlockProContactButton } from "@/features/customer/UnlockProContactButton";

export const metadata = {
  title: "Manage Request | Fixly",
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ProResponse = {
  id: string;
  pro_user_id: string;
  access_type: string;
  price_fixas: number;
  purchased_at: string | null;
  created_at: string;
};

async function getUser() {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

function formatDate(value: string | null) {
  if (!value) return "Unknown date";

  return new Date(value).toLocaleString();
}

export default async function CustomerRequestManagePage({
  params,
}: PageProps) {
  const user = await getUser();

  if (!user) {
    redirect("/login?intent=customer&next=/customer");
  }

  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { data: request } = await admin
    .from("service_requests")
    .select(
      `
      id,
      public_slug,
      category_slug,
      subcategory_slug,
      city,
      state,
      public_description,
      status,
      lead_status,
      purchase_count,
      max_responses,
      created_at
    `
    )
    .eq("id", id)
    .eq("customer_user_id", user.id)
    .maybeSingle();

  if (!request) {
    notFound();
  }

  const { data: proResponsesData, error: proResponsesError } = await admin
    .from("pro_lead_access")
    .select(
      `
      id,
      pro_user_id,
      access_type,
      price_fixas,
      purchased_at,
      created_at
    `
    )
    .eq("request_id", request.id)
    .order("created_at", { ascending: false });

  if (proResponsesError) {
    throw new Error(proResponsesError.message);
  }

  const proResponses = (proResponsesData ?? []) as ProResponse[];

  return (
    <PublicPageShell>
      <main className="section">
        <div className="container-narrow">
          <Link href="/customer" className="button button-secondary">
            Back to my requests
          </Link>

          <div className="card customer-edit-card">
            <p className="eyebrow">
              {request.city}, {request.state}
            </p>

            <h1>Manage request</h1>

            <CustomerRequestEditForm
              request={{
                id: request.id,
                publicSlug: request.public_slug,
                publicDescription: request.public_description,
                status: request.status,
              }}
            />
          </div>

          <div className="card customer-responses-card">
            <div className="flex flex-between gap-md">
              <div>
                <p className="eyebrow">Pro responses</p>

                <h2>
                  {proResponses.length === 1
                    ? "1 pro opened this request"
                    : `${proResponses.length} pros opened this request`}
                </h2>

                <p>
                  These pros unlocked your request contact details. You can now
                  unlock pro contacts, compare responses, and communicate
                  directly through Fixly.
                </p>
              </div>

              <span className="badge badge-primary">
                {request.purchase_count ?? proResponses.length} /{" "}
                {request.max_responses ?? 5}
              </span>
            </div>

            {proResponses.length === 0 ? (
              <div className="customer-response-empty">
                <h3>No pro responses yet</h3>

                <p>
                  When a pro unlocks your request, their response will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="customer-response-list">
                {proResponses.map((response, index) => (
                  <div key={response.id} className="customer-response-item">
                    <div>
                      <h3>
                        Pro response #{proResponses.length - index}
                      </h3>

                      <p className="text-muted">
                        Contact unlocked by pro on{" "}
                        {formatDate(
                          response.purchased_at ?? response.created_at
                        )}
                      </p>

                      <p className="text-muted">
                        Access type: {response.access_type}
                      </p>
                    </div>

                    <div className="customer-response-actions">
                      <span className="badge badge-success">
                        {response.price_fixas.toLocaleString()} FIXAs paid
                      </span>

                      <UnlockProContactButton
                        requestId={request.id}
                        proUserId={response.pro_user_id}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}