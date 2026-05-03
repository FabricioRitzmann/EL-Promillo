-- ============================================================
-- Supabase Statistik-Setup (Wallet Scans + Abschluss-Statistik)
-- Im Supabase SQL Editor ausführen.
-- ============================================================

-- Für UUIDs/Hash-Funktionen
create extension if not exists pgcrypto;

-- 1) Abschluss-Statistik (z. B. volle Stempelkarte)
create table if not exists public.pass_completion_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pass_id uuid not null references public.wallet_passes(id) on delete cascade,
  pass_title text not null,
  card_program_type text not null default 'generic',
  completed_at timestamptz not null default now()
);

alter table public.pass_completion_stats
  add column if not exists card_program_type text not null default 'generic';

alter table public.pass_completion_stats enable row level security;

create policy if not exists "Users can view own pass stats"
on public.pass_completion_stats
for select
using (auth.uid() = user_id);

create policy if not exists "Users can insert own pass stats"
on public.pass_completion_stats
for insert
with check (auth.uid() = user_id);

-- 2) Wallet-Instanzen (anonymisierte Endkunden-Referenz)
create table if not exists public.wallet_pass_instances (
  id uuid primary key default gen_random_uuid(),
  pass_id uuid not null references public.wallet_passes(id) on delete cascade,
  business_user_id uuid not null references auth.users(id) on delete cascade,
  end_user_id uuid not null references auth.users(id) on delete cascade,
  wallet_provider text not null default 'apple_wallet',
  wallet_reference_path text not null,
  customer_reference_hash text generated always as (encode(digest(end_user_id::text, 'sha256'), 'hex')) stored,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (pass_id, end_user_id)
);

alter table public.wallet_pass_instances enable row level security;

create policy if not exists "Businesses can view own wallet instances"
on public.wallet_pass_instances
for select
using (auth.uid() = business_user_id);

create policy if not exists "Businesses can insert own wallet instances"
on public.wallet_pass_instances
for insert
with check (auth.uid() = business_user_id);

create policy if not exists "Businesses can update own wallet instances"
on public.wallet_pass_instances
for update
using (auth.uid() = business_user_id)
with check (auth.uid() = business_user_id);

-- 3) Scan-/Punkte-/Stempel-Events
create table if not exists public.pass_scan_events (
  id uuid primary key default gen_random_uuid(),
  pass_instance_id uuid not null references public.wallet_pass_instances(id) on delete cascade,
  pass_id uuid not null references public.wallet_passes(id) on delete cascade,
  business_user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null default 'scan',
  points_delta integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

alter table public.pass_scan_events enable row level security;

create policy if not exists "Businesses can view own scan events"
on public.pass_scan_events
for select
using (auth.uid() = business_user_id);

create policy if not exists "Businesses can insert own scan events"
on public.pass_scan_events
for insert
with check (auth.uid() = business_user_id);

-- 4) Anonymisierte Statistik-View
create or replace view public.business_scan_stats_anonymized as
select
  e.business_user_id,
  e.pass_id,
  p.title as pass_title,
  p.business_name,
  p.business_category,
  count(*)::bigint as total_events,
  count(distinct i.customer_reference_hash)::bigint as unique_customers,
  coalesce(sum(case when e.event_type = 'stamp' then 1 else 0 end), 0)::bigint as stamp_events,
  coalesce(sum(case when e.event_type = 'points' then e.points_delta else 0 end), 0)::bigint as total_points_delta,
  max(e.occurred_at) as last_event_at
from public.pass_scan_events e
join public.wallet_pass_instances i on i.id = e.pass_instance_id
join public.wallet_passes p on p.id = e.pass_id
group by e.business_user_id, e.pass_id, p.title, p.business_name, p.business_category;

grant select on public.business_scan_stats_anonymized to authenticated;

-- 5) Performance-Indizes
create index if not exists idx_pass_scan_events_business_occurred_at
  on public.pass_scan_events (business_user_id, occurred_at desc);

create index if not exists idx_pass_scan_events_pass_id
  on public.pass_scan_events (pass_id);

create index if not exists idx_wallet_pass_instances_business
  on public.wallet_pass_instances (business_user_id);
