-- Initial Supabase/Postgres schema. Apply only after creating a Supabase project.
create extension if not exists pgcrypto;

create table if not exists seasons (
  id uuid primary key default gen_random_uuid(),
  season_year integer not null unique,
  yahoo_game_key text,
  yahoo_league_key text,
  status text not null default 'pending' check (status in ('pending','importing','needs_review','verified','failed')),
  imported_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists managers (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  yahoo_user_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id) on delete cascade,
  manager_id uuid references managers(id),
  yahoo_team_key text,
  team_name text not null,
  final_rank integer,
  wins integer,
  losses integer,
  ties integer default 0,
  points_for numeric(10,2),
  points_against numeric(10,2),
  unique(season_id, yahoo_team_key)
);
create table if not exists matchups (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id) on delete cascade,
  week integer not null,
  matchup_key text,
  team1_id uuid not null references teams(id),
  team2_id uuid not null references teams(id),
  team1_score numeric(10,2),
  team2_score numeric(10,2),
  is_playoff boolean not null default false,
  is_final boolean not null default true,
  unique(season_id, week, matchup_key)
);
create table if not exists roster_entries (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  week integer not null,
  yahoo_player_key text not null,
  player_name text not null,
  position text,
  selected_position text,
  points numeric(10,2),
  is_starter boolean not null default false
);
create table if not exists draft_picks (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  round integer,
  pick_number integer,
  yahoo_player_key text,
  player_name text,
  position text
);
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id) on delete cascade,
  yahoo_transaction_key text,
  transaction_type text,
  transaction_time timestamptz,
  team_id uuid references teams(id),
  details jsonb not null default '{}'::jsonb
);
create table if not exists awards (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id) on delete cascade,
  award_slug text not null,
  award_name text not null,
  winner_team_id uuid references teams(id),
  winner_manager_id uuid references managers(id),
  value jsonb not null default '{}'::jsonb,
  selection_type text not null default 'automatic' check (selection_type in ('automatic','commissioner')),
  unique(season_id, award_slug)
);
create table if not exists newsletter_issues (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id) on delete cascade,
  week integer not null,
  title text not null,
  body_markdown text not null default '',
  status text not null default 'draft' check (status in ('draft','review','published')),
  published_at timestamptz,
  unique(season_id, week)
);
create table if not exists import_snapshots (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id) on delete cascade,
  resource_path text not null,
  payload jsonb not null,
  fetched_at timestamptz not null default now()
);
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  target_table text,
  target_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS now; add production policies after auth roles and commissioner allowlist are configured.
alter table seasons enable row level security;
alter table managers enable row level security;
alter table teams enable row level security;
alter table matchups enable row level security;
alter table roster_entries enable row level security;
alter table draft_picks enable row level security;
alter table transactions enable row level security;
alter table awards enable row level security;
alter table newsletter_issues enable row level security;
alter table import_snapshots enable row level security;
alter table audit_log enable row level security;

-- Deliberately no permissive policies yet: database access is denied until explicit production policies are added.
