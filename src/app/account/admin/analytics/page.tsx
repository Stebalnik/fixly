import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import PublicPageShell from "@/components/PublicPageShell";
import { requireAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getMarketBySlug } from "@/lib/geo";

export const dynamic = "force-dynamic";

type CountMap = Record<string, number>;

type CustomerProfileRow = {
  user_id: string;
  created_at: string | null;
};

type ProProfileRow = {
  user_id: string;
  status: string | null;
  created_at: string | null;
  home_market_slug: string | null;
  service_areas: string[] | null;
};

type ServiceRequestRow = {
  id: string;
  customer_user_id: string | null;
  country_code: string | null;
  state: string | null;
  market_slug: string | null;
  category_slug: string | null;
  customer_flow: string | null;
  is_seeded: boolean | null;
  status: string | null;
  lead_status: string | null;
  created_at: string | null;
};

type CheckoutAttemptRow = {
  status: string | null;
  checkout_source: string | null;
  amount_total: number | null;
  created_at: string | null;
  stripe_created_at: string | null;
};

type PlatformEventRow = {
  event_name: string;
  event_group: string;
  actor_user_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  country_code: string | null;
  state: string | null;
  market_slug: string | null;
  category_slug: string | null;
  created_at: string;
};

type LeadAccessRow = {
  price_fixas: number | null;
  created_at: string | null;
  purchased_at: string | null;
};

type MaterialListingRow = {
  status: string | null;
  state: string | null;
  created_at: string | null;
};

type AuthUserSummary = {
  id: string;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
};

export default async function AdminAnalyticsPage() {
  await requireAdminUser();

  const admin = createSupabaseAdminClient();
  const since7 = daysAgo(7);
  const since30 = daysAgo(30);

  const [
    authUsers,
    customerProfilesResult,
    proProfilesResult,
    serviceRequestsResult,
    checkoutAttemptsResult,
    platformEventsResult,
    recentEventsResult,
    leadAccessResult,
    materialListingsResult,
    conversationsCountResult,
    messagesCountResult,
  ] = await Promise.all([
    listAllAuthUsers(),
    admin.from("customer_profiles").select("user_id, created_at"),
    admin
      .from("pro_profiles")
      .select("user_id, status, created_at, home_market_slug, service_areas"),
    admin
      .from("service_requests")
      .select(
        "id, customer_user_id, country_code, state, market_slug, category_slug, customer_flow, is_seeded, status, lead_status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(10000),
    admin
      .from("payment_checkout_attempts")
      .select("status, checkout_source, amount_total, created_at, stripe_created_at")
      .order("created_at", { ascending: false })
      .limit(10000),
    admin
      .from("platform_events")
      .select(
        "event_name, event_group, actor_user_id, entity_type, entity_id, country_code, state, market_slug, category_slug, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(10000),
    admin
      .from("platform_events")
      .select(
        "event_name, event_group, actor_user_id, entity_type, entity_id, country_code, state, market_slug, category_slug, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(60),
    admin
      .from("pro_lead_access")
      .select("price_fixas, created_at, purchased_at")
      .order("created_at", { ascending: false })
      .limit(10000),
    admin
      .from("material_listings")
      .select("status, state, created_at")
      .order("created_at", { ascending: false })
      .limit(10000),
    admin.from("conversations").select("id", { count: "exact", head: true }),
    admin.from("messages").select("id", { count: "exact", head: true }),
  ]);

  const customerProfiles =
    (customerProfilesResult.data ?? []) as CustomerProfileRow[];
  const proProfiles = (proProfilesResult.data ?? []) as ProProfileRow[];
  const serviceRequests =
    (serviceRequestsResult.data ?? []) as ServiceRequestRow[];
  const checkoutAttempts =
    (checkoutAttemptsResult.data ?? []) as CheckoutAttemptRow[];
  const platformEvents = (platformEventsResult.data ?? []) as PlatformEventRow[];
  const recentEvents = (recentEventsResult.data ?? []) as PlatformEventRow[];
  const leadAccess = (leadAccessResult.data ?? []) as LeadAccessRow[];
  const materialListings =
    (materialListingsResult.data ?? []) as MaterialListingRow[];

  const customerUserIds = new Set(customerProfiles.map((item) => item.user_id));
  const proUserIds = new Set(proProfiles.map((item) => item.user_id));
  const bothRoleCount = countIntersection(customerUserIds, proUserIds);
  const activePros = proProfiles.filter((item) => item.status === "active");
  const createdUsers7 = authUsers.filter((user) =>
    isSince(user.created_at, since7)
  ).length;
  const createdUsers30 = authUsers.filter((user) =>
    isSince(user.created_at, since30)
  ).length;

  const realRequests = serviceRequests.filter((item) => !isAiSeededRequest(item));
  const aiSeededRequests = serviceRequests.filter(isAiSeededRequest);
  const realRequests30 = realRequests.filter((item) =>
    isSince(item.created_at, since30)
  );
  const realRequests7 = realRequests.filter((item) =>
    isSince(item.created_at, since7)
  );

  const completedCheckouts = checkoutAttempts.filter(
    (item) => item.status === "completed"
  );
  const expiredCheckouts = checkoutAttempts.filter(
    (item) => item.status === "expired"
  );
  const openCheckouts = checkoutAttempts.filter(
    (item) => item.status === "created"
  );
  const checkoutRevenueCents = sumAmounts(completedCheckouts);
  const leadUnlockFixas = leadAccess.reduce(
    (sum, item) => sum + (item.price_fixas ?? 0),
    0
  );

  const customerCountryMap = deriveCustomerCountries(
    customerProfiles,
    serviceRequests
  );
  const proCountryMap = deriveProCountries(proProfiles);
  const accountCountries = mergeCountryCounts([
    { label: "customers", values: customerCountryMap },
    { label: "pros", values: proCountryMap },
  ]);

  const requestCountries = countBy(
    serviceRequests,
    (item) => normalizeCountry(item.country_code)
  );
  const eventGroups = countBy(platformEvents, (item) => item.event_group);
  const eventNames = countBy(platformEvents, (item) => item.event_name);
  const requestFlows = countBy(serviceRequests, (item) => item.customer_flow);
  const checkoutStatuses = countBy(checkoutAttempts, (item) => item.status);
  const materialStatuses = countBy(materialListings, (item) => item.status);

  return (
    <PublicPageShell
      breadcrumbs={[
        { label: "Account", href: "/account" },
        { label: "Admin Analytics" },
      ]}
    >
      <main className="page">
        <section className="section">
          <div className="container">
            <p className="eyebrow">Fixly Admin</p>
            <h1>Platform Analytics</h1>
            <p className="hero-text">
              Operational view of accounts, requests, checkout behavior, lead
              activity, messages, marketplace listings, and tracked platform
              events.
            </p>

            <div className="flex gap-sm">
              <Link
                href="/account/admin/ai-ops"
                className="button button-secondary"
              >
                AI Ops
              </Link>
              <Link href="/account" className="button button-secondary">
                Account
              </Link>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-4">
            <StatCard label="Auth users" value={authUsers.length} />
            <StatCard label="New users 7d" value={createdUsers7} />
            <StatCard label="New users 30d" value={createdUsers30} />
            <StatCard label="Both roles" value={bothRoleCount} />
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-4">
            <StatCard label="Customers" value={customerProfiles.length} />
            <StatCard label="Pros" value={proProfiles.length} />
            <StatCard label="Active pros" value={activePros.length} />
            <StatCard label="Countries" value={accountCountries.length} />
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-2">
            <Panel title="Accounts by country">
              <CountryRows rows={accountCountries} />
            </Panel>

            <Panel title="Account sources">
              <StatusList stats={countAuthMetadataRoles(authUsers)} />
            </Panel>
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-4">
            <StatCard label="Requests" value={serviceRequests.length} />
            <StatCard label="Real requests 7d" value={realRequests7.length} />
            <StatCard label="Real requests 30d" value={realRequests30.length} />
            <StatCard label="AI seeded" value={aiSeededRequests.length} />
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-3">
            <Panel title="Requests by country">
              <StatusList stats={requestCountries} />
            </Panel>

            <Panel title="Customer flow">
              <StatusList stats={requestFlows} />
            </Panel>

            <Panel title="Top request categories">
              <StatusList
                stats={countBy(serviceRequests, (item) => item.category_slug)}
              />
            </Panel>
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-4">
            <StatCard label="Checkouts" value={checkoutAttempts.length} />
            <StatCard label="Paid checkouts" value={completedCheckouts.length} />
            <StatCard label="Expired" value={expiredCheckouts.length} />
            <StatCard label="Open" value={openCheckouts.length} />
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-3">
            <Panel title="Checkout status">
              <StatusList stats={checkoutStatuses} />
            </Panel>

            <Panel title="Checkout source">
              <StatusList
                stats={countBy(
                  checkoutAttempts,
                  (item) => item.checkout_source
                )}
              />
            </Panel>

            <Panel title="Payment value">
              <MetricRows
                rows={[
                  ["Paid revenue", formatCurrency(checkoutRevenueCents)],
                  [
                    "Conversion",
                    formatPercent(
                      completedCheckouts.length,
                      checkoutAttempts.length
                    ),
                  ],
                  ["Lead unlock spend", `${leadUnlockFixas.toLocaleString()} FIXAs`],
                ]}
              />
            </Panel>
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-4">
            <StatCard label="Lead unlocks" value={leadAccess.length} />
            <StatCard
              label="Conversations"
              value={conversationsCountResult.count ?? 0}
            />
            <StatCard label="Messages" value={messagesCountResult.count ?? 0} />
            <StatCard label="Materials" value={materialListings.length} />
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-3">
            <Panel title="Event groups">
              <StatusList stats={eventGroups} />
            </Panel>

            <Panel title="Top event names">
              <StatusList stats={eventNames} />
            </Panel>

            <Panel title="Material listings">
              <StatusList stats={materialStatuses} />
            </Panel>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <Panel title="Recent platform events">
              <div className="service-seo-list">
                {recentEvents.length === 0 ? (
                  <p>No platform events recorded yet.</p>
                ) : (
                  recentEvents.map((event) => (
                    <article
                      key={`${event.created_at}-${event.event_name}-${event.entity_id}`}
                      className="card-flat"
                    >
                      <div className="flex flex-between gap-md">
                        <div>
                          <p className="eyebrow">{event.event_group}</p>
                          <h3>{event.event_name}</h3>
                        </div>
                        <span className="badge badge-primary">
                          {formatDate(event.created_at)}
                        </span>
                      </div>
                      <p>
                        {event.entity_type ?? "event"}
                        {event.entity_id ? `:${event.entity_id}` : ""} ·{" "}
                        {formatLocation(event)}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </Panel>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}

async function listAllAuthUsers() {
  const admin = createSupabaseAdminClient();
  const users: AuthUserSummary[] = [];
  let page = 1;
  const perPage = 1000;

  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      console.error("Failed to list auth users for analytics", error);
      break;
    }

    users.push(
      ...data.users.map((user: User) => ({
        id: user.id,
        created_at: user.created_at,
        user_metadata: user.user_metadata,
      }))
    );

    if (data.users.length < perPage) break;

    page += 1;
  }

  return users;
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card">
      <p className="eyebrow">{label}</p>
      <h2>{typeof value === "number" ? value.toLocaleString() : value}</h2>
    </div>
  );
}

function StatusList({ stats }: { stats: CountMap }) {
  const entries = Object.entries(stats).sort((a, b) => b[1] - a[1]).slice(0, 12);

  if (entries.length === 0) {
    return <p>No data yet.</p>;
  }

  return (
    <div className="service-seo-list">
      {entries.map(([status, count]) => (
        <div key={status} className="flex flex-between gap-md">
          <span>{status}</span>
          <strong>{count.toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
}

function CountryRows({
  rows,
}: {
  rows: Array<{ country: string; customers: number; pros: number; total: number }>;
}) {
  if (rows.length === 0) {
    return <p>No country data yet.</p>;
  }

  return (
    <div className="service-seo-list">
      {rows.slice(0, 12).map((row) => (
        <div key={row.country} className="flex flex-between gap-md">
          <span>{row.country}</span>
          <strong>
            {row.total.toLocaleString()} total ·{" "}
            {row.customers.toLocaleString()} customer ·{" "}
            {row.pros.toLocaleString()} pro
          </strong>
        </div>
      ))}
    </div>
  );
}

function MetricRows({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="service-seo-list">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-between gap-md">
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function deriveCustomerCountries(
  customers: CustomerProfileRow[],
  requests: ServiceRequestRow[]
) {
  const requestCountryByCustomer = new Map<string, string>();

  for (const request of requests) {
    if (!request.customer_user_id || !request.country_code) continue;
    if (requestCountryByCustomer.has(request.customer_user_id)) continue;

    requestCountryByCustomer.set(
      request.customer_user_id,
      normalizeCountry(request.country_code)
    );
  }

  return customers.reduce<CountMap>((acc, customer) => {
    const country = requestCountryByCustomer.get(customer.user_id) ?? "unknown";
    acc[country] = (acc[country] ?? 0) + 1;
    return acc;
  }, {});
}

function deriveProCountries(pros: ProProfileRow[]) {
  return pros.reduce<CountMap>((acc, pro) => {
    const country = getCountryForPro(pro);
    acc[country] = (acc[country] ?? 0) + 1;
    return acc;
  }, {});
}

function getCountryForPro(pro: ProProfileRow) {
  const marketSlug = pro.home_market_slug ?? pro.service_areas?.[0] ?? "";
  const market = marketSlug ? getMarketBySlug(marketSlug) : undefined;

  return normalizeCountry(market?.countryCode);
}

function mergeCountryCounts(
  groups: Array<{ label: "customers" | "pros"; values: CountMap }>
) {
  const rows = new Map<
    string,
    { country: string; customers: number; pros: number; total: number }
  >();

  for (const group of groups) {
    for (const [country, count] of Object.entries(group.values)) {
      const current =
        rows.get(country) ?? { country, customers: 0, pros: 0, total: 0 };
      current[group.label] += count;
      current.total += count;
      rows.set(country, current);
    }
  }

  return Array.from(rows.values()).sort((a, b) => b.total - a.total);
}

function countBy<T>(items: T[], getKey: (item: T) => string | null | undefined) {
  return items.reduce<CountMap>((acc, item) => {
    const key = getKey(item) || "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function countAuthMetadataRoles(users: AuthUserSummary[]) {
  return users.reduce<CountMap>((acc, user) => {
    const role =
      typeof user.user_metadata?.role === "string"
        ? user.user_metadata.role
        : "unknown";
    acc[role] = (acc[role] ?? 0) + 1;
    return acc;
  }, {});
}

function countIntersection(a: Set<string>, b: Set<string>) {
  let count = 0;

  for (const value of a) {
    if (b.has(value)) count += 1;
  }

  return count;
}

function isAiSeededRequest(request: ServiceRequestRow) {
  return request.is_seeded === true || request.customer_flow === "ai_seeded";
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function isSince(value: string | null | undefined, since: Date) {
  if (!value) return false;

  return new Date(value).getTime() >= since.getTime();
}

function normalizeCountry(value: string | null | undefined) {
  return value?.trim().toUpperCase() || "unknown";
}

function sumAmounts(rows: CheckoutAttemptRow[]) {
  return rows.reduce((sum, row) => sum + (row.amount_total ?? 0), 0);
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatPercent(part: number, total: number) {
  if (total <= 0) return "0%";

  return `${Math.round((part / total) * 100)}%`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "n/a";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatLocation(event: PlatformEventRow) {
  const parts = [
    event.country_code?.toUpperCase(),
    event.state,
    event.market_slug,
    event.category_slug,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" / ") : "no location";
}
