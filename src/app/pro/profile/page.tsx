export const dynamic = "force-dynamic";

import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import PublicPageShell from "@/components/PublicPageShell";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ProProfileForm } from "@/features/pro/ProProfileForm";
import { categories, getSubcategoryBySlug, subcategories } from "@/lib/services";
import { getMarketBySlug } from "@/lib/geo";
import {
  deriveServiceAreaSlugs,
  getProCompletion,
  getProDisplayName,
  getProHomeMarket,
  getProProfileHref,
  PUBLIC_PRO_PROFILE_SELECT,
  normalizePublicProProfile,
  type PublicProProfile,
} from "@/lib/marketplace";

export const metadata = {
  title: "Edit Pro Profile | Fixly Pro",
  robots: {
    index: false,
    follow: false,
  },
};

async function getCurrentUser() {
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

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "fixly-pro"
  );
}

function parseLicenseInfo(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return [];

  return text
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((name) => ({ name }));
}

async function updateProProfile(formData: FormData) {
  "use server";

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?intent=pro&next=/pro/profile");
  }

  const companyName = String(formData.get("company_name") ?? "").trim();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const yearsExperienceRaw = String(formData.get("years_experience") ?? "").trim();
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();
  const logoUrl = String(formData.get("logo_url") ?? "").trim();
  const serviceCategories = formData
    .getAll("service_categories")
    .map((item) => String(item).trim())
    .filter(Boolean);
  const selectedCategorySet = new Set(serviceCategories);
  const serviceSubcategories = formData
    .getAll("service_subcategories")
    .map((item) => String(item).trim())
    .filter((slug) => {
      const subcategory = getSubcategoryBySlug(slug);
      return subcategory ? selectedCategorySet.has(subcategory.parentSlug) : false;
    });
  const homeMarketSlug = String(formData.get("home_market_slug") ?? "").trim();
  const serviceRadiusMiles = Number.parseInt(
    String(formData.get("service_radius_miles") ?? "15"),
    10
  );
  const derivedServiceAreaSlugs = deriveServiceAreaSlugs(
    homeMarketSlug,
    serviceRadiusMiles
  );
  const licenses = parseLicenseInfo(formData.get("licenses"));
  const yearsExperience = yearsExperienceRaw
    ? Math.max(0, Number.parseInt(yearsExperienceRaw, 10) || 0)
    : null;
  const nameForSlug = displayName || companyName || user.email || user.id;

  if (!homeMarketSlug || !getMarketBySlug(homeMarketSlug)) {
    redirect("/pro/profile?error=invalid-market");
  }

  if (derivedServiceAreaSlugs.length === 0) {
    redirect("/pro/profile?error=no-service-area");
  }

  if (serviceCategories.length === 0) {
    redirect("/pro/profile?error=missing-category");
  }

  const admin = createSupabaseAdminClient();

  await admin.from("pro_profiles").upsert(
    {
      user_id: user.id,
      company_name: companyName || displayName || "Fixly Pro",
      display_name: displayName || companyName || "Fixly Pro",
      slug: `${slugify(nameForSlug)}-${user.id.slice(0, 8)}`,
      bio: bio || null,
      years_experience: yearsExperience,
      avatar_url: avatarUrl || null,
      logo_url: logoUrl || null,
      service_categories: serviceCategories,
      service_subcategories: serviceSubcategories,
      home_market_slug: homeMarketSlug || null,
      service_radius_miles: serviceRadiusMiles,
      derived_service_area_slugs: derivedServiceAreaSlugs,
      service_areas: derivedServiceAreaSlugs,
      licenses,
      contact_email: user.email ?? null,
      email: user.email ?? null,
      status: "active",
      public_profile_enabled: true,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    }
  );

  revalidatePath("/pro");
  revalidatePath("/pro/leads");
  revalidatePath("/pro/profile");
  redirect("/pro/profile?saved=1");
}

export default async function ProProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (!user) {
    return (
      <PublicPageShell>
        <main className="page">
          <section className="section">
            <div className="container-narrow card">
              <h1>Pro login required</h1>
              <p>Please log in to edit your Fixly Pro profile.</p>
              <Link
                href="/login?intent=pro&next=/pro/profile"
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
  const { data } = await admin
    .from("pro_profiles")
    .select(PUBLIC_PRO_PROFILE_SELECT)
    .eq("user_id", user.id)
    .maybeSingle();

  const profile = data
    ? normalizePublicProProfile(data as PublicProProfile)
    : null;
  const completion = profile
    ? getProCompletion(profile)
      : {
        score: 0,
        completedFields: [],
        missingFields: ["Company name", "Bio", "Services", "Service areas"],
        nextBestAction: "Create your pro profile",
      };
  const selectedCategories = new Set(profile?.service_categories ?? []);
  const homeMarket = profile ? getProHomeMarket(profile) : null;
  const licenseText = (profile?.licenses ?? [])
    .map((item) => (typeof item.name === "string" ? item.name : ""))
    .filter(Boolean)
    .join("\n");
  const publicProfileHref = profile ? getProProfileHref(profile) : null;

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly Pro</p>
            <h1>Edit pro profile</h1>
            <p className="hero-text">
              Build the public trust profile homeowners and AI search systems
              use to understand your services, areas, credentials, and response
              quality.
            </p>
            <div className="flex gap-md">
              <Link href="/pro" className="button button-secondary">
                Dashboard
              </Link>
              {publicProfileHref ? (
                <Link href={publicProfileHref} className="button button-primary">
                  View public profile
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-3">
            <div className="card">
              <p className="eyebrow">Completion</p>
              <h2>{completion.score}%</h2>
              <p>
                Missing:{" "}
                {completion.missingFields.length > 0
                  ? completion.missingFields.slice(0, 4).join(", ")
                  : "nothing major"}
              </p>
              <p>Next: {completion.nextBestAction}</p>
            </div>
            <div className="card">
              <p className="eyebrow">Public name</p>
              <h2>{profile ? getProDisplayName(profile) : "Not set"}</h2>
              <p>This is the name displayed on public pro pages.</p>
              <p>
                Identity {profile?.identity_verified ? "verified" : "pending"} ·
                license {profile?.license_verified ? "verified" : "pending"} ·
                insurance {profile?.insurance_verified ? "verified" : "pending"}.
              </p>
              <p>Verification review will be available soon.</p>
            </div>
            <div className="card">
              <p className="eyebrow">Coverage</p>
              <h2>
                {profile?.derived_service_area_slugs?.length ??
                  profile?.service_areas?.length ??
                  0}{" "}
                cities
              </h2>
              <p>
                Coverage is generated from your selected hometown and service
                radius.
              </p>
            </div>
          </div>
        </section>

        {params.saved ? (
          <section className="section-sm">
            <div className="container">
              <div className="card">
                <p className="badge badge-success">Profile saved</p>
              </div>
            </div>
          </section>
        ) : null}

        {params.error ? (
          <section className="section-sm">
            <div className="container">
              <div className="card">
                <p className="form-error">
                  {params.error === "invalid-market"
                    ? "Choose a valid hometown from the suggested markets."
                    : params.error === "no-service-area"
                      ? "Choose a hometown and radius that generate service areas."
                      : params.error === "missing-category"
                        ? "Choose at least one service category."
                        : "Unable to save profile. Please review the form."}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="section-sm">
          <div className="container">
            <ProProfileForm
              action={updateProProfile}
              categories={Object.values(categories).map((category) => ({
                slug: category.slug,
                title: category.title,
                shortTitle: category.shortTitle,
              }))}
              subcategories={Object.values(subcategories).map((subcategory) => ({
                slug: subcategory.slug,
                parentSlug: subcategory.parentSlug,
                title: subcategory.title,
                shortTitle: subcategory.shortTitle,
              }))}
              initial={{
                companyName: profile?.company_name ?? "",
                displayName: profile?.display_name ?? "",
                bio: profile?.bio ?? "",
                yearsExperience: profile?.years_experience ?? "",
                avatarUrl: profile?.avatar_url ?? "",
                logoUrl: profile?.logo_url ?? "",
                homeMarketSlug: profile?.home_market_slug ?? "",
                homeMarketLabel: homeMarket
                  ? `${homeMarket.city}, ${homeMarket.state}, ${homeMarket.countryCode}`
                  : "",
                serviceRadiusMiles: profile?.service_radius_miles ?? 15,
                serviceCategories: Array.from(selectedCategories),
                serviceSubcategories: profile?.service_subcategories ?? [],
                licenseText,
                insuranceVerified: Boolean(profile?.insurance_verified),
              }}
            />
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
