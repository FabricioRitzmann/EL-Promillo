-- ============================================================
-- Pass Studio - Supabase SQL Setup
-- Diesen gesamten SQL-Block direkt im Supabase SQL Editor ausführen.
-- ============================================================

-- 1) Tabelle für Karten
create table if not exists public.wallet_passes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subtitle text,
  description text,
  qr_content text not null,
  template_id text not null default 'dark-glass',
  background_color text not null default '#1d1d1f',
  foreground_color text not null default '#ffffff',
  custom_image_url text,
  card_program_type text not null default 'generic',
  program_config jsonb not null default '{}'::jsonb,
  push_enabled boolean not null default false,
  notification_rules jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1b) Falls die Tabelle schon existiert: neue Felder ergänzen
alter table public.wallet_passes
  add column if not exists card_program_type text not null default 'generic',
  add column if not exists program_config jsonb not null default '{}'::jsonb,
  add column if not exists push_enabled boolean not null default false,
  add column if not exists notification_rules jsonb not null default '[]'::jsonb;

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
