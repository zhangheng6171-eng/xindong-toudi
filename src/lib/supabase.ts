import { createClient } from '@supabase/supabase-js'

// 环境变量检查
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

// 创建前端客户端（使用 anon key）
// 注意：前端只应该使用 anon key，敏感操作应该通过服务端 API
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

/**
 * 前端安全说明：
 * 1. 前端只能使用 Supabase Anon Key（公开的）
 * 2. 不要在前端代码中暴露 Service Role Key
 * 3. 所有需要更高权限的操作都应该通过服务端 API 进行
 * 4. 用户认证状态应该由服务端 API 验证和管理
 */

// 导出环境变量供其他文件使用（但不推荐直接使用）
export const supabaseConfig = {
  url: supabaseUrl,
  // 不要导出 anonKey 到控制台或日志
}
