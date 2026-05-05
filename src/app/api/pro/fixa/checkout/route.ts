import { NextResponse } from "next/server";
import Stripe from "stripe";

const fixaPackages: Record<string, { amount: number; priceUsd: number }> = {
  "25": { amount: 25, priceUsd: 25 },
  "50": { amount: 50, priceUsd: 50 },
  "100": { amount: 100, priceUsd: 100 },
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const amount = String(formData.get("amount") ?? "");

  const selectedPackage = fixaPackages[amount];

  if (!selectedPackage) {
    return NextResponse.json(
      { error: "Invalid FIXA package." },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4081";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${selectedPackage.amount} FIXAs`,
          },
          unit_amount: selectedPackage.priceUsd * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/pro/credits?payment=success&fixas=${selectedPackage.amount}`,
    cancel_url: `${appUrl}/pro/credits?payment=cancelled`,
    metadata: {
      fixa_amount: String(selectedPackage.amount),
    },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Unable to create Stripe Checkout session." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(session.url, 303);
}