import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAccountContext } from "@/lib/auth/account";
import {
  FIXA_PACKAGES,
  calculateFixaPriceCents,
} from "@/lib/fixa/constants";

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

export async function POST(request: Request) {
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

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:4081";

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
            description: "Fixly marketplace balance",
          },
          unit_amount: calculateFixaPriceCents(fixaAmount),
        },
      },
    ],
    success_url: `${origin}/account/fixa?payment=success`,
    cancel_url: `${origin}/account/fixa/buy?payment=cancelled`,
    metadata: {
      user_id: account.user.id,
      fixa_amount: String(fixaAmount),
    },
  });

  return NextResponse.json({
    ok: true,
    url: session.url,
  });
}