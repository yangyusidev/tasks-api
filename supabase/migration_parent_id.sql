-- 已有库在 Supabase SQL Editor 中执行一次

alter table public.tasks
  add column if not exists parent_id uuid references public.tasks (id) on delete cascade;

create index if not exists tasks_parent_id_idx on public.tasks (parent_id);
