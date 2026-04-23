-- Supabase SQL Setup für das Kanban Board (pro User genau ein Board-JSON)
create extension if not exists pgcrypto;

create table if not exists public.kanban_boards (
  user_id uuid primary key references auth.users(id) on delete cascade,
  board_state jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

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
