import Link from "next/link";
import { notFound } from "next/navigation";
import PublicPageShell from "@/components/PublicPageShell";
import {
  getAllCountryCodes,
getAllMarketsByCountry,
  getLevel1Name,
  getLevel1Slug,
  getMarketUrlPath,
  type Market,
} from "@/lib/geo";
import {
  categories,
  getCategoryBySlug,
  type Category,
} from "@/lib/services/categories";
import {
  getBreadcrumbJsonLd,
  getJsonLdScriptProps,
  type JsonLdObject,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{
    country: string;
    region: string;
  }>;
};

type Level1Group = {
  country: string;
  level1: string;
  level1Name: string;
  markets: Market[];
};

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

function getCountryMarkets(country: string) {
  return getAllMarketsByCountry(country).filter(
    (market) => market.countryCode.toLowerCase() === country.toLowerCase()
  );
}

function getLevel1Group(country: string, region: string): Level1Group | null {
  const normalizedCountry = country.toLowerCase();
  const normalizedRegion = region.toLowerCase();

  const markets = getAllMarketsByCountry(country).filter(
    (market) =>
      market.countryCode.toLowerCase() === normalizedCountry &&
      getLevel1Slug(market) === normalizedRegion
  );

  if (markets.length === 0) {
    return null;
  }

  return {
    country: normalizedCountry,
    level1: normalizedRegion,
    level1Name: getLevel1Name(markets[0]),
    markets,
  };
}

function getCountryCategory(country: string, region: string) {
  const category = getCategoryBySlug(region);
  const markets = getCountryMarkets(country);

  if (!category || markets.length === 0) {
    return null;
  }

  return {
    country: country.toLowerCase(),
    category,
    markets,
  };
}

export async function generateStaticParams() {
  const unique = new Map<string, { country: string; region: string }>();

  for (const country of getAllCountryCodes()) {
    for (const market of getAllMarketsByCountry(country)) {
      const normalizedCountry = market.countryCode.toLowerCase();
      const region = getLevel1Slug(market);

      unique.set(`${normalizedCountry}-${region}`, {
        country: normalizedCountry,
        region,
      });

      for (const category of Object.values(categories)) {
        unique.set(`${normalizedCountry}-${category.slug}`, {
          country: normalizedCountry,
          region: category.slug,
        });
      }
    }
  }

  return Array.from(unique.values());
}

export async function generateMetadata({ params }: PageProps) {
  const { country, region } = await params;

  const countryCategory = getCountryCategory(country, region);

  if (countryCategory) {
    const { category } = countryCategory;

    return {
      title: `${category.title} in ${country.toUpperCase()} | Fixly`,
      description: `Browse ${category.title.toLowerCase()} across local markets in ${country.toUpperCase()}. Find nearby service areas and submit a request on Fixly.`,
      alternates: {
        canonical: `/${country}/${category.slug}`,
      },
    };
  }

  const level1Group = getLevel1Group(country, region);

  if (!level1Group) {
    return {
      title: "Page Not Found | Fixly",
    };
  }

  return {
    title: `Home Services in ${level1Group.level1Name} | Fixly`,
    description: `Browse local home services, contractors, and service categories across ${level1Group.level1Name}.`,
    alternates: {
      canonical: `/${country}/${region}`,
    },
  };
}

function CountryCategoryPage({
  country,
  category,
  markets,
}: {
  country: string;
  category: Category;
  markets: Market[];
}) {
  const popularMarkets = [...markets]
    .sort((a, b) => a.city.localeCompare(b.city))
    .slice(0, 120);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: country.toUpperCase(), href: `/${country}` },
    { label: category.title },
  ];

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: country.toUpperCase(), url: `/${country}` },
    { name: category.title, url: `/${country}/${category.slug}` },
  ]);

  return (
    <PublicPageShell breadcrumbs={breadcrumbs}>
      <JsonLdScript data={breadcrumbJsonLd} />

      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly service directory</p>

            <h1>
              {category.title} in {country.toUpperCase()}
            </h1>

            <p className="hero-text">
              Browse local {category.title.toLowerCase()} by city, compare
              service areas, and submit a request to connect with nearby pros.
            </p>

            <div className="flex gap-md">
              <Link href="/book" className="button button-primary">
                Request service
              </Link>

              <Link href="/services" className="button button-secondary">
                Browse all services
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Popular cities for {category.shortTitle.toLowerCase()}</h2>

            <div className="grid-4">
              {popularMarkets.map((market) => (
                <Link
                  key={market.slug}
                  href={`${getMarketUrlPath(market)}/${category.slug}`}
                  className="card card-hover"
                >
                  <h3>
                    {market.city}, {market.state}
                  </h3>

                  <p>
                    Find {category.shortTitle.toLowerCase()} in {market.city}.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="card">
              <h2>About {category.title.toLowerCase()}</h2>
              <p>{category.description}</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container flex-center">
            <div className="card service-cta-card">
              <h2>Need {category.shortTitle.toLowerCase()}?</h2>

              <p>
                Post your request and let local pros review the job details.
              </p>

              <Link href="/book" className="button button-primary">
                Start request
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}

function Level1Page({
  country,
  region,
  level1Group,
}: {
  country: string;
  region: string;
  level1Group: Level1Group;
}) {
  const cityMarkets = [...level1Group.markets]
    .sort((a, b) => a.city.localeCompare(b.city))
    .slice(0, 120);

  const popularCategories = Object.values(categories).slice(0, 18);

  const breadcrumbs = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: level1Group.level1Name,
    },
  ];

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    {
      name: "Home",
      url: "/",
    },
    {
      name: level1Group.level1Name,
      url: `/${country}/${region}`,
    },
  ]);

  return (
    <PublicPageShell breadcrumbs={breadcrumbs}>
      <JsonLdScript data={breadcrumbJsonLd} />

      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly Area Directory</p>

            <h1>Home Services in {level1Group.level1Name}</h1>

            <p className="hero-text">
              Browse cities, local contractors, service categories, and home
              service requests across {level1Group.level1Name}.
            </p>

            <div className="flex gap-md">
              <Link href="/services" className="button button-primary">
                Browse services
              </Link>

              <Link href="/requests" className="button button-secondary">
                Browse requests
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Popular home service categories in {level1Group.level1Name}</h2>

            <div className="grid-3">
              {popularCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/${country}/${category.slug}`}
                  className="card card-hover"
                >
                  <h3>{category.shortTitle}</h3>
                  <p>{category.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Cities in {level1Group.level1Name}</h2>

            <div className="grid-4">
              {cityMarkets.map((market) => (
                <Link
                  key={market.slug}
                  href={getMarketUrlPath(market)}
                  className="card card-hover"
                >
                  <h3>{market.city}</h3>
                  <p>{market.region}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container flex-center">
            <div className="card service-cta-card">
              <h2>Need help in {level1Group.level1Name}?</h2>

              <p>
                Submit a request and connect with local service professionals
                near you.
              </p>

              <Link href="/book" className="button button-primary">
                Post a request
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}

export default async function RegionOrCountryCategoryPage({
  params,
}: PageProps) {
  const { country, region } = await params;

  const countryCategory = getCountryCategory(country, region);

  if (countryCategory) {
    return (
      <CountryCategoryPage
        country={countryCategory.country}
        category={countryCategory.category}
        markets={countryCategory.markets}
      />
    );
  }

  const level1Group = getLevel1Group(country, region);

  if (!level1Group) {
    notFound();
  }

  return (
    <Level1Page
      country={country.toLowerCase()}
      region={region.toLowerCase()}
      level1Group={level1Group}
    />
  );
}