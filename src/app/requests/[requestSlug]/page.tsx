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
import {
  getBreadcrumbJsonLd,
  getJsonLdScriptProps,
  getRequestFaq,
  getRequestFaqJsonLd,
  getRequestHeroSummary,
  getRequestJobDetails,
  getRequestJobSummary,
  getRequestJobTitle,
  getRequestNearbyMarketLinks,
  getRequestProGuidance,
  getRequestRelatedServiceLinks,
  getRequestScopeItems,
  getRequestStructuredData,
  type JsonLdObject,
} from "@/lib/seo";
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

function JsonLdScript({
  data,
}: {
  data: JsonLdObject | Record<string, unknown> | null;
}) {
  const props = getJsonLdScriptProps(data as JsonLdObject | null);

  if (!props) {
    return null;
  }

  return <script {...props} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { requestSlug } = await params;

  const { data } = await supabase
    .from("service_requests")
    .select(
      "public_slug, city, state, public_description, subcategory_slug, category_slug, market_slug, lead_price_credits, lead_price_fixas, index_status"
    )
    .eq("public_slug", requestSlug)
    .single();

  if (!data) {
    return {
      title: "Request Not Found | Fixly",
    };
  }

  const category = getCategoryBySlug(data.category_slug);
  const subcategory = data.subcategory_slug
    ? getSubcategoryBySlug(data.subcategory_slug)
    : null;
  const market = getMarketBySlug(data.market_slug);
  const leadPriceFixas = data.lead_price_fixas ?? data.lead_price_credits ?? 0;

  const enrichmentParams = {
    market,
    category,
    subcategory,
    city: data.city,
    state: data.state,
    publicDescription: data.public_description,
    leadPriceFixas,
  };

  return {
    title: `${getRequestJobTitle(enrichmentParams)} | Fixly`,
    description: getRequestHeroSummary(enrichmentParams).slice(0, 155),
    alternates: {
      canonical: `/requests/${data.public_slug}`,
    },
    robots:
      data.index_status === "index"
        ? undefined
        : {
            index: false,
            follow: true,
          },
  };
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

  const serviceLabel =
    subcategory?.shortTitle ?? category?.shortTitle ?? "Home Service";

  const leadPriceFixas = getLeadPriceFixas(request);

  const enrichmentParams = {
    market,
    category,
    subcategory,
    city: request.city,
    state: request.state,
    publicDescription: request.public_description,
    leadPriceFixas,
  };

  const jobTitle = getRequestJobTitle(enrichmentParams);
  const heroSummary = getRequestHeroSummary(enrichmentParams);
  const jobSummary = getRequestJobSummary(enrichmentParams);
  const jobDetails = getRequestJobDetails(enrichmentParams);
  const scopeItems = getRequestScopeItems(enrichmentParams);
  const proGuidance = getRequestProGuidance(enrichmentParams);
  const relatedServiceLinks = getRequestRelatedServiceLinks(enrichmentParams);
  const nearbyMarketLinks = getRequestNearbyMarketLinks(enrichmentParams);
  const faq = getRequestFaq(enrichmentParams);

  const serviceJsonLd = getRequestStructuredData(enrichmentParams);
  const faqJsonLd = getRequestFaqJsonLd(faq);
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Requests", url: "/requests" },
    { name: jobTitle, url: `/requests/${request.public_slug}` },
  ]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Requests", href: "/requests" },
    { label: jobTitle },
  ];

  return (
    <PublicPageShell market={market ?? undefined} breadcrumbs={breadcrumbs}>
      <JsonLdScript data={serviceJsonLd} />
      <JsonLdScript data={faqJsonLd} />
      <JsonLdScript data={breadcrumbJsonLd} />

      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Local job opportunity</p>
            <h1>{jobTitle}</h1>
            <p className="hero-text">{heroSummary}</p>

            <div className="flex gap-md">
              <Link href="/pro/signup" className="button button-primary">
                Find local jobs
              </Link>

              <Link href="/book" className="button button-secondary">
                Post a similar request
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-2">
            <div className="card">
              <h2>Job details</h2>

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
                  <strong>Job access price:</strong>{" "}
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
                <h2>Job unlocked</h2>

                <p>
                  You already unlocked this job. Customer contact details are
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
                    job access is active.
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
                      Purchased jobs
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
                <h2>Available for local pros</h2>

                <p>
                  Customer contact details are private and become available only
                  after paid job access.
                </p>

                <ul className="service-list">
                  {proGuidance.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

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
          <div className="container grid-2">
            <div className="card">
              <h2>Job summary</h2>
              <p>{jobSummary}</p>

              <div className="service-seo-list">
                {jobDetails.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>

            <div className="card">
              <h2>Scope of work</h2>

              <ul className="service-list">
                {scopeItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {relatedServiceLinks.length > 0 && (
          <section className="section">
            <div className="container">
              <h2>Related services in {request.city}</h2>

              <div className="grid-3">
                {relatedServiceLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="card card-hover"
                  >
                    <h3>{link.title}</h3>
                    <p>{link.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {nearbyMarketLinks.length > 0 && (
          <section className="section">
            <div className="container">
              <h2>Nearby service areas</h2>

              <div className="grid-3">
                {nearbyMarketLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="card card-hover"
                  >
                    <h3>{link.title}</h3>
                    <p>{link.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section-sm">
          <div className="container">
            <h2>Questions about this local job</h2>

            <div className="grid-2">
              {faq.map((item) => (
                <div key={item.question} className="card">
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container flex-center">
            <div className="card service-cta-card">
              <h2>Looking for more local service jobs?</h2>

              <p>
                Join Fixly as a pro to browse public requests, unlock customer
                contact details, and find local work near you.
              </p>

              <div className="flex gap-md">
                <Link href="/pro/signup" className="button button-primary">
                  Join as a pro
                </Link>

                <Link href="/book" className="button button-secondary">
                  Post a request
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}