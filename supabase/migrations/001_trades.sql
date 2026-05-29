-- Run this in Supabase SQL Editor
-- (or use Prisma: `npx prisma db push`)

create extension if not exists "uuid-ossp";

create table if not exists trades (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,

  -- Instrument & direction
  symbol      text    not null,
  side        text    not null check (side in ('LONG','SHORT')),

  -- Sizing
  leverage    numeric(8,2)  default 1,
  size        numeric(18,5) not null,       -- position size (contracts / units)

  -- Prices
  entry       numeric(18,5) not null,
  exit        numeric(18,5),
  take_profit numeric(18,5),                -- TP
  stop_loss   numeric(18,5),                -- SL
  stop_profit numeric(18,5),                -- SP (trailing / break-even level)

  -- Results
  pnl         numeric(18,2),                -- P&L in $
  fees        numeric(18,2) default 0,

  -- Strategy
  plan        text,                         -- the plan / setup write-up
  notes       text,
  session     text check (session in ('LONDON','NEW_YORK','ASIA','OUTSIDE')),
  tags        text[] default '{}',

  entry_at    timestamptz not null default now(),
  exit_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists trades_user_idx       on trades(user_id);
create index if not exists trades_entry_at_idx   on trades(entry_at desc);

-- Row Level Security
alter table trades enable row level security;

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
