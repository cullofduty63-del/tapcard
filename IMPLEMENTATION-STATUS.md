# LumoCard implementation status (2026-10-20)

## Changes included in this package
- Monochrome styling pass remains in `app/globals.css`; the existing login mascot and password-covering animation are retained.
- App library now includes more Iranian and international services, more categories, custom links, local persistence across reloads, and JSON export of selected links.
- Game page uses the `play_lumocard_game` Supabase RPC instead of selecting prizes with `Math.random()` in the browser. It explains login/configuration errors and never claims a client-side result is a real reward.
- `supabase/loyalty-game-engine.sql` adds known game slugs (inactive until configured), a server-side prize selection function, conditional stock decrement, and restrictions on direct client writes to reward-critical tables.
- Reference screenshots are preserved in `design-reference/screenshots/` for page-by-page implementation.

## Required setup before real game play
1. Run `supabase/loyalty-game-engine.sql` in the same Supabase project where the seven loyalty/store tables and their SELECT policies were created.
2. Add prizes for each game with valid probabilities. For each game, the sum of active, in-stock prize probabilities must not exceed 100%.
3. Configure/activate the game and its prizes through a trusted admin workflow; do not expose service-role credentials in browser code.
4. Test the function while authenticated and verify that stock is decremented once, histories are recorded, and anonymous calls fail.

## Not represented as complete
- App selections/custom links currently persist in the current browser and export to JSON; they are not yet synced into `profile_links` for the signed-in account.
- The loyalty balance UI is not yet wired to live account/transaction data.
- Store checkout/payment provider verification and order-state transitions are not implemented by this pass.
- A full browser build/deploy test was not run in this environment because package installation timed out before Next.js dependencies became available.

Keep the existing deployed site unchanged until dependencies install and the full build, login, profile save, game RPC, RLS and mobile checks pass.
