export const dynamic = "force-dynamic";

import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import PublicPageShell from "@/components/PublicPageShell";
import { StartLeadConversationButton } from "@/features/pro/StartLeadConversationButton";
import { UnlockLeadButton } from "@/features/pro/UnlockLeadButton";
import { getMarketBySlug } from "@/lib/geo";
import { getProAccessContext } from "@/lib/pro/access";
import { getCategoryBySlug, getSubcategoryBySlug } from "@/lib/services";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    requestSlug: string;
  }>;
};

type ServiceRequest = {
  id: string;
  public_slug: string;
  category_slug: string;
  subcategory_slug: string | null;
  market_slug: string;
  city: string;
  state: string;
  country_code: string;
  public_description: string;
  status: string;
  quality_score: number;
  index_status: string;
  created_at: string;
  customer_user_id: string | null;
  lead_price_credits: number;
  lead_price_fixas: number | null;
  purchase_count: number;
  max_purchases: number;
};

type RequestContact = {
  customer_name: string | null;
  street_address: string | null;
  phone_country_code: string | null;
  phone_number: string | null;
  full_phone: string | null;
  email: string | null;
};

type PurchasedLeadAccess = {
  hasAccess: boolean;
  contact: RequestContact | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getCurrentUser() {
  const cookieStore = await cookies();

  const serverSupabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await serverSupabase.auth.getUser();

  return user;
}

async function getPurchasedLeadAccess(
  requestId: string,
  proUserId: string
): Promise<PurchasedLeadAccess> {
  const admin = createSupabaseAdminClient();

  const { data: access } = await admin
    .from("pro_lead_access")
    .select("id")
    .eq("request_id", requestId)
    .eq("pro_user_id", proUserId)
    .maybeSingle();

  if (!access) {
    return {
      hasAccess: false,
      contact: null,
    };
  }

  const { data: contact } = await admin
    .from("request_contacts")
    .select(
      "customer_name, street_address, phone_country_code, phone_number, full_phone, email"
    )
    .eq("request_id", requestId)
    .maybeSingle();

  return {
    hasAccess: true,
    contact: contact as RequestContact | null,
  };
}

async function hasExistingConversation(requestId: string, proUserId: string) {
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("conversations")
    .select("id")
    .eq("request_id", requestId)
    .eq("pro_user_id", proUserId)
    .maybeSingle();

  return Boolean(data);
}

export async function generateMetadata({ params }: PageProps) {
  const { requestSlug } = await params;

  const { data } = await supabase
    .from("service_requests")
    .select(
      "public_slug, city, state, public_description, subcategory_slug, category_slug"
    )
    .eq("public_slug", requestSlug)
    .single();

  if (!data) {
    return {
      title: "Request Not Found | Fixly",
    };
  }

  const subcategory = data.subcategory_slug
    ? getSubcategoryBySlug(data.subcategory_slug)
    : null;

  const category = getCategoryBySlug(data.category_slug);
  const title = subcategory?.title ?? category?.title ?? "Home Service Request";

  return {
    title: `${title} in ${data.city}, ${data.state} | Fixly Request`,
    description: data.public_description.slice(0, 150),
  };
}

function getLeadPriceFixas(request: ServiceRequest) {
  return request.lead_price_fixas ?? request.lead_price_credits ?? 0;
}

function getPhoneLabel(contact: RequestContact) {
  return (
    contact.full_phone ||
    `${contact.phone_country_code ?? ""} ${
      contact.phone_number ?? ""
    }`.trim() ||
    null
  );
}

export default async function RequestPage({ params }: PageProps) {
  const { requestSlug } = await params;

  const { data, error } = await supabase
    .from("service_requests")
    .select(
      "id, public_slug, category_slug, subcategory_slug, market_slug, city, state, country_code, public_description, status, quality_score, index_status, created_at, customer_user_id, lead_price_credits, lead_price_fixas, purchase_count, max_purchases"
    )
    .eq("public_slug", requestSlug)
    .single();

  if (error || !data) {
    notFound();
  }

  const request = data as ServiceRequest;
  const user = await getCurrentUser();

  const isOwner = Boolean(user) && request.customer_user_id === user?.id;
  const proContext = !isOwner ? await getProAccessContext() : null;
  const isPro = Boolean(proContext?.ok);
  const proUserId = proContext?.ok ? proContext.proUserId : null;

  const purchasedLeadAccess =
    proUserId && !isOwner
      ? await getPurchasedLeadAccess(request.id, proUserId)
      : { hasAccess: false, contact: null };

  const existingConversation =
    proUserId && purchasedLeadAccess.hasAccess
      ? await hasExistingConversation(request.id, proUserId)
      : false;

  const purchasedContact = purchasedLeadAccess.contact;
  const hasPurchasedLead = purchasedLeadAccess.hasAccess;
  const customerHasAccount = Boolean(request.customer_user_id);

  const showLeadAccessBlock = !isOwner && !hasPurchasedLead;
  const showUnlockedLeadBlock = !isOwner && isPro && hasPurchasedLead;
  const showCustomerOwnerBlock = isOwner;

  const category = getCategoryBySlug(request.category_slug);
  const subcategory = request.subcategory_slug
    ? getSubcategoryBySlug(request.subcategory_slug)
    : null;
  const market = getMarketBySlug(request.market_slug);

  const title = subcategory?.title ?? category?.title ?? "Home Service Request";
  const serviceLabel =
    subcategory?.shortTitle ?? category?.shortTitle ?? "Home Service";

  const leadPriceFixas = getLeadPriceFixas(request);

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Public request</p>

            <h1>
              {title} in {request.city}, {request.state}
            </h1>

            <p className="hero-text">{request.public_description}</p>

            <div className="flex gap-md">
              <Link href="/book" className="button button-primary">
                Post another request
              </Link>

              <Link href="/services" className="button button-secondary">
                Browse services
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-2">
            <div className="card">
              <h2>Request details</h2>

              <div className="service-seo-list">
                <p>
                  <strong>Service:</strong> {serviceLabel}
                </p>

                <p>
                  <strong>Location:</strong> {request.city}, {request.state}
                </p>

                {market && (
                  <p>
                    <strong>Area:</strong> {market.region}
                  </p>
                )}

                <p>
                  <strong>Status:</strong>{" "}
                  <span className="badge badge-success">{request.status}</span>
                </p>

                <p>
                  <strong>Lead price:</strong>{" "}
                  {leadPriceFixas.toLocaleString()} FIXAs
                </p>

                <p>
                  <strong>Purchased:</strong> {request.purchase_count}/
                  {request.max_purchases} pros
                </p>

                <p>
                  <strong>Posted:</strong>{" "}
                  {new Date(request.created_at).toLocaleDateString("en-US")}
                </p>
              </div>
            </div>

            {showUnlockedLeadBlock && (
              <div className="card">
                <h2>Lead unlocked</h2>

                <p>
                  You already purchased this lead. Customer contact details are
                  available below.
                </p>

                {purchasedContact ? (
                  <div className="service-seo-list">
                    <p>
                      <strong>Name:</strong>{" "}
                      {purchasedContact.customer_name || "Not provided"}
                    </p>

                    <p>
                      <strong>Phone:</strong>{" "}
                      {getPhoneLabel(purchasedContact) || "Not provided"}
                    </p>

                    <p>
                      <strong>Email:</strong>{" "}
                      {purchasedContact.email || "Not provided"}
                    </p>

                    <p>
                      <strong>Address:</strong>{" "}
                      {purchasedContact.street_address || "Not provided"}
                    </p>
                  </div>
                ) : (
                  <div className="form-message form-message-warning">
                    Contact details are not available for this request, but your
                    lead access is active.
                  </div>
                )}

                {customerHasAccount ? (
                  <div className="flex gap-md">
                    <StartLeadConversationButton
                      requestId={request.id}
                      messageMode={existingConversation ? "followup" : "initial"}
                    />

                    <Link
                      href="/pro/leads/purchased"
                      className="button button-secondary"
                    >
                      Purchased leads
                    </Link>
                  </div>
                ) : (
                  <div className="form-message form-message-warning">
                    This customer has not created a Fixly account yet. Please
                    contact them directly using the phone or email shown above.
                  </div>
                )}
              </div>
            )}

            {showLeadAccessBlock && (
              <div className="card">
                <h2>For pros</h2>

                <p>
                  This request is publicly visible. Customer contact details are
                  not shown publicly and will only be available after paid lead
                  access.
                </p>

                <div className="flex gap-md">
                  <UnlockLeadButton
                    leadId={request.public_slug}
                    priceFixas={leadPriceFixas}
                    isLoggedIn={Boolean(user)}
                    isPro={isPro}
                  />
                </div>
              </div>
            )}

            {showCustomerOwnerBlock && (
              <div className="card">
                <h2>Your request</h2>

                <p>
                  This is your service request. You can manage it, review pro
                  activity, or update the request details from your customer
                  account.
                </p>

                <div className="flex gap-md">
                  <Link
                    href={`/customer/requests/${request.id}/manage`}
                    className="button button-primary"
                  >
                    Manage request
                  </Link>

                  <Link
                    href="/customer/requests"
                    className="button button-secondary"
                  >
                    My requests
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card">
              <h2>Job description</h2>
              <p>{request.public_description}</p>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}