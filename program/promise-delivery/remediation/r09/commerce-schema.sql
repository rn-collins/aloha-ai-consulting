-- R09 Unit 9 commercial persistence contract. Apply only to the dedicated
-- server-side Supabase project after review. No table grants are made to anon.
create extension if not exists pgcrypto;

create table if not exists commerce_orders (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider = 'stripe'),
  provider_checkout_id text not null unique,
  provider_payment_id text unique,
  idempotency_key text not null unique,
  product_id text not null,
  artifact_name text not null,
  artifact_version text not null,
  price_id text not null,
  amount_total integer not null check (amount_total >= 0),
  currency text not null check (currency ~ '^[a-z]{3}$'),
  purchaser_email text,
  licensee_name text,
  license_scope text not null default 'named-organization-internal-use',
  state text not null check (state in ('checkout-started','payment-failed','payment-succeeded','fulfillment-pending','fulfilled','refunded','superseded')),
  private_blob_path text,
  manifest_sha256 text,
  paid_at timestamptz,
  fulfilled_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists commerce_events (
  provider_event_id text primary key,
  event_type text not null,
  order_id uuid references commerce_orders(id),
  payload_sha256 text not null,
  processed_at timestamptz not null default now(),
  outcome text not null
);

create table if not exists commerce_deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references commerce_orders(id),
  kind text not null check (kind in ('initial','redelivery')),
  token_jti_hash text not null unique,
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists commerce_audit_log (
  id bigint generated always as identity primary key,
  order_id uuid references commerce_orders(id),
  action text not null,
  actor text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table commerce_orders enable row level security;
alter table commerce_events enable row level security;
alter table commerce_deliveries enable row level security;
alter table commerce_audit_log enable row level security;

-- Intentionally no public policies. Commerce functions use the service role.
create index if not exists commerce_orders_email_idx on commerce_orders (lower(purchaser_email));
create index if not exists commerce_deliveries_order_idx on commerce_deliveries (order_id, created_at desc);
