/**
 * Cloudflare Workers 环境变量配置
 * 
 * 在 Cloudflare Pages Dashboard 中设置以下环境变量:
 * - SUPABASE_URL: Supabase 项目 URL
 * - SUPABASE_ANON_KEY: Supabase Anonymous Key (用于公开操作)
 * - SUPABASE_SERVICE_ROLE_KEY: Supabase Service Role Key (用于服务端特权操作)
 * - JWT_SECRET: JWT 签名密钥 (用于生成用户 token)
 */

/**
 * 获取 Supabase 配置
 * 优先使用环境变量，fallback 到默认值（开发环境）
 */
export function getSupabaseConfig(env) {
  return {
    url: env?.SUPABASE_URL || 'https://ntaqnyegiiwtzdyqjiwy.supabase.co',
    anonKey: env?.SUPABASE_ANON_KEY || '',
    serviceRoleKey: env?.SUPABASE_SERVICE_ROLE_KEY || ''
  }
}

/**
 * 获取 JWT 密钥
 */
export function getJwtSecret(env) {
  return env?.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
}

/**
 * 创建 CORS 响应头
 */
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }
}

/**
 * 创建错误响应
 */
export function errorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      ...corsHeaders()
    }
  })
}

/**
 * 创建成功响应
 */
export function successResponse(data) {
  return new Response(JSON.stringify({ 
    success: true, 
    ...data 
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      ...corsHeaders()
    }
  })
}
