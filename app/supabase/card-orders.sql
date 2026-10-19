-- LumoCard physical-card purchase requests
-- Run this once in Supabase SQL Editor for the same project used by the app.

create table if not exists public.card_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  requested_color text not null check (requested_color in ('#4B5BA8', '#111111', '#7416A6', '#888888', '#7A2B20')),
  phone_number text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'activated')),
  assigned_color text check (assigned_color is null or assigned_color in ('#4B5BA8', '#111111', '#7416A6', '#888888', '#7A2B20')),
  physical_card_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists card_orders_user_created_idx
  on public.card_orders (user_id, created_at desc);

create index if not exists card_orders_status_created_idx
  on public.card_orders (status, created_at desc);

alter table public.card_orders enable row level security;

-- No client-side table policies are added intentionally.
-- The API verifies the customer's Supabase access token and uses a server-side
-- secret to read/write orders. Only /api/admin/card-orders accepts admin actions.
