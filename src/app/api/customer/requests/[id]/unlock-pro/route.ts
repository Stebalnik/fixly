import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/account";
import { addFixaTransaction, getFixaBalance } from "@/lib/fixa";
import { createNotification } from "@/lib/notifications";
import { getRequestPublicPath } from "@/lib/routes/marketplace";

const CUSTOMER_PRO_UNLOCK_PRICE_FIXAS = 100;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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
      lead_status
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

  const publicRequestPath = getRequestPublicPath(
    serviceRequest.public_slug,
    serviceRequest.country_code || "us"
  );

  const { data: proLeadAccess, error: proLeadAccessError } = await admin
    .from("pro_lead_access")
    .select("id, purchased_at, price_fixas")
    .eq("request_id", serviceRequest.id)
    .eq("pro_user_id", proUserId)
    .maybeSingle();

  if (proLeadAccessError) {
    return NextResponse.json(
      { error: "Unable to verify pro access." },
      { status: 500 }
    );
  }

  if (!proLeadAccess) {
    return NextResponse.json(
      { error: "This pro has not opened your request." },
      { status: 403 }
    );
  }

  const { data: existingAccess, error: existingAccessError } = await admin
    .from("customer_pro_contact_access")
    .select("id, price_fixas, created_at")
    .eq("request_id", serviceRequest.id)
    .eq("customer_user_id", user.id)
    .eq("pro_user_id", proUserId)
    .maybeSingle();

  if (existingAccessError) {
    return NextResponse.json(
      { error: "Unable to verify existing access." },
      { status: 500 }
    );
  }

  const isNewUnlock = !existingAccess;
  let customerBalanceAfter: number | null = null;

  if (isNewUnlock) {
    const balance = await getFixaBalance(user.id);

    if (balance < CUSTOMER_PRO_UNLOCK_PRICE_FIXAS) {
      return NextResponse.json(
        { error: "Insufficient FIXA balance." },
        { status: 402 }
      );
    }

    customerBalanceAfter = await addFixaTransaction({
      userId: user.id,
      amount: -CUSTOMER_PRO_UNLOCK_PRICE_FIXAS,
      transactionType: "pro_contact_unlock",
      requestId: serviceRequest.id,
      relatedUserId: proUserId,
    });

    const { error: accessError } = await admin
      .from("customer_pro_contact_access")
      .insert({
        request_id: serviceRequest.id,
        customer_user_id: user.id,
        pro_user_id: proUserId,
        price_fixas: CUSTOMER_PRO_UNLOCK_PRICE_FIXAS,
      });

    if (accessError) {
      return NextResponse.json({ error: accessError.message }, { status: 400 });
    }

    await createNotification({
      userId: proUserId,
      type: "pro_contact_unlocked",
      title: "A customer unlocked your contact",
      body: "A customer opened your pro contact details after you unlocked their request.",
      href: publicRequestPath,
      metadata: {
        requestId: serviceRequest.id,
        publicSlug: serviceRequest.public_slug,
        customerUserId: user.id,
        proUserId,
        categorySlug: serviceRequest.category_slug,
        subcategorySlug: serviceRequest.subcategory_slug,
        marketSlug: serviceRequest.market_slug,
        city: serviceRequest.city,
        state: serviceRequest.state,
        countryCode: serviceRequest.country_code,
      },
    });
  }

  const { data: proProfile, error: proProfileError } = await admin
    .from("pro_profiles")
    .select("company_name, contact_name, contact_email, contact_phone")
    .eq("user_id", proUserId)
    .maybeSingle();

  if (proProfileError) {
    return NextResponse.json(
      { error: "Unable to load pro contact." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    alreadyUnlocked: !isNewUnlock,
    priceFixas: isNewUnlock ? CUSTOMER_PRO_UNLOCK_PRICE_FIXAS : 0,
    customerBalanceAfter,
    request: {
      id: serviceRequest.id,
      publicSlug: serviceRequest.public_slug,
      publicUrl: publicRequestPath,
      status: serviceRequest.status,
      leadStatus: serviceRequest.lead_status,
    },
    proContact: {
      companyName: proProfile?.company_name ?? "Fixly Pro",
      contactName: proProfile?.contact_name ?? "",
      email: proProfile?.contact_email ?? "",
      phone: proProfile?.contact_phone ?? "",
    },
  });
}