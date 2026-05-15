import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AutoSubmitCountrySelect from "@/app/requests/AutoSubmitCountrySelect";
import PublicPageShell from "@/components/PublicPageShell";
import {
  getRequestPublicPath,
  getRequestsPath,
} from "@/lib/routes/marketplace";
import {
  categories,
  getCategoryBySlug,
  getSubcategoryBySlug,
} from "@/lib/services";
import {
  getAllCountryCodes,
  getAllMarketsByCountry,
  getMarketBySlug,
  getSeoRelationMarkets,
} from "@/lib/geo";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

type ServiceRequest = {
  public_slug: string;
  category_slug: string;
  subcategory_slug: string | null;
  market_slug: string;
  country_code: string | null;
  city: string;
  state: string;
  public_description: string;
  status: string;
  lead_status: string;
  lead_price_credits: number;
  lead_price_fixas: number | null;
  purchase_count: number;
  max_purchases: number;
  created_at: string;
};

type RequestsPageProps = {
  params: Promise<{
    country: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type Filters = {
  country: string;
  market: string;
  citySearch: string;
  nearby: boolean;
  categories: string[];
  date: string;
  competition: string;
  sort: string;
  page: number;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const countryLabels: Record<string, string> = {
  us: "United States",
  ca: "Canada",
  gb: "United Kingdom",
  au: "Australia",
  nz: "New Zealand",
};

export async function generateMetadata({ params }: RequestsPageProps) {
  const { country } = await params;
  const normalizedCountry = normalizeCountry(country);

  if (!normalizedCountry) {
    return {};
  }

  const countryName =
    countryLabels[normalizedCountry] ?? normalizedCountry.toUpperCase();

  return {
    title: `Open Home Service Leads in ${countryName} | Fixly`,
    description: `Browse open home service requests in ${countryName}. Find available homeowner jobs by city, category, date, and competition level.`,
    alternates: {
      canonical: getRequestsPath(normalizedCountry),
    },
  };
}

function getAllMarketsForRequests(country: string) {
  return getAllMarketsByCountry(country);
}

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getParamArray(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];

  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function getPage(value: string) {
  const page = Number.parseInt(value, 10);

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return page;
}

function normalizeCountry(country: string) {
  const normalized = country.trim().toLowerCase();
  const allowedCountries = getAllCountryCodes();

  if (!normalized || !allowedCountries.includes(normalized)) {
    return "";
  }

  return normalized;
}

function getFilters(
  params: Record<string, string | string[] | undefined>,
  country: string
): Filters {
  const citySearch = getParam(params, "citySearch");
  const marketParam = getParam(params, "market");

  const markets = getAllMarketsForRequests(country);

  const marketFromSearch = citySearch
    ? markets.find(
        (market) =>
          `${market.city}, ${market.state}`.toLowerCase() ===
          citySearch.trim().toLowerCase()
      )
    : null;

  const marketFromParam = marketParam ? getMarketBySlug(marketParam) : null;

  const safeMarket =
    marketFromSearch?.slug ||
    (marketFromParam && marketFromParam.countryCode.toLowerCase() === country
      ? marketFromParam.slug
      : "");

  return {
    country,
    market: safeMarket,
    citySearch,
    nearby: getParam(params, "nearby") === "on",
    categories: getParamArray(params, "category"),
    date: getParam(params, "date"),
    competition: getParam(params, "competition"),
    sort: getParam(params, "sort") || "newest",
    page: getPage(getParam(params, "page")),
  };
}

function trimText(value: string, maxLength = 190) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

function formatPostedDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDateStart(date: string) {
  const now = new Date();

  if (date === "24h") {
    now.setDate(now.getDate() - 1);
    return now.toISOString();
  }

  if (date === "3d") {
    now.setDate(now.getDate() - 3);
    return now.toISOString();
  }

  if (date === "7d") {
    now.setDate(now.getDate() - 7);
    return now.toISOString();
  }

  return "";
}

function getCompetitionLabel(purchaseCount: number, maxPurchases: number) {
  if (purchaseCount <= 1) {
    return "Low competition";
  }

  if (purchaseCount >= maxPurchases - 1) {
    return "Almost sold out";
  }

  return "Active";
}

function getLeadStatusBadgeClass(purchaseCount: number, maxPurchases: number) {
  if (purchaseCount >= maxPurchases - 1) {
    return "badge badge-warning";
  }

  return "badge badge-success";
}

function getLeadPriceFixas(request: ServiceRequest) {
  return request.lead_price_fixas ?? request.lead_price_credits ?? 0;
}

function getFilteredMarketSlugs(filters: Filters) {
  if (!filters.market) {
    return [];
  }

  const selectedMarket = getMarketBySlug(filters.market);

  if (!selectedMarket) {
    return [];
  }

  if (selectedMarket.countryCode.toLowerCase() !== filters.country) {
    return [];
  }

  if (!filters.nearby) {
    return [selectedMarket.slug];
  }

  const nearbySlugs = getSeoRelationMarkets(selectedMarket.slug).nearbyMarkets
    .filter((market) => market.countryCode.toLowerCase() === filters.country)
    .map((market) => market.slug);

  return [selectedMarket.slug, ...nearbySlugs];
}

function buildPageHref(
  params: Record<string, string | string[] | undefined>,
  page: number,
  country: string
) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (key === "page" || key === "country") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) {
          search.append(key, item);
        }
      });

      return;
    }

    if (value) {
      search.set(key, value);
    }
  });

  search.set("page", String(page));

  return `${getRequestsPath(country)}?${search.toString()}`;
}

export default async function RequestsPage({
  params,
  searchParams,
}: RequestsPageProps) {
  const { country } = await params;
  const normalizedCountry = normalizeCountry(country);

  if (!normalizedCountry) {
    notFound();
  }

  const resolvedParams = (await searchParams) ?? {};
  const filters = getFilters(resolvedParams, normalizedCountry);

  const countryCodes = getAllCountryCodes();
  const markets = getAllMarketsForRequests(filters.country);
  const serviceCategories = Object.values(categories);

  const marketSlugs = getFilteredMarketSlugs(filters);
  const dateStart = getDateStart(filters.date);

  const from = (filters.page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("service_requests")
    .select(
      "public_slug, category_slug, subcategory_slug, market_slug, country_code, city, state, public_description, status, lead_status, lead_price_credits, lead_price_fixas, purchase_count, max_purchases, created_at",
      { count: "exact" }
    )
    .eq("status", "open")
    .eq("lead_status", "available")
    .eq("country_code", filters.country);

  if (marketSlugs.length > 0) {
    query = query.in("market_slug", marketSlugs);
  }

  if (filters.categories.length > 0) {
    query = query.in("category_slug", filters.categories);
  }

  if (dateStart) {
    query = query.gte("created_at", dateStart);
  }

  if (filters.competition === "low") {
    query = query.lte("purchase_count", 1);
  }

  if (filters.competition === "medium") {
    query = query.gte("purchase_count", 2).lte("purchase_count", 3);
  }

  if (filters.competition === "almost-sold-out") {
    query = query.gte("purchase_count", 4);
  }

  if (filters.sort === "competition") {
    query = query.order("purchase_count", { ascending: true });
  } else if (filters.sort === "price-high") {
    query = query.order("lead_price_fixas", { ascending: false });
  } else if (filters.sort === "price-low") {
    query = query.order("lead_price_fixas", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: requests, count } = await query.range(from, to);

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const countryName =
    countryLabels[filters.country] ?? filters.country.toUpperCase();

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Requests" },
  ];

  return (
    <PublicPageShell breadcrumbs={breadcrumbs}>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly Marketplace</p>
            <h1>Open home service leads in {countryName}</h1>
            <p className="hero-text">
              Browse public homeowner requests in {countryName}. Contact details
              stay private until a pro unlocks the lead.
            </p>

            <div className="flex gap-sm">
              <Link href="/book" className="button button-primary">
                Post a request
              </Link>
              <Link href="/services" className="button button-secondary">
                Browse services
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="marketplace-layout">
              <aside className="marketplace-sidebar">
                <form method="GET" className="card marketplace-filter-card">
                  <div>
                    <p className="eyebrow">Filters</p>
                    <h2>Find leads</h2>
                  </div>

                  <div className="marketplace-filter-group">
                    <h3>Country</h3>

                    <AutoSubmitCountrySelect
                      value={filters.country}
                      countries={countryCodes.map((code) => ({
                        code,
                        label: countryLabels[code] ?? code.toUpperCase(),
                      }))}
                    />
                  </div>

                  <div className="marketplace-filter-group">
                    <h3>City</h3>

                    <label className="filter-control">
                      <input
                        className="form-input"
                        list="market-options"
                        name="citySearch"
                        placeholder="Start typing city..."
                        defaultValue={filters.citySearch}
                      />

                      <datalist id="market-options">
                        {markets.map((market) => (
                          <option
                            key={market.slug}
                            value={`${market.city}, ${market.state}`}
                          />
                        ))}
                      </datalist>
                    </label>

                    <input type="hidden" name="market" value={filters.market} />

                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        name="nearby"
                        defaultChecked={filters.nearby}
                      />
                      <span>Include nearby cities</span>
                    </label>
                  </div>

                  <div className="marketplace-filter-group">
                    <h3>Category</h3>

                    <div className="filter-list">
                      {serviceCategories.slice(0, 16).map((category) => (
                        <label key={category.slug} className="filter-checkbox">
                          <input
                            type="checkbox"
                            name="category"
                            value={category.slug}
                            defaultChecked={filters.categories.includes(
                              category.slug
                            )}
                          />
                          <span>{category.shortTitle}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="marketplace-filter-group">
                    <h3>Date posted</h3>

                    <div className="filter-list">
                      <label className="filter-checkbox">
                        <input
                          type="radio"
                          name="date"
                          value="24h"
                          defaultChecked={filters.date === "24h"}
                        />
                        <span>Last 24 hours</span>
                      </label>

                      <label className="filter-checkbox">
                        <input
                          type="radio"
                          name="date"
                          value="3d"
                          defaultChecked={filters.date === "3d"}
                        />
                        <span>Last 3 days</span>
                      </label>

                      <label className="filter-checkbox">
                        <input
                          type="radio"
                          name="date"
                          value="7d"
                          defaultChecked={filters.date === "7d"}
                        />
                        <span>Last 7 days</span>
                      </label>
                    </div>
                  </div>

                  <div className="marketplace-filter-group">
                    <h3>Competition</h3>

                    <div className="filter-list">
                      <label className="filter-checkbox">
                        <input
                          type="radio"
                          name="competition"
                          value="low"
                          defaultChecked={filters.competition === "low"}
                        />
                        <span>0–1 pros</span>
                      </label>

                      <label className="filter-checkbox">
                        <input
                          type="radio"
                          name="competition"
                          value="medium"
                          defaultChecked={filters.competition === "medium"}
                        />
                        <span>2–3 pros</span>
                      </label>

                      <label className="filter-checkbox">
                        <input
                          type="radio"
                          name="competition"
                          value="almost-sold-out"
                          defaultChecked={
                            filters.competition === "almost-sold-out"
                          }
                        />
                        <span>Almost sold out</span>
                      </label>
                    </div>
                  </div>

                  <input type="hidden" name="sort" value={filters.sort} />

                  <div className="marketplace-filter-actions">
                    <button type="submit" className="button button-primary">
                      Apply filters
                    </button>

                    <Link
                      href={getRequestsPath(filters.country)}
                      className="button button-secondary"
                    >
                      Clear
                    </Link>
                  </div>
                </form>
              </aside>

              <div className="marketplace-results">
                <div className="marketplace-results-header">
                  <div>
                    <p className="eyebrow">Available leads</p>
                    <h2>{totalCount.toLocaleString()} open requests</h2>
                    <p>
                      Showing {(requests ?? []).length.toLocaleString()} on page{" "}
                      {filters.page} of {totalPages}
                    </p>
                  </div>

                  <form method="GET" className="marketplace-sort">
                    {filters.market && (
                      <input
                        type="hidden"
                        name="market"
                        value={filters.market}
                      />
                    )}

                    {filters.citySearch && (
                      <input
                        type="hidden"
                        name="citySearch"
                        value={filters.citySearch}
                      />
                    )}

                    {filters.nearby && (
                      <input type="hidden" name="nearby" value="on" />
                    )}

                    {filters.categories.map((category) => (
                      <input
                        key={category}
                        type="hidden"
                        name="category"
                        value={category}
                      />
                    ))}

                    {filters.date && (
                      <input type="hidden" name="date" value={filters.date} />
                    )}

                    {filters.competition && (
                      <input
                        type="hidden"
                        name="competition"
                        value={filters.competition}
                      />
                    )}

                    <label className="marketplace-sort-control">
                      <span>Sort by</span>
                      <select
                        className="form-input"
                        name="sort"
                        defaultValue={filters.sort}
                      >
                        <option value="newest">Newest</option>
                        <option value="competition">Lowest competition</option>
                        <option value="price-high">Highest price</option>
                        <option value="price-low">Lowest price</option>
                      </select>
                    </label>

                    <button type="submit" className="button button-secondary">
                      Apply
                    </button>
                  </form>
                </div>

                <div className="lead-list">
                  {(requests ?? []).map((request: ServiceRequest) => {
                    const category = getCategoryBySlug(request.category_slug);
                    const subcategory = request.subcategory_slug
                      ? getSubcategoryBySlug(request.subcategory_slug)
                      : null;

                    const title =
                      subcategory?.title ??
                      category?.title ??
                      "Home Service Request";

                    const competitionLabel = getCompetitionLabel(
                      request.purchase_count,
                      request.max_purchases
                    );

                    const leadPriceFixas = getLeadPriceFixas(request);
                    const requestCountry =
                      request.country_code || filters.country;

                    return (
                      <article
                        key={request.public_slug}
                        className="lead-row card"
                      >
                        <div className="lead-row-main">
                          <div className="lead-row-top">
                            <div>
                              <p className="eyebrow">
                                {category?.shortTitle ?? request.category_slug}
                                {subcategory
                                  ? ` · ${subcategory.shortTitle}`
                                  : ""}
                              </p>

                              <h3>{title}</h3>
                            </div>

                            <span
                              className={getLeadStatusBadgeClass(
                                request.purchase_count,
                                request.max_purchases
                              )}
                            >
                              {competitionLabel}
                            </span>
                          </div>

                          <p>{trimText(request.public_description)}</p>

                          <div className="lead-row-meta">
                            <span>
                              {request.city}, {request.state}
                            </span>
                            <span>{leadPriceFixas.toLocaleString()} FIXAs</span>
                            <span>
                              {request.purchase_count}/{request.max_purchases}{" "}
                              pros purchased
                            </span>
                            <span>
                              Posted {formatPostedDate(request.created_at)}
                            </span>
                          </div>
                        </div>

                        <div className="lead-row-actions">
                          <Link
                            href={getRequestPublicPath(
                              request.public_slug,
                              requestCountry
                            )}
                            className="button button-primary"
                          >
                            View job
                          </Link>
                        </div>
                      </article>
                    );
                  })}

                  {(!requests || requests.length === 0) && (
                    <div className="card">
                      <h2>No matching requests</h2>
                      <p>Try clearing filters or selecting a wider area.</p>
                      <Link
                        href={getRequestsPath(filters.country)}
                        className="button button-primary"
                      >
                        Clear filters
                      </Link>
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="marketplace-pagination">
                    {filters.page > 1 && (
                      <Link
                        href={buildPageHref(
                          resolvedParams,
                          filters.page - 1,
                          filters.country
                        )}
                        className="button button-secondary"
                      >
                        Previous
                      </Link>
                    )}

                    {filters.page < totalPages && (
                      <Link
                        href={buildPageHref(
                          resolvedParams,
                          filters.page + 1,
                          filters.country
                        )}
                        className="button button-primary"
                      >
                        Next page
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}