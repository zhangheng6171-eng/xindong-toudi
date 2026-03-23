import { createClient } from '@supabase/supabase-js'

// 服务端 Supabase 客户端 - 使用 Service Role Key
// 注意：此客户端仅用于服务端 API，不要在前端使用
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase service role key')
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})
