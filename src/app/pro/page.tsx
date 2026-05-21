export const dynamic = "force-dynamic";

import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import PublicPageShell from "@/components/PublicPageShell";
import {
  getCategoryLabels,
  getProCompletion,
  getProDisplayName,
  getProProfileHref,
  getProServiceAreaSlugs,
  getPublicProAreaLinks,
  getSubcategoryLabels,
  isLeadUnlockable,
  normalizePublicProProfile,
  PUBLIC_PRO_PROFILE_SELECT,
  scoreLeadForPro,
  sortMatchedLeads,
  type MatchableLeadRequest,
  type PublicProProfile,
} from "@/lib/marketplace";

export const metadata = {
  title: "Pro Dashboard | Fixly Pro",
  robots: {
    index: false,
    follow: false,
  },
};

type PurchasedLeadRequest = {
  public_slug: string;
  category_slug: string;
  subcategory_slug: string | null;
  city: string;
  state: string;
  public_description: string;
};

type PurchasedLead = {
  id: string;
  request_id: string;
  purchased_at: string;
  price_fixas: number;
  service_requests:
    | PurchasedLeadRequest
    | PurchasedLeadRequest[]
    | null;
};

type LeadOpportunity = MatchableLeadRequest & {
  id: string;
  public_description: string;
  lead_price_fixas: number;
};

async function getCurrentUserId() {
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

  return user?.id ?? null;
}

function getRequestTitle(request: Pick<LeadOpportunity, "category_slug" | "city" | "state">) {
  return `${request.category_slug} job in ${request.city}, ${request.state}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ProDashboardPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return (
      <PublicPageShell>
        <main className="page">
          <section className="section">
            <div className="container-narrow card">
              <h1>Pro login required</h1>
              <p>Please log in to view your Fixly Pro dashboard.</p>
              <Link
                href="/login?intent=pro&next=/pro"
                className="button button-primary"
              >
                Log in
              </Link>
            </div>
          </section>
        </main>
      </PublicPageShell>
    );
  }

  const admin = createSupabaseAdminClient();

  const [{ data: fixaAccount }, { data: profileData }, { data: purchasedLeads }] =
    await Promise.all([
      admin
        .from("user_fixa_accounts")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle(),
      admin
        .from("pro_profiles")
        .select(PUBLIC_PRO_PROFILE_SELECT)
        .eq("user_id", userId)
        .maybeSingle(),
      admin
        .from("pro_lead_access")
        .select(
          `
          id,
          request_id,
          purchased_at,
          price_fixas,
          service_requests (
            public_slug,
            category_slug,
            subcategory_slug,
            city,
            state,
            public_description
          )
        `
        )
        .eq("pro_user_id", userId)
        .order("purchased_at", { ascending: false })
        .limit(6),
    ]);

  const profile = profileData
    ? normalizePublicProProfile(profileData as PublicProProfile)
    : null;
  const completion = profile
    ? getProCompletion(profile)
      : {
        score: 0,
        completedFields: [],
        missingFields: ["Create your pro profile"],
        nextBestAction: "Create your pro profile",
      };
  const balance = fixaAccount?.balance ?? 0;
  const leads = (purchasedLeads ?? []) as unknown as PurchasedLead[];
  const serviceCategories = profile?.service_categories ?? [];
  const serviceAreas = profile ? getProServiceAreaSlugs(profile) : [];

  let opportunityQuery = admin
    .from("service_requests")
    .select(
      "id, public_slug, category_slug, subcategory_slug, market_slug, city, state, public_description, status, lead_status, lead_price_fixas, purchase_count, max_purchases, created_at"
    )
    .eq("status", "open")
    .eq("lead_status", "available")
    .order("created_at", { ascending: false })
    .limit(24);

  if (serviceCategories.length > 0) {
    opportunityQuery = opportunityQuery.in("category_slug", serviceCategories);
  }

  if (serviceAreas.length > 0) {
    opportunityQuery = opportunityQuery.in("market_slug", serviceAreas);
  }

  const { data: opportunityData } = await opportunityQuery;
  const purchasedRequestIds = new Set(leads.map((lead) => lead.request_id));
  const opportunities = sortMatchedLeads(
    ((opportunityData ?? []) as LeadOpportunity[])
      .filter(isLeadUnlockable)
      .filter((request) => !purchasedRequestIds.has(request.id))
      .map((request) => ({
        request,
        match: profile
          ? scoreLeadForPro(request, profile)
          : {
              score: 0,
              percentage: 0,
              reasons: [],
              serviceAreaMatch: false,
              categoryMatch: false,
              subcategoryMatch: false,
              freshnessLabel: "",
              competitionLabel: "",
              sortScore: 0,
            },
      }))
      .filter(({ match }) => match.serviceAreaMatch && match.categoryMatch),
    "best"
  ).slice(0, 6);

  const displayName = profile ? getProDisplayName(profile) : "Fixly Pro";
  const categoryLabels = profile ? getCategoryLabels(profile) : [];
  const subcategoryLabels = profile ? getSubcategoryLabels(profile) : [];
  const areaLinks = profile ? getPublicProAreaLinks(profile) : [];
  const publicProfileHref = profile ? getProProfileHref(profile) : null;

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly Pro</p>
            <h1>Pro Dashboard</h1>
            <p className="hero-text">
              Welcome back, {displayName}. Track profile readiness, lead
              opportunities, purchased jobs, response reminders, and your FIXA
              balance from one operating view.
            </p>
            <div className="flex gap-md">
              <Link href="/pro/profile" className="button button-primary">
                Edit profile
              </Link>
              <Link href="/pro/leads" className="button button-secondary">
                View lead opportunities
              </Link>
              {publicProfileHref ? (
                <Link href={publicProfileHref} className="button button-secondary">
                  Public profile
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-3">
            <div className="card">
              <p className="eyebrow">Profile completion</p>
              <h2>{completion.score}%</h2>
              <p>
                Missing:{" "}
                {completion.missingFields.length > 0
                  ? completion.missingFields.slice(0, 3).join(", ")
                  : "nothing major"}
              </p>
              <p>Next: {completion.nextBestAction}</p>
              <Link href="/pro/profile" className="button button-secondary">
                Improve profile
              </Link>
            </div>

            <div className="card">
              <p className="eyebrow">Verification</p>
              <h2>{profile?.verification_status ?? "unverified"}</h2>
              <p>
                Identity {profile?.identity_verified ? "verified" : "pending"} ·
                license {profile?.license_verified ? "verified" : "pending"} ·
                insurance {profile?.insurance_verified ? "verified" : "pending"}
              </p>
              <p>
                Background check:{" "}
                {profile?.background_check_status === "clear"
                  ? "verified"
                  : profile?.background_check_status ?? "pending"}
              </p>
              <p>Verification review will be available soon.</p>
            </div>

            <div className="card">
              <p className="eyebrow">FIXA balance</p>
              <h2>{balance.toLocaleString()} FIXAs</h2>
              <p>
                {balance > 0
                  ? "Ready to unlock qualified homeowner leads."
                  : "Add FIXAs before unlocking your next homeowner lead."}
              </p>
              <Link href="/account/fixa" className="button button-primary">
                Manage FIXAs
              </Link>
            </div>

            <div className="card">
              <p className="eyebrow">Purchased leads</p>
              <h2>{leads.length}</h2>
              <p>Recently unlocked requests waiting for follow-up.</p>
              <Link
                href="/pro/leads/purchased"
                className="button button-secondary"
              >
                View purchased leads
              </Link>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-2">
            <div className="card">
              <h2>Lead opportunities</h2>
              <div className="lead-list">
                {opportunities.map(({ request, match }) => (
                  <article key={request.public_slug} className="card-flat">
                    <h3>
                      {match.percentage}% match · {getRequestTitle(request)}
                    </h3>
                    <p>{request.public_description}</p>
                    <p className="muted">
                      {request.purchase_count}/{request.max_purchases} pro
                      unlocks ·{" "}
                      {match.subcategoryMatch ? "exact service" : "category"} ·{" "}
                      {request.lead_price_fixas.toLocaleString()} FIXAs
                    </p>
                    <Link
                      href={`/requests/${request.public_slug}`}
                      className="button button-primary"
                    >
                      Review job
                    </Link>
                  </article>
                ))}

                {opportunities.length === 0 ? (
                  <div className="card-flat">
                    <h3>No matching open jobs yet</h3>
                    <p>
                      Add service categories and service areas to your profile
                      so Fixly can surface better local opportunities.
                    </p>
                    <Link href="/requests" className="button button-secondary">
                      Browse all requests
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="card">
              <h2>Response reminders</h2>
              <div className="service-seo-list">
                <p>
                  <strong>Unlocked leads:</strong>{" "}
                  {profile?.unlocked_leads_count ?? leads.length}
                </p>
                <p>
                  <strong>Lead responses:</strong>{" "}
                  {profile?.lead_response_count ?? 0}
                </p>
                <p>
                  <strong>Average response:</strong>{" "}
                  {profile?.average_response_minutes
                    ? `${profile.average_response_minutes} minutes`
                    : "Not enough data yet"}
                </p>
              </div>
              <p>
                Reply quickly after unlocking a lead. Fast response behavior is
                part of future marketplace ranking and homeowner trust signals.
              </p>
              <Link href="/account/messages" className="button button-secondary">
                Open messages
              </Link>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-2">
            <div className="card">
              <h2>Profile coverage</h2>
              <ul className="service-list">
                {(categoryLabels.length ? categoryLabels : ["No service categories yet"]).map(
                  (item) => (
                    <li key={item}>{item}</li>
                  )
                )}
              </ul>
              <p>
                Subcategories:{" "}
                {subcategoryLabels.length > 0
                  ? subcategoryLabels.slice(0, 8).join(", ")
                  : "not selected yet"}
              </p>
            </div>

            <div className="card">
              <h2>Service areas</h2>
              <ul className="service-list">
                {(areaLinks.length
                  ? areaLinks.map((area) => area.title)
                  : ["No service areas yet"]
                ).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card">
              <div className="flex-between gap-md">
                <div>
                  <p className="eyebrow">Recent activity</p>
                  <h2>Purchased leads</h2>
                </div>
                <Link href="/requests" className="button button-secondary">
                  Browse more jobs
                </Link>
              </div>

              <div className="lead-list">
                {leads.map((lead) => {
                  const request = Array.isArray(lead.service_requests)
                    ? lead.service_requests[0]
                    : lead.service_requests;

                  if (!request) return null;

                  return (
                    <article key={lead.id} className="card-flat">
                      <div className="flex-between gap-md">
                        <div>
                          <h3>
                            {request.category_slug} lead in {request.city},{" "}
                            {request.state}
                          </h3>
                          <p>{request.public_description}</p>
                          <p className="muted">
                            Purchased {formatDate(lead.purchased_at)} for{" "}
                            {lead.price_fixas.toLocaleString()} FIXAs
                          </p>
                        </div>
                        <Link
                          href={`/requests/${request.public_slug}`}
                          className="button button-primary"
                        >
                          Open job
                        </Link>
                      </div>
                    </article>
                  );
                })}

                {leads.length === 0 ? (
                  <div className="card-flat">
                    <h3>No purchased leads yet</h3>
                    <p>Browse open requests and unlock your first lead.</p>
                    <Link href="/requests" className="button button-primary">
                      Browse leads
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
