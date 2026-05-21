-- Fixly Supabase migration
-- Created: 2026-05-20T23:20:59Z
-- Purpose: Make pro lead unlock idempotent before availability checks.
-- Safety: Replaces RPC logic only; no data or pricing changes.
-- Rollback notes: Restore the previous unlock_lead_contact function definition.

create or replace function public.unlock_lead_contact(
  p_pro_user_id uuid,
  p_request_id uuid
)
returns table (
  ok boolean,
  already_purchased boolean,
  request_id uuid,
  public_slug text,
  price_fixas integer,
  balance_after integer,
  customer_name text,
  street_address text,
  phone_country_code text,
  phone_number text,
  full_phone text,
  email text
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_request public.service_requests%rowtype;
  v_balance integer;
  v_price integer;
  v_balance_after integer;
  v_already_purchased boolean;
begin
  select sr.*
  into v_request
  from public.service_requests sr
  where sr.id = p_request_id
  for update;

  if not found then
    raise exception 'Lead not found.';
  end if;

  insert into public.user_fixa_accounts (
    user_id,
    balance,
    updated_at
  )
  values (
    p_pro_user_id,
    0,
    now()
  )
  on conflict (user_id) do nothing;

  select ufa.balance
  into v_balance
  from public.user_fixa_accounts ufa
  where ufa.user_id = p_pro_user_id
  for update;

  if not found then
    raise exception 'FIXA account not found.';
  end if;

  select exists (
    select 1
    from public.pro_lead_access pla
    where pla.pro_user_id = p_pro_user_id
      and pla.request_id = p_request_id
  )
  into v_already_purchased;

  if v_already_purchased then
    return query
    select
      true,
      true,
      v_request.id,
      v_request.public_slug,
      0,
      v_balance,
      rc.customer_name,
      rc.street_address,
      rc.phone_country_code,
      rc.phone_number,
      rc.full_phone,
      rc.email
    from public.request_contacts rc
    where rc.request_id = v_request.id;

    return;
  end if;

  if v_request.status <> 'open' then
    raise exception 'Lead is no longer open for new unlocks.';
  end if;

  if v_request.lead_status <> 'available' then
    raise exception 'Lead is no longer available.';
  end if;

  if v_request.purchase_count >= v_request.max_purchases then
    raise exception 'Lead purchase limit reached.';
  end if;

  v_price := greatest(coalesce(v_request.lead_price_fixas, 0), 1);

  if v_balance < v_price then
    raise exception 'Insufficient FIXA balance.';
  end if;

  v_balance_after := v_balance - v_price;

  update public.user_fixa_accounts ufa
  set
    balance = v_balance_after,
    updated_at = now()
  where ufa.user_id = p_pro_user_id;

  insert into public.pro_lead_access (
    request_id,
    pro_user_id,
    access_type,
    price_fixas,
    purchased_at
  )
  values (
    v_request.id,
    p_pro_user_id,
    'lead_purchase',
    v_price,
    now()
  );

  insert into public.fixa_transactions (
    user_id,
    amount,
    transaction_type,
    request_id,
    related_user_id,
    balance_after,
    created_at
  )
  values (
    p_pro_user_id,
    -v_price,
    'lead_purchase',
    v_request.id,
    v_request.customer_user_id,
    v_balance_after,
    now()
  );

  update public.service_requests sr
  set
    purchase_count = sr.purchase_count + 1,
    lead_status = case
      when sr.purchase_count + 1 >= sr.max_purchases then 'sold_out'
      else sr.lead_status
    end
  where sr.id = v_request.id;

  return query
  select
    true,
    false,
    v_request.id,
    v_request.public_slug,
    v_price,
    v_balance_after,
    rc.customer_name,
    rc.street_address,
    rc.phone_country_code,
    rc.phone_number,
    rc.full_phone,
    rc.email
  from public.request_contacts rc
  where rc.request_id = v_request.id;
end;
$$;
