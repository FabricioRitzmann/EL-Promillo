-- Supabase SQL Setup für das Kanban-Board (pro User genau ein Board-JSON)
create extension if not exists pgcrypto;

create table if not exists public.kanban_boards (
  user_id uuid primary key references auth.users(id) on delete cascade,
  board_state jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- updated_at automatisch pflegen
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_kanban_boards_updated_at on public.kanban_boards;
create trigger trg_kanban_boards_updated_at
before update on public.kanban_boards
for each row
execute function public.set_updated_at();

alter table public.kanban_boards enable row level security;

drop policy if exists "users can view own board" on public.kanban_boards;
create policy "users can view own board"
  on public.kanban_boards
  for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own board" on public.kanban_boards;
create policy "users can insert own board"
  on public.kanban_boards
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can update own board" on public.kanban_boards;
create policy "users can update own board"
  on public.kanban_boards
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own board" on public.kanban_boards;
create policy "users can delete own board"
  on public.kanban_boards
  for delete
  using (auth.uid() = user_id);
