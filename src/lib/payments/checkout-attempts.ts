import type Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type CheckoutAttemptStatus =
  | "created"
  | "completed"
  | "expired"
  | "async_payment_failed"
  | "unpaid_completed";

function fromUnixSeconds(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;

  return new Date(value * 1000).toISOString();
}

function toInteger(value: string | number | null | undefined) {
  const amount = Number(value);

  if (!Number.isInteger(amount)) return null;

  return amount;
}

function getCheckoutAttemptStatus(
  session: Stripe.Checkout.Session,
  eventType: string
): CheckoutAttemptStatus {
  if (eventType === "checkout.session.expired") return "expired";
  if (eventType === "checkout.session.async_payment_failed") {
    return "async_payment_failed";
  }

  if (eventType === "checkout.session.completed") {
    return session.payment_status === "paid" ? "completed" : "unpaid_completed";
  }

  return "created";
}

export async function recordCheckoutAttempt(args: {
  session: Stripe.Checkout.Session;
  eventType?: string;
}) {
  const { session } = args;
  const eventType = args.eventType ?? "checkout.session.created";
  const status = getCheckoutAttemptStatus(session, eventType);
  const metadata = session.metadata ?? {};
  const userId = metadata.user_id ?? metadata.pro_user_id ?? null;
  const now = new Date().toISOString();
  const customerEmail =
    session.customer_details?.email ?? session.customer_email ?? null;

  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("payment_checkout_attempts").upsert(
    {
      user_id: userId,
      stripe_session_id: session.id,
      checkout_source: metadata.checkout_source ?? "unknown",
      status,
      stripe_status: session.status ?? null,
      payment_status: session.payment_status ?? null,
      currency: session.currency ?? null,
      amount_total: session.amount_total ?? null,
      fixa_amount: toInteger(metadata.fixa_amount),
      price_cents: toInteger(metadata.price_cents),
      customer_email: customerEmail,
      stripe_created_at: fromUnixSeconds(session.created),
      expires_at: fromUnixSeconds(session.expires_at),
      completed_at: status === "completed" ? now : null,
      expired_at: status === "expired" ? now : null,
      last_event_at: now,
      updated_at: now,
      metadata: {
        ...metadata,
        eventType,
      },
    },
    {
      onConflict: "stripe_session_id",
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}
