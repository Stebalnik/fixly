import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Stripe from "stripe";

const fixaPackages: Record<string, { amount: number; priceUsd: number }> = {
  "1000": { amount: 1000, priceUsd: 13 },
  "2500": { amount: 2500, priceUsd: 32 },
  "5000": { amount: 5000, priceUsd: 60 },
};

async function getCurrentUserId() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Login required." },
      { status: 401 }
    );
  }

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
            name: `${selectedPackage.amount.toLocaleString()} FIXAs`,
          },
          unit_amount: selectedPackage.priceUsd * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/pro/credits?payment=success&fixas=${selectedPackage.amount}`,
    cancel_url: `${appUrl}/pro/credits?payment=cancelled`,
    metadata: {
      pro_user_id: userId,
      fixa_amount: String(selectedPackage.amount),
      price_usd: String(selectedPackage.priceUsd),
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