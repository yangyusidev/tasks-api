import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * 服务端 Supabase 客户端。API Route 使用 SUPABASE_SERVICE_ROLE_KEY 可绕过 RLS；
 * 若仅用 anon key，请在 Supabase 控制台为 tasks 表配置合适 RLS。
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "缺少环境变量：请设置 NEXT_PUBLIC_SUPABASE_URL 以及 SUPABASE_SERVICE_ROLE_KEY（推荐）或 NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  if (!cached) {
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return cached;
}
