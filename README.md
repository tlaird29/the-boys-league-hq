# The Boys League HQ — starter project

A responsive, static front-end prototype for a private 10-team Yahoo Fantasy Football league archive (2020–2026). This is a visual/product foundation only: it is not connected to Yahoo, does not contain real league statistics, and is not deployed.

## Run locally

Open `public/index.html` in a browser. No build step is required for this prototype.

## Included

- Brand direction: mint, light blue, black, white; bold sports-media typography.
- Navigation for Overview, History, Record Book, Managers, Awards, and Newsletter.
- Seven season archive placeholders (2020–2026).
- Commissioner Control Center concept with explicit connection-pending status.
- Award catalog and planned Wednesday newsletter workflow.
- Initial database model in `supabase/schema.sql`.
- Yahoo integration plan in `docs/YAHOO-INTEGRATION.md`.

## Important status

No Yahoo OAuth credentials, Supabase project, database, user accounts, sync jobs, email delivery, or hosted website have been configured. Do not put Yahoo client secrets or Supabase service-role keys in browser code. The app must use server-side OAuth and server-side Yahoo API requests, with commissioner authorization enforced server-side and through database row-level security.

## Next milestones

1. Submit Yahoo's API access request and wait for approval.
2. Create Supabase project; apply schema and enable RLS policies.
3. Build server-side Yahoo OAuth callback and token storage.
4. Discover the user's league and import each season from 2020–2026, validating season-by-season completeness.
5. Build calculations and reconcile against Yahoo's standings/matchups before publishing records.
6. Add commissioner login, review queue, weekly sync, newsletter editor, and email delivery.
7. Deploy to a hosting provider after secrets and access controls are configured.
