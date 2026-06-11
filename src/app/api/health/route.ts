import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const checks = {
    app: "fixly-web",
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabasePublishableKey: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      ),
      supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      stripeSecretKey: Boolean(process.env.STRIPE_SECRET_KEY),
    },
  };

  return NextResponse.json(checks, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
