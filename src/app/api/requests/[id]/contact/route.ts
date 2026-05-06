import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getProAccessContext } from "@/lib/pro/access";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function GET(request: Request, { params }: RouteProps) {
  const { id } = await params;

  const pro = await getProAccessContext();

  if (!pro.ok) {
    return unauthorized();
  }

  const supabase = createSupabaseAdminClient();

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
    .eq("pro_user_id", pro.proUserId)
    .maybeSingle();

  if (!access) {
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