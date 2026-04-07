-- 修复：允许与前端 / lib/validation 一致的三态
-- 在 Supabase → SQL Editor 中整段执行

alter table public.tasks
  drop constraint if exists tasks_status_check;

alter table public.tasks
  add constraint tasks_status_check
  check (status in ('pending', 'in_progress', 'completed'));
