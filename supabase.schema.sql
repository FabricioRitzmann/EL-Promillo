-- Supabase SQL Setup für die Wallet Web-App
-- Enthält Karten, Transaktionen und Angebote pro eingeloggtem User

create extension if not exists pgcrypto;

-- 1) Karten
create table if not exists public.wallet_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('loyalty', 'gift', 'membership', 'coupon')),
  balance numeric(12,2) not null default 0,
  expires_at date,
  code text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 2) Transaktionen
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid not null references public.wallet_cards(id) on delete cascade,
  kind text not null check (kind in ('charge', 'payment', 'refund')),
  amount numeric(12,2) not null check (amount > 0),
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

-- 3) Angebote / Coupons
create table if not exists public.wallet_offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  valid_until date not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- Trigger: updated_at automatisch setzen
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_wallet_cards_updated_at on public.wallet_cards;
create trigger trg_wallet_cards_updated_at
before update on public.wallet_cards
for each row
execute procedure public.set_updated_at();

-- RLS aktivieren
alter table public.wallet_cards enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.wallet_offers enable row level security;

-- Policies: wallet_cards
drop policy if exists "cards_select_own" on public.wallet_cards;
create policy "cards_select_own"
  on public.wallet_cards
  for select
  using (auth.uid() = user_id);

drop policy if exists "cards_insert_own" on public.wallet_cards;
create policy "cards_insert_own"
  on public.wallet_cards
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "cards_update_own" on public.wallet_cards;
create policy "cards_update_own"
  on public.wallet_cards
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "cards_delete_own" on public.wallet_cards;
create policy "cards_delete_own"
  on public.wallet_cards
  for delete
  using (auth.uid() = user_id);

-- Policies: wallet_transactions
drop policy if exists "transactions_select_own" on public.wallet_transactions;
create policy "transactions_select_own"
  on public.wallet_transactions
  for select
  using (auth.uid() = user_id);

drop policy if exists "transactions_insert_own" on public.wallet_transactions;
create policy "transactions_insert_own"
  on public.wallet_transactions
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "transactions_update_own" on public.wallet_transactions;
create policy "transactions_update_own"
  on public.wallet_transactions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "transactions_delete_own" on public.wallet_transactions;
create policy "transactions_delete_own"
  on public.wallet_transactions
  for delete
  using (auth.uid() = user_id);

-- Policies: wallet_offers
drop policy if exists "offers_select_own" on public.wallet_offers;
create policy "offers_select_own"
  on public.wallet_offers
  for select
  using (auth.uid() = user_id);

drop policy if exists "offers_insert_own" on public.wallet_offers;
create policy "offers_insert_own"
  on public.wallet_offers
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "offers_update_own" on public.wallet_offers;
create policy "offers_update_own"
  on public.wallet_offers
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "offers_delete_own" on public.wallet_offers;
create policy "offers_delete_own"
  on public.wallet_offers
  for delete
  using (auth.uid() = user_id);

-- Performance (Indexe)
create index if not exists idx_wallet_cards_user_id on public.wallet_cards(user_id);
create index if not exists idx_wallet_transactions_user_id on public.wallet_transactions(user_id);
create index if not exists idx_wallet_transactions_card_id on public.wallet_transactions(card_id);
create index if not exists idx_wallet_offers_user_id on public.wallet_offers(user_id);
