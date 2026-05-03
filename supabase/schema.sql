-- ============================================================
-- Pass Studio - Supabase SQL Setup
-- Diesen gesamten SQL-Block direkt im Supabase SQL Editor ausführen.
-- ============================================================

create extension if not exists pgcrypto;

-- 1) Tabelle für Karten
create table if not exists public.wallet_passes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subtitle text,
  description text,
  qr_content text not null,
  business_name text,
  business_category text not null default 'restaurant',
  template_storage_path text,
  template_id text not null default 'vip-membership',
  icon_id text not null default 'gift',
  background_template_id text not null default 'custom',
  background_color text not null default '#1d1d1f',
  foreground_color text not null default '#ffffff',
  custom_image_url text,
  custom_icon_url text,
  custom_banner_url text,
  banner_enabled boolean not null default false,
  banner_text text,
  banner_preset text,
  banner_background_color text,
  banner_text_color text,
  banner_shape text not null default 'pill',
  banner_width integer not null default 60,
  banner_height integer not null default 42,
  banner_position_x integer not null default 4,
  banner_position_y integer not null default 4,
  card_program_type text not null default 'generic',
  program_config jsonb not null default '{}'::jsonb,
  push_enabled boolean not null default false,
  notification_rules jsonb not null default '[]'::jsonb,
  passkit_enabled boolean not null default false,
  passkit_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1b) Falls die Tabelle schon existiert: neue Felder ergänzen
alter table public.wallet_passes
  add column if not exists business_name text,
  add column if not exists business_category text not null default 'restaurant',
  add column if not exists template_storage_path text,
  add column if not exists icon_id text not null default 'gift',
  add column if not exists background_template_id text not null default 'custom',
  add column if not exists card_program_type text not null default 'generic',
  add column if not exists program_config jsonb not null default '{}'::jsonb,
  add column if not exists push_enabled boolean not null default false,
  add column if not exists notification_rules jsonb not null default '[]'::jsonb,
  add column if not exists passkit_enabled boolean not null default false,
  add column if not exists passkit_config jsonb not null default '{}'::jsonb,
  add column if not exists banner_enabled boolean not null default false,
  add column if not exists banner_text text,
  add column if not exists banner_preset text,
  add column if not exists banner_background_color text,
  add column if not exists banner_text_color text,
  add column if not exists custom_icon_url text,
  add column if not exists custom_banner_url text,
  add column if not exists banner_shape text not null default 'pill',
  add column if not exists banner_width integer not null default 60,
  add column if not exists banner_height integer not null default 42,
  add column if not exists banner_position_x integer not null default 4,
  add column if not exists banner_position_y integer not null default 4;

-- 1c) Statistik pro abgeschlossene Stempelkarte/Streak Karte
create table if not exists public.pass_completion_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pass_id uuid not null references public.wallet_passes(id) on delete cascade,
  pass_title text not null,
  completed_at timestamptz not null default now()
);

alter table public.pass_completion_stats enable row level security;

create policy "Users can view own pass stats"
on public.pass_completion_stats
for select
using (auth.uid() = user_id);

create policy "Users can insert own pass stats"
on public.pass_completion_stats
for insert
with check (auth.uid() = user_id);


-- 1d) Individuelle Wallet-Instanzen je Endnutzer (ohne private Klardaten)
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

create policy "Businesses can view own wallet instances"
on public.wallet_pass_instances
for select
using (auth.uid() = business_user_id);

create policy "Businesses can insert own wallet instances"
on public.wallet_pass_instances
for insert
with check (auth.uid() = business_user_id);

create policy "Businesses can update own wallet instances"
on public.wallet_pass_instances
for update
using (auth.uid() = business_user_id)
with check (auth.uid() = business_user_id);

-- 1e) Scan-/Punkte-Events je Wallet-Instanz
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

create policy "Businesses can view own scan events"
on public.pass_scan_events
for select
using (auth.uid() = business_user_id);

create policy "Businesses can insert own scan events"
on public.pass_scan_events
for insert
with check (auth.uid() = business_user_id);

-- 1f) Lesbare, anonymisierte Statistik pro Betrieb/Karte
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

-- 2) Updated-At Trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists wallet_passes_set_updated_at on public.wallet_passes;
create trigger wallet_passes_set_updated_at
before update on public.wallet_passes
for each row
execute function public.set_updated_at();

-- 3) RLS aktivieren
alter table public.wallet_passes enable row level security;

-- 4) Policies: jeder Nutzer sieht/ändert nur seine eigenen Karten
create policy "Users can view own passes"
on public.wallet_passes
for select
using (auth.uid() = user_id);

create policy "Users can insert own passes"
on public.wallet_passes
for insert
with check (auth.uid() = user_id);

create policy "Users can update own passes"
on public.wallet_passes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own passes"
on public.wallet_passes
for delete
using (auth.uid() = user_id);

-- 5) Bucket für eigene Hintergrundbilder
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pass-backgrounds',
  'pass-backgrounds',
  true,
  5242880,
  array['image/png', 'image/jpeg']::text[]
)
on conflict (id) do nothing;

-- 6) Storage RLS: User nur im eigenen Ordner (<user_id>/...)
create policy "Public read pass backgrounds"
on storage.objects
for select
using (bucket_id = 'pass-backgrounds');

create policy "Users upload own background"
on storage.objects
for insert
with check (
  bucket_id = 'pass-backgrounds'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users update own background"
on storage.objects
for update
using (
  bucket_id = 'pass-backgrounds'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'pass-backgrounds'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users delete own background"
on storage.objects
for delete
using (
  bucket_id = 'pass-backgrounds'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- 7) Optional: Hinweis zu OTP/Passwort Reset
-- OTP/Reset-E-Mail wird über Supabase Auth API ausgelöst
-- (auth.resetPasswordForEmail im Frontend).
