-- Fixly Supabase migration
-- Created: 2026-06-09T12:00:00Z
-- Purpose: Make Stripe FIXA topups safely idempotent when webhook and return-page reconciliation race.

create or replace function public.add_fixa_transaction(
  p_user_id uuid,
  p_amount integer,
  p_transaction_type text,
  p_request_id uuid default null,
  p_related_user_id uuid default null,
  p_stripe_session_id text default null
)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_balance integer;
  v_balance_after integer;
begin
  if p_amount is null or p_amount = 0 then
    raise exception 'FIXA amount cannot be zero.';
  end if;

  if p_transaction_type is null or btrim(p_transaction_type) = '' then
    raise exception 'FIXA transaction type is required.';
  end if;

  insert into public.user_fixa_accounts (
    user_id,
    balance,
    updated_at
  )
  values (
    p_user_id,
    0,
    now()
  )
  on conflict (user_id) do nothing;

  select ufa.balance
  into v_balance
  from public.user_fixa_accounts ufa
  where ufa.user_id = p_user_id
  for update;

  if not found then
    raise exception 'FIXA account not found.';
  end if;

  if p_stripe_session_id is not null then
    select ft.balance_after
    into v_balance_after
    from public.fixa_transactions ft
    where ft.stripe_session_id = p_stripe_session_id
      and ft.user_id = p_user_id
    order by ft.created_at desc
    limit 1;

    if found then
      return coalesce(v_balance_after, v_balance);
    end if;
  end if;

  v_balance_after := v_balance + p_amount;

  if v_balance_after < 0 then
    raise exception 'Insufficient FIXA balance.';
  end if;

  update public.user_fixa_accounts ufa
  set
    balance = v_balance_after,
    updated_at = now()
  where ufa.user_id = p_user_id;

  insert into public.fixa_transactions (
    user_id,
    amount,
    transaction_type,
    request_id,
    related_user_id,
    balance_after,
    stripe_session_id,
    created_at
  )
  values (
    p_user_id,
    p_amount,
    p_transaction_type,
    p_request_id,
    p_related_user_id,
    v_balance_after,
    p_stripe_session_id,
    now()
  );

  return v_balance_after;
end;
$$;
