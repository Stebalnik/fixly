import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import { supportedCountryOptions } from "@/lib/geo/country-options";
import { categories } from "@/lib/services";
import {
  formatProJobDate,
  getProJobPath,
  getProJobServiceLabel,
  getProJobTitle,
  type ProJobRequest,
} from "@/lib/pro/jobs";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse Local Side Jobs and Temporary Work | Fixly Pro",
  description:
    "Filter open Fixly Pro jobs by location, service type, keyword, and posting date. Customer contacts stay private until a registered pro unlocks the lead.",
};

type ProJobsBrowsePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ProJobFilters = {
  keyword: string;
  country: string;
  location: string;
  categories: string[];
  date: string;
  sort: string;
  page: number;
};

const PAGE_SIZE = 60;
const serviceCategories = Object.values(categories);

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function getParamArray(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function getPositiveIntegerParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
  fallback: number
) {
  const value = Number(getParam(params, key));
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function getFilters(
  params: Record<string, string | string[] | undefined>
): ProJobFilters {
  return {
    keyword: getParam(params, "keyword"),
    country: getParam(params, "country"),
    location: getParam(params, "location"),
    categories: getParamArray(params, "category"),
    date: getParam(params, "date"),
    sort: getParam(params, "sort") || "newest",
    page: getPositiveIntegerParam(params, "page", 1),
  };
}

function escapeSupabasePattern(value: string) {
  return value.replace(/[%_,]/g, " ");
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

function trimText(value: string, maxLength = 190) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}

function appendFilterParams(params: URLSearchParams, filters: ProJobFilters) {
  if (filters.keyword) params.set("keyword", filters.keyword);
  if (filters.country) params.set("country", filters.country);
  if (filters.location) params.set("location", filters.location);
  if (filters.date) params.set("date", filters.date);
  if (filters.sort) params.set("sort", filters.sort);

  for (const category of filters.categories) {
    params.append("category", category);
  }
}

function getPaginationHref(filters: ProJobFilters, page: number) {
  const params = new URLSearchParams();
  appendFilterParams(params, filters);
  params.set("page", String(page));
  return `/jobs/browse?${params.toString()}`;
}

async function getFilteredJobs(filters: ProJobFilters) {
  const admin = createSupabaseAdminClient();
  const from = (filters.page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const keyword = escapeSupabasePattern(filters.keyword.trim());
  const location = escapeSupabasePattern(filters.location.trim());
  const dateStart = getDateStart(filters.date);

  let query = admin
    .from("service_requests")
    .select(
      "public_slug, category_slug, subcategory_slug, city, state, public_description, created_at, country_code",
      { count: "exact" }
    )
    .eq("status", "open")
    .eq("lead_status", "available")
    .not("public_slug", "is", null);

  if (filters.categories.length > 0) {
    query = query.in("category_slug", filters.categories);
  }

  if (filters.country) {
    query = query.eq("country_code", filters.country.toLowerCase());
  }

  if (keyword) {
    query = query.or(
      `public_description.ilike.%${keyword}%,category_slug.ilike.%${keyword}%,subcategory_slug.ilike.%${keyword}%`
    );
  }

  if (location) {
    query = query.or(`city.ilike.%${location}%,state.ilike.%${location}%`);
  }

  if (dateStart) {
    query = query.gte("created_at", dateStart);
  }

  query = query.order("created_at", {
    ascending: filters.sort === "oldest",
  });

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Unable to load filtered pro jobs", error);
    return { jobs: [] as ProJobRequest[], total: 0 };
  }

  return {
    jobs: (data ?? []) as ProJobRequest[],
    total: count ?? 0,
  };
}

export default async function ProJobsBrowsePage({
  searchParams,
}: ProJobsBrowsePageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const filters = getFilters(resolvedParams);
  const { jobs, total } = await getFilteredJobs(filters);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPreviousPage = filters.page > 1;
  const hasNextPage = filters.page < totalPages;
  const rangeStart = total === 0 ? 0 : (filters.page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(filters.page * PAGE_SIZE, total);

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Open Fixly Pro jobs</p>
            <h1>Browse local side jobs and temporary work</h1>
            <p className="hero-text">
              Filter real homeowner requests by location, service type, keyword,
              and posting date. Public job previews are open for discovery;
              customer contact details unlock only through a pro account.
            </p>
            <div className="flex gap-md">
              <Link href="/signup" className="button button-primary">
                Join as a pro
              </Link>
              <Link href="/jobs" className="button button-secondary">
                How Fixly Pro works
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
                    <h2>Find work</h2>
                  </div>

                  <div className="marketplace-filter-group">
                    <h3>Keyword</h3>
                    <input
                      className="form-input"
                      name="keyword"
                      placeholder="Leak, drywall, fence..."
                      defaultValue={filters.keyword}
                    />
                  </div>

                  <div className="marketplace-filter-group">
                    <h3>Location</h3>
                    <select
                      className="form-input"
                      name="country"
                      defaultValue={filters.country}
                    >
                      <option value="">All countries</option>
                      {supportedCountryOptions.map((countryOption) => (
                        <option
                          key={countryOption.code}
                          value={countryOption.code}
                        >
                          {countryOption.label}
                        </option>
                      ))}
                    </select>
                    <input
                      className="form-input"
                      name="location"
                      placeholder="City, state, or region"
                      defaultValue={filters.location}
                    />
                  </div>

                  <div className="marketplace-filter-group">
                    <h3>Type of work</h3>
                    <div className="filter-list">
                      {serviceCategories.slice(0, 18).map((category) => (
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

                  <input type="hidden" name="sort" value={filters.sort} />

                  <div className="marketplace-filter-actions">
                    <button type="submit" className="button button-primary">
                      Apply filters
                    </button>
                    <Link href="/jobs/browse" className="button button-secondary">
                      Clear
                    </Link>
                  </div>
                </form>
              </aside>

              <div className="marketplace-results">
                <div className="marketplace-results-header">
                  <div>
                    <p className="eyebrow">Available work</p>
                    <h2>{total.toLocaleString()} open jobs</h2>
                    <p>
                      Showing {rangeStart.toLocaleString()}-
                      {rangeEnd.toLocaleString()} local side jobs and temporary
                      work opportunities.
                    </p>
                  </div>

                  <form method="GET" className="marketplace-sort">
                    {filters.keyword && (
                      <input
                        type="hidden"
                        name="keyword"
                        value={filters.keyword}
                      />
                    )}
                    {filters.location && (
                      <input
                        type="hidden"
                        name="location"
                        value={filters.location}
                      />
                    )}
                    {filters.country && (
                      <input
                        type="hidden"
                        name="country"
                        value={filters.country}
                      />
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

                    <label className="marketplace-sort-control">
                      <span>Sort by</span>
                      <select
                        className="form-input"
                        name="sort"
                        defaultValue={filters.sort}
                      >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                      </select>
                    </label>
                    <button type="submit" className="button button-secondary">
                      Apply
                    </button>
                  </form>
                </div>

                <div className="lead-list">
                  {jobs.map((job) => (
                    <article key={job.public_slug} className="lead-row card">
                      <div className="lead-row-main">
                        <div className="lead-row-top">
                          <div>
                            <p className="eyebrow">
                              {getProJobServiceLabel(job)} · {job.city},{" "}
                              {job.state}
                            </p>
                            <h3>{getProJobTitle(job)}</h3>
                          </div>
                          <span className="badge badge-success">
                            Contact unlock required
                          </span>
                        </div>

                        <p>{trimText(job.public_description)}</p>

                        <div className="lead-row-meta">
                          <span>Local gig</span>
                          <span>Temporary work</span>
                          <span>Posted {formatProJobDate(job.created_at)}</span>
                        </div>
                      </div>

                      <div className="lead-row-actions">
                        <Link
                          href={getProJobPath(job.public_slug)}
                          className="button button-primary"
                        >
                          View job
                        </Link>
                      </div>
                    </article>
                  ))}

                  {jobs.length === 0 && (
                    <div className="card">
                      <h2>No matching jobs</h2>
                      <p>
                        Try clearing filters, widening the location, or checking
                        another service category.
                      </p>
                      <Link href="/jobs/browse" className="button button-primary">
                        Clear filters
                      </Link>
                    </div>
                  )}
                </div>

                {total > PAGE_SIZE && (
                  <div className="card">
                    <div className="flex gap-md">
                      {hasPreviousPage ? (
                        <Link
                          href={getPaginationHref(filters, filters.page - 1)}
                          className="button button-secondary"
                        >
                          Previous
                        </Link>
                      ) : (
                        <span className="button button-secondary">Previous</span>
                      )}

                      <span>
                        Page {filters.page.toLocaleString()} of{" "}
                        {totalPages.toLocaleString()}
                      </span>

                      {hasNextPage ? (
                        <Link
                          href={getPaginationHref(filters, filters.page + 1)}
                          className="button button-secondary"
                        >
                          Next
                        </Link>
                      ) : (
                        <span className="button button-secondary">Next</span>
                      )}
                    </div>
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
