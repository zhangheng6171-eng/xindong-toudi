import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 服务端 Supabase 客户端 - 使用 Service Role Key
// 注意：此客户端仅用于服务端 API，不要在前端使用

let cachedClient: SupabaseClient | null = null

/**
 * 获取 Supabase Admin 客户端（延迟初始化）
 * 在运行时才创建客户端，避免构建时环境变量不存在的问题
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) {
    return cachedClient
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  
  cachedClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  })
  
  return cachedClient
}

// 为了向后兼容，导出一个 getter
export const supabaseAdmin = {
  get from() {
    return getSupabaseAdmin().from.bind(getSupabaseAdmin())
  },
  get auth() {
    return getSupabaseAdmin().auth
  },
  get storage() {
    return getSupabaseAdmin().storage
  },
  get rpc() {
    return getSupabaseAdmin().rpc.bind(getSupabaseAdmin())
  }
}

// 重新导出类型
export type { SupabaseClient }
