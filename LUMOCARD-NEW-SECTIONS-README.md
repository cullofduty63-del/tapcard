# LumoCard: app library, loyalty club and prize games

New routes added to the existing Next.js source:
- `/apps` — searchable/filterable app directory with service badges.
- `/club` — customer loyalty feature overview.
- `/games` — interactive front-end demos for dice, lucky egg, wheel, box, scratch card, envelope, balloon, safe, coin, target and slots.

The dashboard sidebar links to these sections.

## Current implementation status
- The app badges are branded text/icon badges, not official trademark image files.
- The app selections and game outcomes are client-side demonstrations and do not persist to Supabase.
- No real prize, point balance or payment is granted by these pages.
- `app/supabase/loyalty-games-schema.sql` is a starter schema only. Review it in a test Supabase project before applying. It does not provide the trusted atomic prize-draw API; that API must be implemented before activating real campaigns.
- Build/deployment has not been run in this environment. Test with `npm install` then `npm run build` inside `app/` before deployment.
