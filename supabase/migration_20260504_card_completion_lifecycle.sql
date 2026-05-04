alter table public.wallet_passes
  add column if not exists is_completed boolean not null default false,
  add column if not exists completed_at timestamptz null,
  add column if not exists completed_by uuid null references auth.users(id) on delete set null,
  add column if not exists completion_source text null,
  add column if not exists completion_progress_percent numeric(5,2) null,
  add column if not exists completion_snapshot jsonb null,
  add column if not exists parent_pass_id uuid null references public.wallet_passes(id) on delete set null;

create index if not exists idx_wallet_passes_parent_pass_id on public.wallet_passes(parent_pass_id);
create index if not exists idx_wallet_passes_is_completed on public.wallet_passes(user_id, is_completed);

notify pgrst, 'reload schema';
