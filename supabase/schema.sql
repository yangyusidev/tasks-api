-- 在 Supabase SQL Editor 中执行，或使用 CLI 迁移

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.tasks (id) on delete cascade,
  title text not null,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists tasks_created_at_desc on public.tasks (created_at desc);

-- 若使用 anon key + RLS，请按需开启并编写策略；使用 service role 的 API Route 可暂不启用 RLS（仅限服务端密钥保密）。
