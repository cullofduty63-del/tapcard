# LumoCard — Screenshot implementation notes

This update follows the supplied 12 reference screenshots while keeping the requested black/silver theme.

## Updated
- Rebuilt `/club` as an authenticated loyalty overview that reads the signed-in customer's membership and recent point transactions from Supabase.
- Added `app/supabase/loyalty-customer-access.sql` to grant authenticated customers read-only access to their own loyalty membership and transaction history. Run this after `loyalty-games-schema.sql` in Supabase SQL Editor.
- Refined `/apps` library marks into consistent monochrome branded-style tiles, removed the duplicated category filter, and retained search, category filtering, custom links and local persistence.
- Preserved the rest of the supplied project and existing dashboard routes.

## Important limitations
- `/apps` choices and custom links still use browser localStorage; they are not yet synced to `profile_links` in Supabase.
- Loyalty balances and history show real data only after the relevant tables exist, RLS migration is applied, and a membership/transactions have been created. The page does not award points or prizes itself.
- No bank account/PIN/CVV/OTP data is collected. Do not put PIN, CVV2 or one-time passwords into profile fields. A bank-card number should never be public by default.
- This source update has not been validated by a production build or deployment in this environment.
