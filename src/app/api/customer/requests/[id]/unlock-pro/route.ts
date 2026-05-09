import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/account";
import { addFixaTransaction, getFixaBalance } from "@/lib/fixa";
import { createNotification } from "@/lib/notifications";

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

  const admin = createSupabaseAdminClient();

  const { data: serviceRequest } = await admin
    .from("service_requests")
    .select("id, customer_user_id")
    .eq("id", id)
    .eq("customer_user_id", user.id)
    .maybeSingle();

  if (!serviceRequest) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }

  const { data: proLeadAccess } = await admin
    .from("pro_lead_access")
    .select("id")
    .eq("request_id", serviceRequest.id)
    .eq("pro_user_id", proUserId)
    .maybeSingle();

  if (!proLeadAccess) {
    return NextResponse.json(
      { error: "This pro has not opened your request." },
      { status: 403 }
    );
  }

  const { data: existingAccess } = await admin
    .from("customer_pro_contact_access")
    .select("id")
    .eq("request_id", serviceRequest.id)
    .eq("customer_user_id", user.id)
    .eq("pro_user_id", proUserId)
    .maybeSingle();

  const isNewUnlock = !existingAccess;

  if (isNewUnlock) {
    const balance = await getFixaBalance(user.id);

    if (balance < CUSTOMER_PRO_UNLOCK_PRICE_FIXAS) {
      return NextResponse.json(
        { error: "Insufficient FIXA balance." },
        { status: 402 }
      );
    }

    await addFixaTransaction({
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
      body: "A customer opened your pro contact details.",
      href: "/account",
      metadata: {
        requestId: serviceRequest.id,
        customerUserId: user.id,
        proUserId,
      },
    });
  }

  const { data: proProfile } = await admin
    .from("pro_profiles")
    .select("company_name, contact_name, contact_email, contact_phone")
    .eq("user_id", proUserId)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    priceFixas: isNewUnlock ? CUSTOMER_PRO_UNLOCK_PRICE_FIXAS : 0,
    proContact: {
      companyName: proProfile?.company_name ?? "Fixly Pro",
      contactName: proProfile?.contact_name ?? "",
      email: proProfile?.contact_email ?? "",
      phone: proProfile?.contact_phone ?? "",
    },
  });
}