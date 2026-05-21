import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AddFixaTransactionArgs = {
  userId: string;
  amount: number;
  transactionType: string;
  requestId?: string | null;
  relatedUserId?: string | null;
  stripeSessionId?: string | null;
};

function validateFixaAmount(amount: number) {
  if (!Number.isInteger(amount)) {
    throw new Error("FIXA amount must be an integer.");
  }

  if (amount === 0) {
    throw new Error("FIXA amount cannot be zero.");
  }
}

export async function getFixaBalance(userId: string) {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("user_fixa_accounts")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.balance ?? 0;
}

export async function ensureFixaAccount(userId: string) {
  const admin = createSupabaseAdminClient();

  const { data: existingAccount, error: existingError } = await admin
    .from("user_fixa_accounts")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingAccount) {
    return existingAccount.balance ?? 0;
  }

  const { data: createdAccount, error: createError } = await admin
    .from("user_fixa_accounts")
    .insert({
      user_id: userId,
      balance: 0,
      updated_at: new Date().toISOString(),
    })
    .select("balance")
    .single();

  if (createError) {
    const balance = await getFixaBalance(userId);
    return balance;
  }

  return createdAccount.balance ?? 0;
}

export async function addFixaTransaction(args: AddFixaTransactionArgs) {
  validateFixaAmount(args.amount);

  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.rpc("add_fixa_transaction", {
    p_user_id: args.userId,
    p_amount: args.amount,
    p_transaction_type: args.transactionType,
    p_request_id: args.requestId ?? null,
    p_related_user_id: args.relatedUserId ?? null,
    p_stripe_session_id: args.stripeSessionId ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return Number(data);
}
