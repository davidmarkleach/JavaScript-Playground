-- Run this in the Supabase SQL editor to set up the database

create table if not exists games (
  code text primary key,
  players jsonb not null default '[]',
  current_player_index int not null default 0,
  log jsonb not null default '[]',
  final_round boolean not null default false,
  final_round_trigger_index int not null default -1,
  game_over boolean not null default false,
  turns_taken_in_final_round int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table games enable row level security;

-- Allow anonymous reads and writes (public game codes act as auth)
create policy "Public read" on games for select using (true);
create policy "Public insert" on games for insert with check (true);
create policy "Public update" on games for update using (true);
create policy "Public delete" on games for delete using (true);

-- Enable Realtime for live viewer subscriptions
-- In Supabase dashboard: Database > Replication > enable 'games' table

-- Auto-delete games older than 24 hours (optional cron via pg_cron extension)
-- select cron.schedule('delete-old-games', '0 * * * *', $$
--   delete from games where created_at < now() - interval '24 hours';
-- $$);
