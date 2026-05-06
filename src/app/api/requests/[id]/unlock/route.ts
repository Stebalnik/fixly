import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getProAccessContext } from "@/lib/pro/access";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  const pro = await getProAccessContext();

  if (!pro.ok) {
    return NextResponse.json(
      { error: pro.message },
      { status: pro.status }
    );
  }

  if (!pro.hasActiveSubscription) {
    return NextResponse.json(
      { error: "Active subscription required." },
      { status: 402 }
    );
  }

  const admin = createSupabaseAdminClient();

  const leadQuery = admin
    .from("service_requests")
    .select("id")
    .eq("status", "open");

  const { data: lead, error: leadError } = isUuid(id)
    ? await leadQuery.eq("id", id).maybeSingle()
    : await leadQuery.eq("public_slug", id).maybeSingle();

  if (leadError || !lead) {
    return NextResponse.json(
      { error: "Lead not found." },
      { status: 404 }
    );
  }

  const { data, error } = await admin.rpc("unlock_lead_contact", {
    p_pro_user_id: pro.proUserId,
    p_request_id: lead.id,
  });

  if (error) {
    const message = error.message ?? "Unable to unlock lead.";

    const status = message.includes("Insufficient FIXA balance")
      ? 402
      : message.includes("purchase limit")
        ? 409
        : message.includes("sold out")
          ? 409
          : message.includes("no longer available")
            ? 409
            : message.includes("not found")
              ? 404
              : 500;

    return NextResponse.json(
      { error: message },
      { status }
    );
  }

  const result = Array.isArray(data) ? data[0] : data;

  if (!result) {
    return NextResponse.json(
      { error: "Contact details not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    alreadyPurchased: result.already_purchased,
    requestId: result.request_id,
    publicSlug: result.public_slug,
    priceFixas: result.price_fixas,
    balanceAfter: result.balance_after,
    contact: {
      customerName: result.customer_name,
      streetAddress: result.street_address,
      phoneCountryCode: result.phone_country_code,
      phoneNumber: result.phone_number,
      fullPhone: result.full_phone,
      email: result.email,
    },
  });
}