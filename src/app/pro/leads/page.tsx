export const dynamic = "force-dynamic";

import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import PublicPageShell from "@/components/PublicPageShell";
import {
  getCategoryLabels,
  getProCompletion,
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
  title: "Open Jobs | Fixly Pro",
  robots: {
    index: false,
    follow: false,
  },
};

type ProLeadsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type LeadOpportunity = MatchableLeadRequest & {
  id: string;
  public_description: string;
  lead_price_fixas: number;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

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

function getFilterHref(filter: string) {
  return filter === "best" ? "/pro/leads" : `/pro/leads?filter=${filter}`;
}

function isProfileMatchReady(profile: PublicProProfile | null) {
  if (!profile) return false;
  return (
    getProServiceAreaSlugs(profile).length > 0 &&
    (profile.service_categories?.length ?? 0) > 0
  );
}

export default async function ProLeadsPage({ searchParams }: ProLeadsPageProps) {
  const userId = await getCurrentUserId();
  const params = (await searchParams) ?? {};
  const filter = getParam(params, "filter") || "best";

  if (!userId) {
    return (
      <PublicPageShell>
        <main className="page">
          <section className="section">
            <div className="container-narrow card">
              <h1>Pro login required</h1>
              <p>Please log in to view open jobs for pros.</p>
              <Link
                href="/login?intent=pro&next=/pro/leads"
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

  const [
    { data: profileData },
    { data: fixaAccount },
    { count: purchasedCount },
    { data: purchasedRows },
  ] = await Promise.all([
    admin
      .from("pro_profiles")
      .select(PUBLIC_PRO_PROFILE_SELECT)
      .eq("user_id", userId)
      .maybeSingle(),
    admin
      .from("user_fixa_accounts")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle(),
    admin
      .from("pro_lead_access")
      .select("id", { count: "exact", head: true })
      .eq("pro_user_id", userId),
    admin
      .from("pro_lead_access")
      .select("request_id")
      .eq("pro_user_id", userId),
  ]);

  const profile = profileData
    ? normalizePublicProProfile(profileData as PublicProProfile)
    : null;
  const completion = profile ? getProCompletion(profile) : null;
  const serviceCategories = profile?.service_categories ?? [];
  const serviceAreas = profile ? getProServiceAreaSlugs(profile) : [];
  const purchasedRequestIds = new Set(
    ((purchasedRows ?? []) as { request_id: string }[]).map((row) => row.request_id)
  );
  const profileReady = isProfileMatchReady(profile);

  let query = admin
    .from("service_requests")
    .select(
      "id, public_slug, category_slug, subcategory_slug, market_slug, city, state, public_description, status, lead_status, lead_price_fixas, purchase_count, max_purchases, created_at"
    )
    .eq("status", "open")
    .eq("lead_status", "available")
    .order("created_at", { ascending: false })
    .limit(120);

  if (serviceAreas.length > 0) {
    query = query.in("market_slug", serviceAreas);
  }

  if (serviceCategories.length > 0) {
    query = query.in("category_slug", serviceCategories);
  }

  const { data } = await query;
  const matched = ((data ?? []) as LeadOpportunity[])
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
    .filter(({ match }) => match.serviceAreaMatch && match.categoryMatch);

  const filtered =
    filter === "low-competition"
      ? matched.filter(({ request }) => request.purchase_count <= 1)
      : filter === "exact-subcategory"
        ? matched.filter(({ match }) => match.subcategoryMatch)
        : filter === "nearby"
          ? matched.filter(({ match }) => match.serviceAreaMatch)
          : matched;

  const opportunities = sortMatchedLeads(filtered, filter).slice(0, 60);
  const categoryLabels = profile ? getCategoryLabels(profile) : [];
  const subcategoryLabels = profile ? getSubcategoryLabels(profile) : [];
  const areaLinks = profile ? getPublicProAreaLinks(profile) : [];
  const filterItems = [
    ["best", "Best matches"],
    ["newest", "Newest"],
    ["low-competition", "Low competition"],
    ["exact-subcategory", "Exact service match"],
    ["nearby", "Nearby only"],
  ];

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly Pro</p>
            <h1>Matched open jobs</h1>
            <p className="hero-text">
              Jobs are scored against your service area, categories, specific
              services, request freshness, competition, and verification status.
            </p>
            <div className="flex gap-md">
              <Link href="/pro/profile" className="button button-primary">
                Edit matching profile
              </Link>
              <Link
                href="/pro/leads/purchased"
                className="button button-secondary"
              >
                Purchased leads
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-3">
            <div className="card">
              <p className="eyebrow">Matched leads</p>
              <h2>{opportunities.length}</h2>
              <p>Open, available, not-yet-unlocked jobs matching your profile.</p>
            </div>

            <div className="card">
              <p className="eyebrow">FIXA balance</p>
              <h2>{(fixaAccount?.balance ?? 0).toLocaleString()} FIXAs</h2>
              <p>Keep a balance available so you can unlock strong matches.</p>
              <Link href="/account/fixa" className="button button-secondary">
                Manage FIXAs
              </Link>
            </div>

            <div className="card">
              <p className="eyebrow">Purchased leads</p>
              <h2>{purchasedCount ?? 0}</h2>
              <p>Already unlocked leads stay in the purchased section.</p>
              <Link
                href="/pro/leads/purchased"
                className="button button-secondary"
              >
                View purchased
              </Link>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-2">
            <div className="card">
              <h2>Matching profile</h2>
              <p>
                Profile completion:{" "}
                <strong>{completion ? `${completion.score}%` : "0%"}</strong>
              </p>
              <p>
                Services:{" "}
                {categoryLabels.length > 0
                  ? categoryLabels.join(", ")
                  : "not set yet"}
              </p>
              <p>
                Specific services:{" "}
                {subcategoryLabels.length > 0
                  ? subcategoryLabels.slice(0, 8).join(", ")
                  : "not set yet"}
              </p>
              <p>
                Areas:{" "}
                {areaLinks.length > 0
                  ? areaLinks
                      .slice(0, 8)
                      .map((area) => area.title)
                      .join(", ")
                  : "not set yet"}
              </p>
            </div>

            <div className="card">
              <h2>Filters</h2>
              <div className="flex gap-sm">
                {filterItems.map(([value, label]) => (
                  <Link
                    key={value}
                    href={getFilterHref(value)}
                    className={
                      filter === value || (!filter && value === "best")
                        ? "button button-primary"
                        : "button button-secondary"
                    }
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Matched jobs</h2>
            <div className="lead-list">
              {!profileReady ? (
                <div className="card">
                  <h2>Complete your profile to see better-matched leads.</h2>
                  <p>
                    Add your hometown, service radius, categories, and specific
                    services so Fixly can match jobs to your coverage.
                  </p>
                  <Link href="/pro/profile" className="button button-primary">
                    Complete profile
                  </Link>
                </div>
              ) : null}

              {opportunities.map(({ request, match }) => (
                <article key={request.public_slug} className="card">
                  <div className="flex-between gap-md">
                    <div>
                      <p className="eyebrow">
                        {request.category_slug} · {request.city},{" "}
                        {request.state}
                      </p>
                      <h3>{match.percentage}% match</h3>
                      <p>{request.public_description}</p>
                      <div className="lead-row-meta">
                        <span>{match.subcategoryMatch ? "Exact service match" : "Category match"}</span>
                        <span>{match.freshnessLabel}</span>
                        <span>{match.competitionLabel}</span>
                        <span>{request.lead_price_fixas.toLocaleString()} FIXAs</span>
                      </div>
                      <ul className="service-list">
                        {match.reasons.slice(0, 5).map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                    <Link
                      href={`/requests/${request.public_slug}`}
                      className="button button-primary"
                    >
                      Review and unlock
                    </Link>
                  </div>
                </article>
              ))}

              {profileReady && opportunities.length === 0 ? (
                <div className="card">
                  <h2>No matching open jobs right now</h2>
                  <p>
                    Your filters or profile settings may be narrow. Adjust your
                    service area, add more categories, or check back as new
                    requests arrive.
                  </p>
                  <Link href="/pro/profile" className="button button-primary">
                    Update profile
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
