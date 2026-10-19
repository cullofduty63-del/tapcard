-- LumoCard loyalty / prize campaigns starter schema.
-- Review and adapt RLS policies to your auth model before production.
create extension if not exists pgcrypto;

create table if not exists public.loyalty_campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  game_type text not null check (game_type in ('dice','egg','wheel','box','scratch','envelope','balloon','safe','coin','target','slots')),
  starts_at timestamptz,
  ends_at timestamptz,
  attempts_per_customer integer not null default 1 check (attempts_per_customer between 1 and 100),
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.loyalty_prizes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.loyalty_campaigns(id) on delete cascade,
  title text not null,
  prize_type text not null default 'discount' check (prize_type in ('discount','points','gift','coupon','none')),
  probability numeric(7,4) not null default 0 check (probability >= 0 and probability <= 100),
  stock_total integer check (stock_total is null or stock_total >= 0),
  stock_remaining integer check (stock_remaining is null or stock_remaining >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.loyalty_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid references auth.users(id) on delete set null,
  customer_label text,
  points_balance integer not null default 0 check (points_balance >= 0),
  tier text not null default 'standard',
  created_at timestamptz not null default now(),
  unique(owner_id, customer_id)
);

create table if not exists public.loyalty_point_transactions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.loyalty_members(id) on delete cascade,
  points_delta integer not null check (points_delta <> 0),
  reason text not null,
  reference_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.loyalty_game_plays (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.loyalty_campaigns(id) on delete cascade,
  member_id uuid references public.loyalty_members(id) on delete set null,
  prize_id uuid references public.loyalty_prizes(id) on delete set null,
  outcome_label text not null,
  created_at timestamptz not null default now()
);

alter table public.loyalty_campaigns enable row level security;
alter table public.loyalty_prizes enable row level security;
alter table public.loyalty_members enable row level security;
alter table public.loyalty_point_transactions enable row level security;
alter table public.loyalty_game_plays enable row level security;

-- Owner can manage their campaigns and prizes. Do not let clients directly write game results or balances.
create policy "Owners manage loyalty campaigns" on public.loyalty_campaigns
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Owners manage loyalty prizes" on public.loyalty_prizes
  for all using (exists (select 1 from public.loyalty_campaigns c where c.id = campaign_id and c.owner_id = auth.uid()))
  with check (exists (select 1 from public.loyalty_campaigns c where c.id = campaign_id and c.owner_id = auth.uid()));
create policy "Owners view loyalty members" on public.loyalty_members
  for select using (auth.uid() = owner_id);
create policy "Owners view point transactions" on public.loyalty_point_transactions
  for select using (exists (select 1 from public.loyalty_members m where m.id = member_id and m.owner_id = auth.uid()));
create policy "Owners view game plays" on public.loyalty_game_plays
  for select using (exists (select 1 from public.loyalty_campaigns c where c.id = campaign_id and c.owner_id = auth.uid()));

-- Important: prize selection, stock decrement, attempt limits, point updates and payment validation
-- must be implemented atomically in a trusted server-side API/RPC before real rewards are enabled.
