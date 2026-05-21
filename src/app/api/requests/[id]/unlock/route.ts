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

type LeadRow = {
  id: string;
  public_slug: string;
  customer_user_id: string | null;
  category_slug: string;
  subcategory_slug: string | null;
  market_slug: string;
  city: string;
  state: string;
  country_code: string;
  status: string;
  lead_status: string | null;
  purchase_count: number | null;
  max_purchases: number | null;
  max_responses: number | null;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(
    value
  );
}

function getMaxPurchases(lead: Pick<LeadRow, "max_purchases" | "max_responses">) {
  return lead.max_purchases ?? lead.max_responses ?? null;
}

function getLeadUnavailableMessage(lead: LeadRow) {
  if (lead.status !== "open") {
    return "This lead is no longer open for new unlocks.";
  }

  if (lead.lead_status && lead.lead_status !== "available") {
    if (lead.lead_status === "sold_out") {
      return "This lead has reached its response limit.";
    }

    if (lead.lead_status === "closed") {
      return "This lead is closed and can no longer be unlocked.";
    }

    return "This lead is no longer available for new unlocks.";
  }

  const maxPurchases = getMaxPurchases(lead);

  if (maxPurchases !== null && (lead.purchase_count ?? 0) >= maxPurchases) {
    return "This lead has reached its response limit.";
  }

  return null;
}

function getUnlockErrorStatus(message: string) {
  if (message.includes("Insufficient FIXA balance")) return 402;
  if (message.includes("purchase limit")) return 409;
  if (message.includes("sold out")) return 409;
  if (message.includes("no longer open")) return 409;
  if (message.includes("no longer available")) return 409;
  if (message.includes("not found")) return 404;
  if (message.includes("Contact details")) return 404;

  return 500;
}

function getPublicUnlockError(message: string) {
  const knownMessages = [
    "Insufficient FIXA balance.",
    "Lead not found.",
    "Lead is no longer open for new unlocks.",
    "Lead is no longer available.",
    "Lead purchase limit reached.",
    "Contact details not found.",
  ];

  return knownMessages.includes(message)
    ? message
    : "Unable to unlock this lead right now.";
}

async function getLeadByIdOrSlug(id: string) {
  const admin = createSupabaseAdminClient();
  const query = admin.from("service_requests").select(
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
  );

  return isUuid(id)
    ? query.eq("id", id).maybeSingle()
    : query.eq("public_slug", id).maybeSingle();
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
  const { data: lead, error: leadError } = await getLeadByIdOrSlug(id);

  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  const { data: existingAccess, error: existingAccessError } = await admin
    .from("pro_lead_access")
    .select("id")
    .eq("request_id", lead.id)
    .eq("pro_user_id", pro.proUserId)
    .maybeSingle();

  if (existingAccessError) {
    return NextResponse.json(
      { error: "Unable to verify existing lead access." },
      { status: 500 }
    );
  }

  const unavailableMessage = existingAccess
    ? null
    : getLeadUnavailableMessage(lead as LeadRow);

  if (unavailableMessage) {
    return NextResponse.json(
      { error: unavailableMessage },
      { status: 409 }
    );
  }

  const { data, error } = await admin.rpc("unlock_lead_contact", {
    p_pro_user_id: pro.proUserId,
    p_request_id: lead.id,
  });

  if (error) {
    const message = error.message ?? "Unable to unlock lead.";
    const publicMessage = getPublicUnlockError(message);

    return NextResponse.json(
      { error: publicMessage },
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

  if (
    !result.already_purchased &&
    result.price_fixas > 0 &&
    result.balance_after < result.price_fixas
  ) {
    await createNotification({
      userId: pro.proUserId,
      type: "low_fixa_balance",
      title: "FIXA balance is running low",
      body: "Your FIXA balance may be too low for another similar lead unlock.",
      href: "/account/fixa/buy",
      metadata: {
        requestId: currentLead.id,
        publicSlug: currentLead.public_slug,
        balanceAfter: result.balance_after,
        leadPriceFixas: result.price_fixas,
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
