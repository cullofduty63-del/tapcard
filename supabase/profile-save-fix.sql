-- LumoCard profile-save compatibility SQL
-- Run in Supabase Dashboard > SQL Editor on the same project as the website.
-- This only adds missing profile fields and owner policies; it does not delete data.

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists job text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists website text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists social_links jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists appearance jsonb not null default '{}'::jsonb;

-- Ensure the profile owner can read/update their own row.
alter table public.profiles enable row level security;
drop policy if exists "lumocard_owner_select_profile" on public.profiles;
create policy "lumocard_owner_select_profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "lumocard_owner_update_profile" on public.profiles;
create policy "lumocard_owner_update_profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Useful for username uniqueness checks. This is non-unique so existing duplicates do not break migration.
create index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));
