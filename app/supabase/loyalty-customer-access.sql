-- Run after loyalty-games-schema.sql in Supabase SQL Editor.
-- Lets an authenticated customer read only their own membership and its transactions.
-- Owners retain the existing policies for viewing their own customers.
create policy "Customers view own loyalty membership"
on public.loyalty_members for select to authenticated
using (auth.uid() = customer_id);

create policy "Customers view own loyalty transactions"
on public.loyalty_point_transactions for select to authenticated
using (exists (
  select 1 from public.loyalty_members m
  where m.id = member_id and m.customer_id = auth.uid()
));
