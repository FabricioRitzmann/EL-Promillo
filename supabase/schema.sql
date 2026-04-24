-- Wallet Pass Studio: Supabase Schema
-- Diese SQL kann direkt im Supabase SQL Editor ausgeführt werden.

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

create index if not exists idx_passes_owner_updated on public.passes (owner_id, updated_at desc);
create index if not exists idx_pass_fields_pass_id on public.pass_fields (pass_id);
create index if not exists idx_pass_assets_pass_id on public.pass_assets (pass_id);

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

alter table public.passes enable row level security;
alter table public.pass_fields enable row level security;
alter table public.pass_assets enable row level security;

-- RLS Policies: Nutzer dürfen nur ihre eigenen Daten sehen und bearbeiten.
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
