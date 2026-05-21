export const dynamic = "force-dynamic";

import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import PublicPageShell from "@/components/PublicPageShell";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CustomerRequestEditForm } from "@/features/customer/CustomerRequestEditForm";
import { UnlockProContactButton } from "@/features/customer/UnlockProContactButton";
import { ProReviewForm } from "@/features/customer/ProReviewForm";

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

type UnlockedProAccess = {
  pro_user_id: string;
};

type ExistingReview = {
  pro_user_id: string;
  moderation_status: string;
  rating: number;
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
  if (!value) {
    return "Unknown date";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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

  const { data: request, error: requestError } = await admin
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
      max_purchases,
      max_responses,
      created_at
    `
    )
    .eq("id", id)
    .eq("customer_user_id", user.id)
    .maybeSingle();

  if (requestError) {
    throw new Error(requestError.message);
  }

  if (!request) {
    notFound();
  }

  const [
    { data: proResponsesData, error: proResponsesError },
    { data: unlockedAccessData },
    { data: existingReviewsData },
  ] =
    await Promise.all([
      admin
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
        .order("created_at", { ascending: false }),

      admin
        .from("customer_pro_contact_access")
        .select("pro_user_id")
        .eq("request_id", request.id)
        .eq("customer_user_id", user.id),

      admin
        .from("pro_reviews")
        .select("pro_user_id, moderation_status, rating")
        .eq("request_id", request.id)
        .eq("customer_user_id", user.id),
    ]);

  if (proResponsesError) {
    throw new Error(proResponsesError.message);
  }

  const proResponses = (proResponsesData ?? []) as ProResponse[];
  const unlockedProUserIds = new Set(
    ((unlockedAccessData ?? []) as UnlockedProAccess[]).map(
      (access) => access.pro_user_id
    )
  );
  const reviewsByProUserId = new Map(
    ((existingReviewsData ?? []) as ExistingReview[]).map((review) => [
      review.pro_user_id,
      review,
    ])
  );

  const maxResponses = request.max_purchases ?? request.max_responses ?? 5;
  const responseCount = request.purchase_count ?? proResponses.length;
  const isSoldOut = request.lead_status === "sold_out";
  const isArchived = request.status !== "open";

  return (
    <PublicPageShell>
      <main className="section">
        <div className="container-narrow">
          <div className="flex flex-between gap-md">
            <Link href="/customer" className="button button-secondary">
              Back to my requests
            </Link>

            <Link
              href={`/requests/${request.public_slug}`}
              className="button button-secondary"
            >
              View public request
            </Link>
          </div>

          <div className="card customer-edit-card">
            <p className="eyebrow">
              {request.city}, {request.state}
            </p>

            <h1>Manage request</h1>

            <div className="flex gap-sm">
              <span className="badge badge-primary">{request.status}</span>

              <span
                className={
                  isSoldOut ? "badge badge-warning" : "badge badge-success"
                }
              >
                {request.lead_status}
              </span>
            </div>

            {isSoldOut ? (
              <div className="form-message form-message-warning">
                This request has reached its response limit. New pros can no
                longer unlock it.
              </div>
            ) : null}

            {isArchived ? (
              <div className="form-message form-message-warning">
                This request is no longer open.
              </div>
            ) : null}

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
                  These pros unlocked your request contact details. You can
                  unlock pro contacts, compare responses, and communicate
                  directly through Fixly.
                </p>
              </div>

              <span className="badge badge-primary">
                {responseCount} / {maxResponses}
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
                {proResponses.map((response, index) => {
                  const isUnlocked = unlockedProUserIds.has(
                    response.pro_user_id
                  );
                  const existingReview = reviewsByProUserId.get(
                    response.pro_user_id
                  );

                  return (
                    <div key={response.id} className="customer-response-item">
                      <div>
                        <div className="flex gap-sm">
                          <span className="badge">
                            Pro #{proResponses.length - index}
                          </span>

                          {isUnlocked ? (
                            <span className="badge badge-success">
                              Contact unlocked
                            </span>
                          ) : null}
                        </div>

                        <h3>Pro response #{proResponses.length - index}</h3>

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

                      {existingReview ? (
                        <div className="card-flat">
                          <p className="eyebrow">Review submitted</p>
                          <p>
                            {existingReview.rating}/5 rating · moderation status:{" "}
                            {existingReview.moderation_status}
                          </p>
                        </div>
                      ) : (
                        <ProReviewForm
                          requestId={request.id}
                          proUserId={response.pro_user_id}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}
