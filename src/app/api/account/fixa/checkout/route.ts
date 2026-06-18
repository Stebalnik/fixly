import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAccountContext } from "@/lib/auth/account";
import {
  FIXA_PACKAGES,
  calculateFixaPriceCents,
} from "@/lib/fixa/constants";
import { recordCheckoutAttempt } from "@/lib/payments/checkout-attempts";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function normalizeFixaAmount(value: unknown) {
  const amount = Number(value);

  if (!Number.isInteger(amount)) {
    return null;
  }

  if (!FIXA_PACKAGES.some((item) => item.fixaAmount === amount)) {
    return null;
  }

  return amount;
}

function getOrigin(request: Request) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://fixly.work";

  const headerOrigin = request.headers.get("origin");

  if (headerOrigin && !headerOrigin.includes("localhost")) {
    return headerOrigin.replace(/\/$/, "");
  }

  return siteUrl.replace(/\/$/, "");
}

export async function POST(request: Request) {
  try {
    const account = await getAccountContext();

    const body = (await request.json()) as {
      fixaAmount?: number;
    };

    const fixaAmount = normalizeFixaAmount(body.fixaAmount);

    if (!fixaAmount) {
      return NextResponse.json(
        { error: "Invalid FIXA amount." },
        { status: 400 }
      );
    }

    const priceCents = calculateFixaPriceCents(fixaAmount);
    const origin = getOrigin(request);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: account.user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: `${fixaAmount.toLocaleString()} FIXAs`,
              description: "Add FIXAs to your Fixly account balance.",
            },
            unit_amount: priceCents,
          },
        },
      ],
      success_url: `${origin}/account/fixa?payment=success`,
      cancel_url: `${origin}/account/fixa/buy?payment=cancelled`,
      client_reference_id: account.user.id,
      metadata: {
        user_id: account.user.id,
        fixa_amount: String(fixaAmount),
        price_cents: String(priceCents),
        checkout_source: "account_fixa_buy",
      },
    });

    try {
      await recordCheckoutAttempt({ session });
    } catch (error) {
      console.error("Failed to record FIXA checkout attempt", {
        sessionId: session.id,
        userId: account.user.id,
        error,
      });
    }

    if (!session.url) {
      return NextResponse.json(
        { error: "Unable to create Stripe checkout session." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Failed to create FIXA checkout session", error);

    return NextResponse.json(
      { error: "Unable to start FIXA checkout." },
      { status: 500 }
    );
  }
}
