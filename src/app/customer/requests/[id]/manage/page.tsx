import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import PublicPageShell from "@/components/PublicPageShell";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CustomerRequestEditForm } from "@/features/customer/CustomerRequestEditForm";

export const metadata = {
  title: "Manage Request | Fixly",
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
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

export default async function CustomerRequestEditPage({ params }: PageProps) {
  const user = await getUser();

  if (!user) {
    redirect("/login?intent=customer&next=/customer");
  }

  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { data: request } = await admin
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
      max_responses,
      created_at
    `
    )
    .eq("id", id)
    .eq("customer_user_id", user.id)
    .maybeSingle();

  if (!request) {
    notFound();
  }

  return (
    <PublicPageShell>
      <main className="section">
        <div className="container-narrow">
          <Link href="/customer" className="button button-secondary">
            Back to my requests
          </Link>

          <div className="card customer-edit-card">
            <p className="eyebrow">
              {request.city}, {request.state}
            </p>

            <h1>Edit request</h1>

            <CustomerRequestEditForm
              request={{
                id: request.id,
                publicSlug: request.public_slug,
                publicDescription: request.public_description,
                status: request.status,
              }}
            />
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}