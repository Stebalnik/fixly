import Stripe from "stripe";
import { createNotification } from "@/lib/notifications";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { addFixaTransaction } from "@/lib/fixa";
import { calculateFixaPriceCents } from "@/lib/fixa/constants";

type CreditFixaCheckoutSessionArgs = {
  session: Stripe.Checkout.Session;
  expectedUserId?: string;
  notify?: boolean;
};

export type CreditFixaCheckoutSessionResult = {
  credited: boolean;
  duplicate: boolean;
  userId: string;
  fixaAmount: number;
  balanceAfter: number | null;
};

function getFixaCheckoutMetadata(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id ?? session.metadata?.pro_user_id ?? "";
  const fixaAmount = Number(session.metadata?.fixa_amount ?? 0);
  const metadataPriceCents = Number(session.metadata?.price_cents ?? 0);
  const expectedPriceCents = Number.isInteger(fixaAmount)
    ? calculateFixaPriceCents(fixaAmount)
    : 0;

  if (!userId || !Number.isInteger(fixaAmount) || fixaAmount <= 0) {
    throw new Error("Missing FIXA metadata.");
  }

  if (
    session.metadata?.checkout_source &&
    session.metadata.checkout_source !== "account_fixa_buy"
  ) {
    throw new Error("Invalid FIXA checkout source.");
  }

  if (
    metadataPriceCents > 0 &&
    expectedPriceCents > 0 &&
    metadataPriceCents !== expectedPriceCents
  ) {
    throw new Error("Invalid FIXA checkout price metadata.");
  }

  if (
    typeof session.amount_total === "number" &&
    expectedPriceCents > 0 &&
    session.amount_total !== expectedPriceCents
  ) {
    throw new Error("Invalid FIXA checkout amount.");
  }

  return {
    userId,
    fixaAmount,
  };
}

async function findExistingTopup(sessionId: string, userId: string) {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("fixa_transactions")
    .select("balance_after")
    .eq("transaction_type", "fixa_topup")
    .eq("stripe_session_id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function creditFixaCheckoutSession({
  session,
  expectedUserId,
  notify = true,
}: CreditFixaCheckoutSessionArgs): Promise<CreditFixaCheckoutSessionResult> {
  if (session.payment_status !== "paid") {
    throw new Error("Checkout session is not paid.");
  }

  const { userId, fixaAmount } = getFixaCheckoutMetadata(session);

  if (expectedUserId && userId !== expectedUserId) {
    throw new Error("Checkout session does not belong to this account.");
  }

  const existingTopup = await findExistingTopup(session.id, userId);

  if (existingTopup) {
    return {
      credited: false,
      duplicate: true,
      userId,
      fixaAmount,
      balanceAfter: existingTopup.balance_after ?? null,
    };
  }

  let balanceAfter: number;

  try {
    balanceAfter = await addFixaTransaction({
      userId,
      amount: fixaAmount,
      transactionType: "fixa_topup",
      stripeSessionId: session.id,
    });
  } catch (error) {
    const duplicateTopup = await findExistingTopup(session.id, userId);

    if (duplicateTopup) {
      return {
        credited: false,
        duplicate: true,
        userId,
        fixaAmount,
        balanceAfter: duplicateTopup.balance_after ?? null,
      };
    }

    throw error;
  }

  if (notify) {
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
  }

  return {
    credited: true,
    duplicate: false,
    userId,
    fixaAmount,
    balanceAfter,
  };
}
