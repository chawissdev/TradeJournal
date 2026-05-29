-- Run this in Supabase SQL Editor.
-- This creates/updates the Trade Log table for outcome-based TP/SL/SP.

create extension if not exists "uuid-ossp";

create table if not exists trades (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,

  symbol text not null,
  side text not null check (side in ('LONG', 'SHORT')),
  outcome text check (outcome in ('TP', 'SL', 'SP')),

  leverage numeric(8, 2) default 1,
  size numeric(18, 5) not null,

  entry numeric(18, 5) not null,
  exit numeric(18, 5),

  pnl numeric(18, 2),
  fees numeric(18, 2) default 0,
  holding_duration text,

  chart_url text,
  plan text,
  notes text,
  tags text[] default '{}',

  entry_at timestamptz not null default now(),
  exit_at timestamptz,
  created_at timestamptz not null default now()
);

alter table trades add column if not exists outcome text;
alter table trades add column if not exists holding_duration text;
alter table trades add column if not exists chart_url text;
alter table trades drop column if exists take_profit;
alter table trades drop column if exists stop_loss;
alter table trades drop column if exists stop_profit;
alter table trades drop column if exists session;
alter table trades drop column if exists r_multiple;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'trades_outcome_check'
  ) then
    alter table trades
      add constraint trades_outcome_check
      check (outcome in ('TP', 'SL', 'SP') or outcome is null);
  end if;
end $$;

create index if not exists trades_user_idx on trades(user_id);
create index if not exists trades_entry_at_idx on trades(entry_at desc);
create index if not exists trades_outcome_idx on trades(outcome);
-- Single-row account settings used by the editable sidebar balance.
create table if not exists account_settings (
  id text primary key default 'main',
  balance numeric(18, 2) not null default 0,
  updated_at timestamptz not null default now()
);

alter table account_settings add column if not exists balance numeric(18, 2) not null default 0;
alter table account_settings add column if not exists updated_at timestamptz not null default now();

insert into account_settings (id, balance)
values ('main', 0)
on conflict (id) do nothing;

alter table account_settings enable row level security;

drop policy if exists "owner sees account settings" on account_settings;
drop policy if exists "owner inserts account settings" on account_settings;
drop policy if exists "owner updates account settings" on account_settings;

create policy "owner sees account settings"
  on account_settings for select
  using ((auth.jwt() ->> 'email') = 'skychawiss@gmail.com');

create policy "owner inserts account settings"
  on account_settings for insert
  with check ((auth.jwt() ->> 'email') = 'skychawiss@gmail.com');

create policy "owner updates account settings"
  on account_settings for update
  using ((auth.jwt() ->> 'email') = 'skychawiss@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'skychawiss@gmail.com');

alter table trades enable row level security;

drop policy if exists "users see own trades" on trades;
drop policy if exists "users insert own trades" on trades;
drop policy if exists "users update own trades" on trades;
drop policy if exists "users delete own trades" on trades;

create policy "users see own trades"
  on trades for select
  using (auth.uid() = user_id);

create policy "users insert own trades"
  on trades for insert
  with check (auth.uid() = user_id);

create policy "users update own trades"
  on trades for update
  using (auth.uid() = user_id);

create policy "users delete own trades"
  on trades for delete
  using (auth.uid() = user_id);
