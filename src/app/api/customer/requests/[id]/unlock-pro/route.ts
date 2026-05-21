import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/account";
import { createNotification } from "@/lib/notifications";

const CUSTOMER_PRO_UNLOCK_PRICE_FIXAS = 100;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ServiceRequestRow = {
  id: string;
  public_slug: string;
  customer_user_id: string;
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

type CustomerProUnlockResult = {
  ok: boolean;
  already_unlocked: boolean;
  request_id: string;
  public_slug: string;
  status: string;
  lead_status: string;
  price_fixas: number;
  balance_after: number | null;
  company_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
};

function getUnlockErrorStatus(message: string) {
  if (message.includes("Insufficient FIXA balance")) return 402;
  if (message.includes("has not opened")) return 403;
  if (message.includes("not found")) return 404;
  if (message.includes("no longer open")) return 409;
  if (message.includes("no longer available")) return 409;
  if (message.includes("response limit")) return 409;
  if (message.includes("own contact")) return 400;
  return 500;
}

function getPublicUnlockError(message: string) {
  const knownMessages = [
    "Insufficient FIXA balance.",
    "Request not found.",
    "This pro has not opened your request.",
    "This request is no longer open for new contact unlocks.",
    "This request is no longer available for new contact unlocks.",
    "This request has reached its response limit.",
    "You cannot unlock your own contact.",
  ];

  return knownMessages.includes(message)
    ? message
    : "Unable to unlock this pro contact right now.";
}

export async function POST(request: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const { id } = await context.params;

  const body = (await request.json()) as {
    proUserId?: string;
  };

  const proUserId = body.proUserId;

  if (!proUserId) {
    return NextResponse.json(
      { error: "Pro user ID is required." },
      { status: 400 }
    );
  }

  if (proUserId === user.id) {
    return NextResponse.json(
      { error: "You cannot unlock your own contact." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();

  const { data: serviceRequest, error: requestError } = await admin
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
    .eq("id", id)
    .eq("customer_user_id", user.id)
    .maybeSingle();

  if (requestError) {
    return NextResponse.json(
      { error: "Unable to load request." },
      { status: 500 }
    );
  }

  if (!serviceRequest) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }

  const typedServiceRequest = serviceRequest as ServiceRequestRow;

  const { data, error } = await admin.rpc("unlock_customer_pro_contact", {
    p_customer_user_id: user.id,
    p_request_id: typedServiceRequest.id,
    p_pro_user_id: proUserId,
    p_price_fixas: CUSTOMER_PRO_UNLOCK_PRICE_FIXAS,
  });

  if (error) {
    const message = error.message ?? "Unable to unlock this pro contact.";
    return NextResponse.json(
      { error: getPublicUnlockError(message) },
      { status: getUnlockErrorStatus(message) }
    );
  }

  const result = (
    Array.isArray(data) ? data[0] : data
  ) as CustomerProUnlockResult | null;

  if (!result) {
    return NextResponse.json(
      { error: "Unable to load pro contact." },
      { status: 404 }
    );
  }

  if (!result.already_unlocked) {
    await createNotification({
      userId: proUserId,
      type: "pro_contact_unlocked",
      title: "A customer unlocked your contact",
      body: "A customer opened your pro contact details after you unlocked their request.",
      href: `/requests/${typedServiceRequest.public_slug}`,
      metadata: {
        requestId: typedServiceRequest.id,
        publicSlug: typedServiceRequest.public_slug,
        customerUserId: user.id,
        proUserId,
        categorySlug: typedServiceRequest.category_slug,
        subcategorySlug: typedServiceRequest.subcategory_slug,
        marketSlug: typedServiceRequest.market_slug,
        city: typedServiceRequest.city,
        state: typedServiceRequest.state,
        countryCode: typedServiceRequest.country_code,
        priceFixas: result.price_fixas,
        balanceAfter: result.balance_after,
      },
    });

    if (
      result.balance_after !== null &&
      result.balance_after < CUSTOMER_PRO_UNLOCK_PRICE_FIXAS
    ) {
      await createNotification({
        userId: user.id,
        type: "low_fixa_balance",
        title: "FIXA balance is running low",
        body: "Your FIXA balance may be too low for another pro contact unlock.",
        href: "/account/fixa/buy",
        metadata: {
          requestId: typedServiceRequest.id,
          publicSlug: typedServiceRequest.public_slug,
          proUserId,
          balanceAfter: result.balance_after,
          unlockPriceFixas: result.price_fixas,
        },
      });
    }
  }

  return NextResponse.json({
    ok: true,
    alreadyUnlocked: result.already_unlocked,
    priceFixas: result.price_fixas,
    customerBalanceAfter: result.balance_after,
    request: {
      id: result.request_id,
      publicSlug: result.public_slug,
      status: result.status,
      leadStatus: result.lead_status,
    },
    proContact: {
      companyName: result.company_name ?? "Fixly Pro",
      contactName: result.contact_name ?? "",
      email: result.contact_email ?? "",
      phone: result.contact_phone ?? "",
    },
  });
}
