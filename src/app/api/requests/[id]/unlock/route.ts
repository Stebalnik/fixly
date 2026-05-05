import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getProAccessContext } from "@/lib/pro/access";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const pro = await getProAccessContext(request);

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

  const { data: lead, error: leadError } = await admin
    .from("service_requests")
    .select("id, lead_price_credits, purchase_count, max_purchases, lead_status")
    .eq("id", id)
    .eq("status", "open")
    .maybeSingle();

  if (leadError || !lead) {
    return NextResponse.json(
      { error: "Lead not found." },
      { status: 404 }
    );
  }

  if (lead.lead_status !== "available") {
    return NextResponse.json(
      { error: "Lead is no longer available." },
      { status: 409 }
    );
  }

  const { data: existingAccess } = await admin
    .from("pro_lead_access")
    .select("id")
    .eq("request_id", lead.id)
    .eq("pro_user_id", pro.proUserId)
    .maybeSingle();

  if (existingAccess) {
    return NextResponse.json({
      ok: true,
      alreadyPurchased: true,
    });
  }

  if (lead.purchase_count >= lead.max_purchases) {
    await admin
      .from("service_requests")
      .update({ lead_status: "sold_out" })
      .eq("id", lead.id);

    return NextResponse.json(
      { error: "Lead is sold out." },
      { status: 409 }
    );
  }

  if (pro.creditBalance < lead.lead_price_credits) {
    return NextResponse.json(
      { error: "Not enough credits." },
      { status: 402 }
    );
  }

  const newBalance = pro.creditBalance - lead.lead_price_credits;
  const newPurchaseCount = lead.purchase_count + 1;
  const nextLeadStatus =
    newPurchaseCount >= lead.max_purchases ? "sold_out" : "available";

  const { error: creditError } = await admin
    .from("pro_credit_accounts")
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("pro_user_id", pro.proUserId);

  if (creditError) {
    return NextResponse.json(
      { error: "Unable to update credit balance." },
      { status: 500 }
    );
  }

  const { error: accessError } = await admin.from("pro_lead_access").insert({
    request_id: lead.id,
    pro_user_id: pro.proUserId,
    access_type: "lead_purchase",
  });

  if (accessError) {
    return NextResponse.json(
      { error: "Unable to unlock lead." },
      { status: 500 }
    );
  }

  await admin.from("pro_credit_transactions").insert({
    pro_user_id: pro.proUserId,
    amount: -lead.lead_price_credits,
    transaction_type: "lead_purchase",
    request_id: lead.id,
  });

  await admin
    .from("service_requests")
    .update({
      purchase_count: newPurchaseCount,
      lead_status: nextLeadStatus,
    })
    .eq("id", lead.id);

  return NextResponse.json({
    ok: true,
    balance: newBalance,
  });
}