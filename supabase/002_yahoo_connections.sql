-- Apply AFTER schema.sql. Tokens are encrypted in application code before storage.
create table if not exists yahoo_connections (
 user_id uuid primary key references auth.users(id) on delete cascade,
 access_token_encrypted text not null,
 refresh_token_encrypted text not null,
 expires_at timestamptz not null,
 updated_at timestamptz not null default now()
);
alter table yahoo_connections enable row level security;
-- No client-side access policies. Only the server-side service-role can access this table.
