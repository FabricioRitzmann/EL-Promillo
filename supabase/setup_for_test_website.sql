-- Wallet Pass Studio: Komplett-Setup für Supabase (Testwebseite)
-- 1) Gesamten Inhalt in den Supabase SQL Editor kopieren
-- 2) PLACEHOLDER-Werte unten anpassen (SUPABASE_URL, SUPABASE_ANON_KEY)
-- 3) Ausführen

create extension if not exists pgcrypto;

create table if not exists public.passes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  template text not null check (template in ('generic', 'boardingPass', 'eventTicket', 'coupon', 'storeCard')),
  organization_name text not null,
  description text,
  background_color text not null default '#0f172a',
  foreground_color text not null default '#f8fafc',
  label_color text not null default '#94a3b8',
  barcode_message text,
  owner_id uuid not null default auth.uid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pass_fields (
  id bigint generated always as identity primary key,
  pass_id uuid not null references public.passes(id) on delete cascade,
  key text not null,
  value text,
  created_at timestamptz not null default timezone('utc', now()),
  unique(pass_id, key)
);

create table if not exists public.pass_assets (
  id bigint generated always as identity primary key,
  pass_id uuid not null references public.passes(id) on delete cascade,
  asset_type text not null check (asset_type in ('icon', 'logo', 'strip', 'thumbnail', 'background', 'footer')),
  file_path text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.supabase_connections (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  supabase_url text not null,
  supabase_anon_key text not null,
  is_active boolean not null default false,
  owner_id uuid not null default auth.uid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_supabase_connections_one_active
on public.supabase_connections(owner_id)
where is_active = true;

create index if not exists idx_passes_owner_updated on public.passes (owner_id, updated_at desc);
create index if not exists idx_pass_fields_pass_id on public.pass_fields (pass_id);
create index if not exists idx_pass_assets_pass_id on public.pass_assets (pass_id);
create index if not exists idx_supabase_connections_owner_name on public.supabase_connections (owner_id, name);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_passes_updated_at on public.passes;
create trigger trg_passes_updated_at
before update on public.passes
for each row
execute function public.set_updated_at();

drop trigger if exists trg_supabase_connections_updated_at on public.supabase_connections;
create trigger trg_supabase_connections_updated_at
before update on public.supabase_connections
for each row
execute function public.set_updated_at();

alter table public.passes enable row level security;
alter table public.pass_fields enable row level security;
alter table public.pass_assets enable row level security;
alter table public.supabase_connections enable row level security;

drop policy if exists "passes_select_own" on public.passes;
create policy "passes_select_own"
on public.passes
for select
using (owner_id = auth.uid());

drop policy if exists "passes_insert_own" on public.passes;
create policy "passes_insert_own"
on public.passes
for insert
with check (owner_id = auth.uid());

drop policy if exists "passes_update_own" on public.passes;
create policy "passes_update_own"
on public.passes
for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "passes_delete_own" on public.passes;
create policy "passes_delete_own"
on public.passes
for delete
using (owner_id = auth.uid());

drop policy if exists "pass_fields_select_own" on public.pass_fields;
create policy "pass_fields_select_own"
on public.pass_fields
for select
using (
  exists (
    select 1
    from public.passes p
    where p.id = pass_id and p.owner_id = auth.uid()
  )
);

drop policy if exists "pass_fields_insert_own" on public.pass_fields;
create policy "pass_fields_insert_own"
on public.pass_fields
for insert
with check (
  exists (
    select 1
    from public.passes p
    where p.id = pass_id and p.owner_id = auth.uid()
  )
);

drop policy if exists "pass_fields_update_own" on public.pass_fields;
create policy "pass_fields_update_own"
on public.pass_fields
for update
using (
  exists (
    select 1
    from public.passes p
    where p.id = pass_id and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.passes p
    where p.id = pass_id and p.owner_id = auth.uid()
  )
);

drop policy if exists "pass_fields_delete_own" on public.pass_fields;
create policy "pass_fields_delete_own"
on public.pass_fields
for delete
using (
  exists (
    select 1
    from public.passes p
    where p.id = pass_id and p.owner_id = auth.uid()
  )
);

drop policy if exists "pass_assets_select_own" on public.pass_assets;
create policy "pass_assets_select_own"
on public.pass_assets
for select
using (
  exists (
    select 1
    from public.passes p
    where p.id = pass_id and p.owner_id = auth.uid()
  )
);

drop policy if exists "pass_assets_insert_own" on public.pass_assets;
create policy "pass_assets_insert_own"
on public.pass_assets
for insert
with check (
  exists (
    select 1
    from public.passes p
    where p.id = pass_id and p.owner_id = auth.uid()
  )
);

drop policy if exists "pass_assets_update_own" on public.pass_assets;
create policy "pass_assets_update_own"
on public.pass_assets
for update
using (
  exists (
    select 1
    from public.passes p
    where p.id = pass_id and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.passes p
    where p.id = pass_id and p.owner_id = auth.uid()
  )
);

drop policy if exists "pass_assets_delete_own" on public.pass_assets;
create policy "pass_assets_delete_own"
on public.pass_assets
for delete
using (
  exists (
    select 1
    from public.passes p
    where p.id = pass_id and p.owner_id = auth.uid()
  )
);

drop policy if exists "supabase_connections_select_own" on public.supabase_connections;
create policy "supabase_connections_select_own"
on public.supabase_connections
for select
using (owner_id = auth.uid());

drop policy if exists "supabase_connections_insert_own" on public.supabase_connections;
create policy "supabase_connections_insert_own"
on public.supabase_connections
for insert
with check (owner_id = auth.uid());

drop policy if exists "supabase_connections_update_own" on public.supabase_connections;
create policy "supabase_connections_update_own"
on public.supabase_connections
for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "supabase_connections_delete_own" on public.supabase_connections;
create policy "supabase_connections_delete_own"
on public.supabase_connections
for delete
using (owner_id = auth.uid());

-- Optionale Startkonfiguration: aktive Verbindung in der DB speichern.
-- Werte ersetzen!
insert into public.supabase_connections (
  name,
  supabase_url,
  supabase_anon_key,
  is_active
)
values (
  'wallet-pass-studio-main',
  'https://DEIN-PROJEKT.supabase.co',
  'DEIN_SUPABASE_ANON_KEY',
  true
)
on conflict (name)
do update set
  supabase_url = excluded.supabase_url,
  supabase_anon_key = excluded.supabase_anon_key,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());

-- Sicherstellen, dass pro User nur eine Verbindung aktiv bleibt.
update public.supabase_connections
set is_active = (name = 'wallet-pass-studio-main')
where owner_id = auth.uid();
