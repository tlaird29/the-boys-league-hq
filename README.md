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

## Live integration milestone (November 2026)

Added server-only commissioner authorization, Yahoo OAuth connect/callback with CSRF state checking, encrypted server-side token persistence, refresh flow, connection status endpoint, and read-only NFL game discovery endpoint. These routes are **code only** until a Supabase project, Yahoo-approved client credentials, and deployment are configured. The league import, public live stats, scheduled newsletter and email sending are not implemented.

1. Create Supabase project; execute `supabase/schema.sql` then `supabase/002_yahoo_connections.sql` in the SQL editor.
2. Enable Supabase Auth and configure an email-based sign-in flow. The commissioner page deliberately does not include an untested login UI; authentication must be established before Yahoo authorization works.
3. Copy `.env.example` to `.env.local` and fill Supabase URL/anon key/service-role key, `COMMISSIONER_EMAIL`, Yahoo client ID/secret/redirect URI, and `TOKEN_ENCRYPTION_KEY` (e.g. `openssl rand -hex 32`). Never commit `.env.local`.
4. Install Node.js 20+; run `npm install` and `npm run dev`. The Yahoo callback URI must match the developer app's registered redirect URI exactly. For production set it to `https://YOUR_DOMAIN/api/yahoo/callback`.
5. After sign-in, open `/commissioner` and use Authorize Yahoo. The `/api/yahoo/preview` endpoint reads NFL game information as a smoke test. No write calls to Yahoo are implemented.

Security note: Keep Supabase service-role key and Yahoo client secret server-side. Production launch requires a tested Supabase sign-in route, secure deployment, and end-to-end integration testing. Do not expose private data to unauthenticated viewers.
