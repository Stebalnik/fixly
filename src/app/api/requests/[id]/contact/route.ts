import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase server environment variables");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function unauthorized() {
  return NextResponse.json(
    {
      error: "Pro account required",
      code: "PRO_AUTH_REQUIRED",
    },
    { status: 401 }
  );
}

function paymentRequired() {
  return NextResponse.json(
    {
      error: "Paid lead access required",
      code: "LEAD_ACCESS_REQUIRED",
    },
    { status: 402 }
  );
}

/**
 * Temporary placeholder.
 * Later this should read Supabase Auth session / Pro user profile.
 */
async function getCurrentProUserId() {
  return null as string | null;
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { id } = await params;

  const proUserId = await getCurrentProUserId();

  if (!proUserId) {
    return unauthorized();
  }

  const { data: serviceRequest, error: requestError } = await supabase
    .from("service_requests")
    .select("id, public_slug, status, lead_access_policy")
    .or(`id.eq.${id},public_slug.eq.${id}`)
    .single();

  if (requestError || !serviceRequest) {
    return NextResponse.json(
      { error: "Request not found" },
      { status: 404 }
    );
  }

  const { data: access } = await supabase
    .from("pro_lead_access")
    .select("id")
    .eq("request_id", serviceRequest.id)
    .eq("pro_user_id", proUserId)
    .maybeSingle();

  const hasPaidLeadAccess = Boolean(access);

  // Later: also check active subscription here.
  const hasActiveSubscription = false;

  if (!hasPaidLeadAccess && !hasActiveSubscription) {
    return paymentRequired();
  }

  const { data: contact, error: contactError } = await supabase
    .from("request_contacts")
    .select(
      "customer_name, street_address, phone_country_code, phone_number, full_phone, email"
    )
    .eq("request_id", serviceRequest.id)
    .single();

  if (contactError || !contact) {
    return NextResponse.json(
      { error: "Contact details not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    requestId: serviceRequest.id,
    publicSlug: serviceRequest.public_slug,
    contact,
  });
}