import { NextResponse } from "next/server";
import Stripe from "stripe";
import { creditFixaCheckoutSession } from "@/lib/fixa/stripeTopups";

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

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
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

  try {
    const result = await creditFixaCheckoutSession({ session });

    return NextResponse.json({
      received: true,
      duplicate: result.duplicate,
      credited: result.credited ? result.fixaAmount : 0,
      balanceAfter: result.balanceAfter,
    });
  } catch (error) {
    console.error("Unable to credit FIXAs", {
      sessionId: session.id,
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
