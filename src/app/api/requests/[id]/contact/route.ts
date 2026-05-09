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

export async function GET(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const pro = await getProAccessContext();

  if (!pro.ok) {
    return unauthorized();
  }

  const supabase = createSupabaseAdminClient();

  const { data: serviceRequest, error: requestError } = await supabase
    .from("service_requests")
    .select(
      `
      id,
      public_slug,
      status,
      lead_status,
      lead_access_policy,
      customer_user_id,
      purchase_count,
      max_purchases,
      max_responses
    `
    )
    .or(`id.eq.${id},public_slug.eq.${id}`)
    .maybeSingle();

  if (requestError || !serviceRequest) {
    return NextResponse.json(
      { error: "Request not found" },
      { status: 404 }
    );
  }

  const { data: access, error: accessError } = await supabase
    .from("pro_lead_access")
    .select("id, purchased_at, price_fixas")
    .eq("request_id", serviceRequest.id)
    .eq("pro_user_id", pro.proUserId)
    .maybeSingle();

  if (accessError) {
    return NextResponse.json(
      { error: "Unable to verify lead access" },
      { status: 500 }
    );
  }

  if (!access) {
    return paymentRequired();
  }

  const { data: contact, error: contactError } = await supabase
    .from("request_contacts")
    .select(
      `
      customer_name,
      street_address,
      phone_country_code,
      phone_number,
      full_phone,
      email
    `
    )
    .eq("request_id", serviceRequest.id)
    .maybeSingle();

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
    status: serviceRequest.status,
    leadStatus: serviceRequest.lead_status,
    customerUserId: serviceRequest.customer_user_id,
    customerHasAccount: Boolean(serviceRequest.customer_user_id),
    purchaseCount: serviceRequest.purchase_count ?? 0,
    maxPurchases:
      serviceRequest.max_purchases ?? serviceRequest.max_responses ?? null,
    access: {
      id: access.id,
      purchasedAt: access.purchased_at,
      priceFixas: access.price_fixas,
    },
    contact,
  });
}