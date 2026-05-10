import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";
import { getProAccessContext } from "@/lib/pro/access";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UnlockLeadResult = {
  ok: boolean;
  already_purchased: boolean;
  request_id: string;
  public_slug: string;
  price_fixas: number;
  balance_after: number;
  customer_name: string | null;
  street_address: string | null;
  phone_country_code: string | null;
  phone_number: string | null;
  full_phone: string | null;
  email: string | null;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(
    value
  );
}

function getUnlockErrorStatus(message: string) {
  if (message.includes("Insufficient FIXA balance")) return 402;
  if (message.includes("purchase limit")) return 409;
  if (message.includes("sold out")) return 409;
  if (message.includes("no longer available")) return 409;
  if (message.includes("not found")) return 404;

  return 500;
}

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const pro = await getProAccessContext();

  if (!pro.ok) {
    return NextResponse.json({ error: pro.message }, { status: pro.status });
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
    .select(
      `
      id,
      public_slug,
      customer_user_id,
      category_slug,
      subcategory_slug,
      market_slug,
      city,
      state,
      country_code,
      status,
      lead_status,
      purchase_count,
      max_purchases,
      max_responses
    `
    )
    .eq("status", "open");

  const { data: lead, error: leadError } = isUuid(id)
    ? await leadQuery.eq("id", id).maybeSingle()
    : await leadQuery.eq("public_slug", id).maybeSingle();

  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  const { data, error } = await admin.rpc("unlock_lead_contact", {
    p_pro_user_id: pro.proUserId,
    p_request_id: lead.id,
  });

  if (error) {
    const message = error.message ?? "Unable to unlock lead.";

    return NextResponse.json(
      { error: message },
      { status: getUnlockErrorStatus(message) }
    );
  }

  const result = (
    Array.isArray(data) ? data[0] : data
  ) as UnlockLeadResult | null;

  if (!result) {
    return NextResponse.json(
      { error: "Contact details not found." },
      { status: 404 }
    );
  }

  const { data: freshLead } = await admin
    .from("service_requests")
    .select(
      `
      id,
      public_slug,
      customer_user_id,
      category_slug,
      subcategory_slug,
      market_slug,
      city,
      state,
      country_code,
      status,
      lead_status,
      purchase_count,
      max_purchases,
      max_responses
    `
    )
    .eq("id", lead.id)
    .maybeSingle();

  const currentLead = freshLead ?? lead;

  const maxPurchases =
    currentLead.max_purchases ?? currentLead.max_responses ?? null;

  const purchaseCountAfter = currentLead.purchase_count ?? 0;

  const isSoldOut =
    currentLead.lead_status === "sold_out" ||
    (Boolean(maxPurchases) && purchaseCountAfter >= Number(maxPurchases));

  if (!result.already_purchased && currentLead.customer_user_id) {
    await createNotification({
      userId: currentLead.customer_user_id,
      type: "request_unlocked_by_pro",
      title: "A pro unlocked your request",
      body: isSoldOut
        ? "A pro opened your request. Your request has now reached its response limit."
        : "A local pro opened your request and may contact you soon.",
      href: `/customer/requests/${currentLead.id}/manage`,
      metadata: {
        requestId: currentLead.id,
        publicSlug: currentLead.public_slug,
        proUserId: pro.proUserId,
        categorySlug: currentLead.category_slug,
        subcategorySlug: currentLead.subcategory_slug,
        marketSlug: currentLead.market_slug,
        city: currentLead.city,
        state: currentLead.state,
        countryCode: currentLead.country_code,
        purchaseCountAfter,
        maxPurchases,
        isSoldOut,
      },
    });
  }

  if (!result.already_purchased && isSoldOut && currentLead.customer_user_id) {
    await createNotification({
      userId: currentLead.customer_user_id,
      type: "request_sold_out",
      title: "Your request reached its response limit",
      body: "Your request has received the maximum number of pro responses.",
      href: `/customer/requests/${currentLead.id}/manage`,
      metadata: {
        requestId: currentLead.id,
        publicSlug: currentLead.public_slug,
        categorySlug: currentLead.category_slug,
        subcategorySlug: currentLead.subcategory_slug,
        marketSlug: currentLead.market_slug,
        city: currentLead.city,
        state: currentLead.state,
        countryCode: currentLead.country_code,
        purchaseCountAfter,
        maxPurchases,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    alreadyPurchased: result.already_purchased,
    requestId: result.request_id,
    publicSlug: result.public_slug,
    priceFixas: result.price_fixas,
    balanceAfter: result.balance_after,
    customerHasAccount: Boolean(currentLead.customer_user_id),
    customerUserId: currentLead.customer_user_id,
    leadStatus: isSoldOut ? "sold_out" : currentLead.lead_status,
    purchaseCount: purchaseCountAfter,
    maxPurchases,
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