import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe webhook signature or secret." },
      { status: 400 }
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const proUserId = session.metadata?.pro_user_id;
  const fixaAmount = Number(session.metadata?.fixa_amount ?? 0);

  if (!proUserId || !Number.isInteger(fixaAmount) || fixaAmount <= 0) {
    return NextResponse.json(
      { error: "Missing FIXA metadata." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();

  const { data: existingTransaction } = await admin
    .from("pro_credit_transactions")
    .select("id")
    .eq("transaction_type", "fixa_topup")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (existingTransaction) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const { data: account, error: accountError } = await admin
    .from("pro_credit_accounts")
    .select("balance")
    .eq("pro_user_id", proUserId)
    .maybeSingle();

  if (accountError) {
    return NextResponse.json(
      { error: "Unable to load credit account." },
      { status: 500 }
    );
  }

  const currentBalance = account?.balance ?? 0;
  const balanceAfter = currentBalance + fixaAmount;

  const { error: upsertError } = await admin
    .from("pro_credit_accounts")
    .upsert(
      {
        pro_user_id: proUserId,
        balance: balanceAfter,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "pro_user_id",
      }
    );

  if (upsertError) {
    return NextResponse.json(
      { error: "Unable to update FIXA balance." },
      { status: 500 }
    );
  }

  const { error: transactionError } = await admin
    .from("pro_credit_transactions")
    .insert({
      pro_user_id: proUserId,
      amount: fixaAmount,
      transaction_type: "fixa_topup",
      balance_after: balanceAfter,
      stripe_session_id: session.id,
    });

  if (transactionError) {
    return NextResponse.json(
      { error: "Unable to record FIXA transaction." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    received: true,
    credited: fixaAmount,
  });
}