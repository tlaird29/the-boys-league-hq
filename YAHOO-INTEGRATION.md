# Yahoo Fantasy Sports API integration plan

## Access and permission

Use Yahoo Fantasy Sports API OAuth 2.0 with **read-only** access. Yahoo's current access application says the API provides read access only and every application is reviewed. The app must request private-user-data access for Fantasy Sports and keep the client secret server-side.

Official references:
- https://sports.yahoo.com/developer/access/
- https://sports.yahoo.com/developer/docs/

## Intended scope

This is a private, single-league companion for one 10-team friends league (2020–2026 archive). It reads league, team, player, matchup, standings, roster, draft, and transaction data to create records, season pages, manager profiles, awards, and weekly recaps. It never writes lineups, rosters, trades, waiver claims, or league settings.

## Suggested read endpoints

- `/users;use_login=1/games;game_codes=nfl` — identify available NFL games.
- `/users;use_login=1/games;game_keys={game_key}/leagues` — find leagues the authorized Yahoo account belongs to.
- `/league/{league_key}/metadata` and `/settings` — league identity and scoring/roster rules.
- `/league/{league_key}/standings` — standings.
- `/league/{league_key}/scoreboard;week={week}` — weekly matchups and scores.
- `/league/{league_key}/teams` — teams and manager metadata.
- `/team/{team_key}/roster;week={week}` — weekly rosters, including starters and bench.
- `/league/{league_key}/draftresults` — draft history.
- `/league/{league_key}/transactions` — completed adds, drops, and trades.

Only issue HTTP GET requests. Do not implement PUT, POST, or DELETE calls.

## Historical import strategy

For each season from 2020 through 2026:
1. Resolve the correct season-specific NFL game key and league key. Do not assume a league key remains the same across seasons.
2. Fetch league metadata/settings, teams, standings, draft results, and transactions.
3. Fetch every completed regular-season and playoff scoreboard week.
4. Fetch each team's weekly roster for each week where Yahoo exposes it.
5. Store raw response snapshots with import timestamp and source season for audit/reprocessing.
6. Normalize records into season/team/manager/player/matchup/roster/transaction tables.
7. Compare imported win-loss records and points against Yahoo standings and matchup totals. Flag discrepancies rather than silently adjusting.
8. Mark season as verified only after reconciliation.

Yahoo documentation lists GET support for league, team, roster, draft, and transaction reads. Actual historical availability must be tested after OAuth approval; missing historical weeks should be flagged for commissioner review.

## Security requirements

- OAuth authorization-code flow; validate state and redirect URI.
- Store access/refresh tokens encrypted server-side only.
- Never expose client secret, tokens, or service-role key to browser code.
- Supabase RLS: public/league-member reads only for approved public archive tables; commissioner-only writes for correction records and editorial content.
- Server-side commissioner allowlist; do not rely on hidden UI buttons.
- Keep an audit log for imports, manual corrections, approvals, and publication.
