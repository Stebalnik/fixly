import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getFixaBalance(userId: string) {
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("user_fixa_accounts")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.balance ?? 0;
}

export async function ensureFixaAccount(userId: string) {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("user_fixa_accounts")
    .upsert(
      {
        user_id: userId,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    )
    .select("balance")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.balance ?? 0;
}

export async function addFixaTransaction(args: {
  userId: string;
  amount: number;
  transactionType: string;
  requestId?: string | null;
  relatedUserId?: string | null;
  stripeSessionId?: string | null;
}) {
  const admin = createSupabaseAdminClient();

  await ensureFixaAccount(args.userId);

  const currentBalance = await getFixaBalance(args.userId);

  const newBalance = currentBalance + args.amount;

  if (newBalance < 0) {
    throw new Error("Insufficient FIXA balance.");
  }

  const { error: updateError } = await admin
    .from("user_fixa_accounts")
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", args.userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: transactionError } = await admin
    .from("fixa_transactions")
    .insert({
      user_id: args.userId,
      amount: args.amount,
      transaction_type: args.transactionType,
      request_id: args.requestId ?? null,
      related_user_id: args.relatedUserId ?? null,
      stripe_session_id: args.stripeSessionId ?? null,
      balance_after: newBalance,
    });

  if (transactionError) {
    throw new Error(transactionError.message);
  }

  return newBalance;
}