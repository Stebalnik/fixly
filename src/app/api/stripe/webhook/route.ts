import { NextResponse } from "next/server";
import Stripe from "stripe";
import { addFixaTransaction } from "@/lib/fixa";
import { calculateFixaPriceCents } from "@/lib/fixa/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";

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
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Invalid Stripe webhook signature", error);

    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    return NextResponse.json({
      received: true,
      ignored: true,
      reason: "Checkout session is not paid.",
    });
  }

  const userId = session.metadata?.user_id ?? session.metadata?.pro_user_id ?? "";
  const fixaAmount = Number(session.metadata?.fixa_amount ?? 0);
  const metadataPriceCents = Number(session.metadata?.price_cents ?? 0);
  const expectedPriceCents = Number.isInteger(fixaAmount)
    ? calculateFixaPriceCents(fixaAmount)
    : 0;

  if (!userId || !Number.isInteger(fixaAmount) || fixaAmount <= 0) {
    return NextResponse.json(
      { error: "Missing FIXA metadata." },
      { status: 400 }
    );
  }

  if (
    metadataPriceCents > 0 &&
    expectedPriceCents > 0 &&
    metadataPriceCents !== expectedPriceCents
  ) {
    console.error("FIXA checkout price metadata mismatch", {
      sessionId: session.id,
      userId,
      fixaAmount,
      metadataPriceCents,
      expectedPriceCents,
    });

    return NextResponse.json(
      { error: "Invalid FIXA checkout price metadata." },
      { status: 400 }
    );
  }

  if (
    typeof session.amount_total === "number" &&
    expectedPriceCents > 0 &&
    session.amount_total !== expectedPriceCents
  ) {
    console.error("FIXA checkout amount mismatch", {
      sessionId: session.id,
      userId,
      fixaAmount,
      amountTotal: session.amount_total,
      expectedPriceCents,
    });

    return NextResponse.json(
      { error: "Invalid FIXA checkout amount." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();

  const { data: existingTransaction, error: existingTransactionError } =
    await admin
      .from("fixa_transactions")
      .select("id")
      .eq("transaction_type", "fixa_topup")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

  if (existingTransactionError) {
    return NextResponse.json(
      { error: "Unable to check existing FIXA transaction." },
      { status: 500 }
    );
  }

  if (existingTransaction) {
    return NextResponse.json({
      received: true,
      duplicate: true,
    });
  }

  try {
    const balanceAfter = await addFixaTransaction({
      userId,
      amount: fixaAmount,
      transactionType: "fixa_topup",
      stripeSessionId: session.id,
    });

    await createNotification({
      userId,
      type: "fixa_topup",
      title: "FIXAs added",
      body: `${fixaAmount.toLocaleString()} FIXAs were added to your Fixly balance.`,
      href: "/account/fixa",
      metadata: {
        userId,
        fixaAmount,
        balanceAfter,
        stripeSessionId: session.id,
        amountTotal: session.amount_total,
        currency: session.currency,
      },
    });

    return NextResponse.json({
      received: true,
      credited: fixaAmount,
      balanceAfter,
    });
  } catch (error) {
    console.error("Unable to credit FIXAs", {
      sessionId: session.id,
      userId,
      fixaAmount,
      error,
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to credit FIXAs.",
      },
      { status: 500 }
    );
  }
}