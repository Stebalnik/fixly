-- Fixly Supabase migration
-- Created: 2026-05-21T01:40:38Z
-- Purpose: Add atomic FIXA ledger helpers and customer pro-contact unlock RPC.
-- Safety: Adds guarded constraints/indexes and replaces functions only; no data or pricing changes.
-- Rollback notes: Drop added RPCs/indexes/constraints or restore previous application-level write flow.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_fixa_accounts_balance_nonnegative'
      and conrelid = 'public.user_fixa_accounts'::regclass
  ) then
    alter table public.user_fixa_accounts
      add constraint user_fixa_accounts_balance_nonnegative
      check (balance >= 0)
      not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'fixa_transactions_amount_nonzero'
      and conrelid = 'public.fixa_transactions'::regclass
  ) then
    alter table public.fixa_transactions
      add constraint fixa_transactions_amount_nonzero
      check (amount <> 0)
      not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'fixa_transactions_balance_after_nonnegative'
      and conrelid = 'public.fixa_transactions'::regclass
  ) then
    alter table public.fixa_transactions
      add constraint fixa_transactions_balance_after_nonnegative
      check (balance_after is null or balance_after >= 0)
      not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'service_requests_purchase_count_nonnegative'
      and conrelid = 'public.service_requests'::regclass
  ) then
    alter table public.service_requests
      add constraint service_requests_purchase_count_nonnegative
      check (purchase_count >= 0)
      not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'service_requests_max_purchases_positive'
      and conrelid = 'public.service_requests'::regclass
  ) then
    alter table public.service_requests
      add constraint service_requests_max_purchases_positive
      check (max_purchases is null or max_purchases > 0)
      not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'service_requests_purchase_count_within_max'
      and conrelid = 'public.service_requests'::regclass
  ) then
    alter table public.service_requests
      add constraint service_requests_purchase_count_within_max
      check (max_purchases is null or purchase_count <= max_purchases)
      not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'service_requests_status_allowed'
      and conrelid = 'public.service_requests'::regclass
  ) then
    alter table public.service_requests
      add constraint service_requests_status_allowed
      check (status in ('open', 'archived', 'deleted', 'closed'))
      not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'service_requests_lead_status_allowed'
      and conrelid = 'public.service_requests'::regclass
  ) then
    alter table public.service_requests
      add constraint service_requests_lead_status_allowed
      check (lead_status in ('available', 'sold_out', 'closed', 'unavailable', 'archived'))
      not valid;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from public.fixa_transactions
    where stripe_session_id is not null
    group by stripe_session_id
    having count(*) > 1
  ) then
    create unique index if not exists fixa_transactions_stripe_session_id_key
      on public.fixa_transactions (stripe_session_id)
      where stripe_session_id is not null;
  end if;
end;
$$;

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

  if p_stripe_session_id is not null then
    select ft.balance_after
    into v_balance_after
    from public.fixa_transactions ft
    where ft.stripe_session_id = p_stripe_session_id
      and ft.user_id = p_user_id
    order by ft.created_at desc
    limit 1;

    if found then
      return coalesce(v_balance_after, 0);
    end if;
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
  v_contact public.request_contacts%rowtype;
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

  select rc.*
  into v_contact
  from public.request_contacts rc
  where rc.request_id = v_request.id;

  if not found then
    raise exception 'Contact details not found.';
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
      v_contact.customer_name,
      v_contact.street_address,
      v_contact.phone_country_code,
      v_contact.phone_number,
      v_contact.full_phone,
      v_contact.email;

    return;
  end if;

  if v_request.status <> 'open' then
    raise exception 'Lead is no longer open for new unlocks.';
  end if;

  if v_request.lead_status <> 'available' then
    raise exception 'Lead is no longer available.';
  end if;

  if v_request.max_purchases is not null
    and v_request.purchase_count >= v_request.max_purchases then
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
      when sr.max_purchases is not null
        and sr.purchase_count + 1 >= sr.max_purchases then 'sold_out'
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
    v_contact.customer_name,
    v_contact.street_address,
    v_contact.phone_country_code,
    v_contact.phone_number,
    v_contact.full_phone,
    v_contact.email;
end;
$$;

create or replace function public.unlock_customer_pro_contact(
  p_customer_user_id uuid,
  p_request_id uuid,
  p_pro_user_id uuid,
  p_price_fixas integer
)
returns table (
  ok boolean,
  already_unlocked boolean,
  request_id uuid,
  public_slug text,
  status text,
  lead_status text,
  price_fixas integer,
  balance_after integer,
  company_name text,
  contact_name text,
  contact_email text,
  contact_phone text
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_request public.service_requests%rowtype;
  v_balance integer;
  v_balance_after integer;
  v_access_id uuid;
begin
  if p_price_fixas is null or p_price_fixas <= 0 then
    raise exception 'Invalid contact unlock price.';
  end if;

  if p_customer_user_id = p_pro_user_id then
    raise exception 'You cannot unlock your own contact.';
  end if;

  select sr.*
  into v_request
  from public.service_requests sr
  where sr.id = p_request_id
    and sr.customer_user_id = p_customer_user_id
  for update;

  if not found then
    raise exception 'Request not found.';
  end if;

  select cpca.id
  into v_access_id
  from public.customer_pro_contact_access cpca
  where cpca.request_id = v_request.id
    and cpca.customer_user_id = p_customer_user_id
    and cpca.pro_user_id = p_pro_user_id
  for update;

  if found then
    return query
    select
      true,
      true,
      v_request.id,
      v_request.public_slug,
      v_request.status,
      v_request.lead_status,
      0,
      null::integer,
      pp.company_name,
      pp.contact_name,
      pp.contact_email,
      pp.contact_phone
    from (select 1) seed
    left join public.pro_profiles pp on pp.user_id = p_pro_user_id;

    return;
  end if;

  if not exists (
    select 1
    from public.pro_lead_access pla
    where pla.request_id = v_request.id
      and pla.pro_user_id = p_pro_user_id
  ) then
    raise exception 'This pro has not opened your request.';
  end if;

  if v_request.status <> 'open' then
    raise exception 'This request is no longer open for new contact unlocks.';
  end if;

  if v_request.lead_status <> 'available' then
    raise exception 'This request is no longer available for new contact unlocks.';
  end if;

  if v_request.max_purchases is not null
    and v_request.purchase_count >= v_request.max_purchases then
    raise exception 'This request has reached its response limit.';
  end if;

  insert into public.user_fixa_accounts (
    user_id,
    balance,
    updated_at
  )
  values (
    p_customer_user_id,
    0,
    now()
  )
  on conflict (user_id) do nothing;

  select ufa.balance
  into v_balance
  from public.user_fixa_accounts ufa
  where ufa.user_id = p_customer_user_id
  for update;

  if not found then
    raise exception 'FIXA account not found.';
  end if;

  v_balance_after := v_balance - p_price_fixas;

  if v_balance_after < 0 then
    raise exception 'Insufficient FIXA balance.';
  end if;

  update public.user_fixa_accounts ufa
  set
    balance = v_balance_after,
    updated_at = now()
  where ufa.user_id = p_customer_user_id;

  insert into public.customer_pro_contact_access (
    request_id,
    customer_user_id,
    pro_user_id,
    price_fixas,
    created_at
  )
  values (
    v_request.id,
    p_customer_user_id,
    p_pro_user_id,
    p_price_fixas,
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
    p_customer_user_id,
    -p_price_fixas,
    'pro_contact_unlock',
    v_request.id,
    p_pro_user_id,
    v_balance_after,
    now()
  );

  return query
  select
    true,
    false,
    v_request.id,
    v_request.public_slug,
    v_request.status,
    v_request.lead_status,
    p_price_fixas,
    v_balance_after,
    pp.company_name,
    pp.contact_name,
    pp.contact_email,
    pp.contact_phone
  from (select 1) seed
  left join public.pro_profiles pp on pp.user_id = p_pro_user_id;
end;
$$;
