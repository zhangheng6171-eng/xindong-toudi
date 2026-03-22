/**
 * Cloudflare Workers 环境变量配置
 * 
 * 在 Cloudflare Pages Dashboard 中设置以下环境变量:
 * - SUPABASE_URL: Supabase 项目 URL
 * - SUPABASE_ANON_KEY: Supabase Anonymous Key (用于公开操作)
 * - SUPABASE_SERVICE_ROLE_KEY: Supabase Service Role Key (用于服务端特权操作)
 * - JWT_SECRET: JWT 签名密钥 (必须设置一个强密钥，生产环境使用长随机字符串)
 */

// Supabase 密钥（生产环境应该用环境变量）
const SUPABASE_URL = 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTY4NzUsImV4cCI6MjA4OTQ5Mjg3NX0.4FEAb1Yd4xOwXz3LcfZ9iPG0ZZPbFd8dfry903c5lPc'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkxNjg3NSwiZXhwIjoyMDg5NDkyODc1fQ.z8LPpoJoa9_DEJvBmNvSF0Q1I4FA3FNnFRU0PgKcF2A'

/**
 * 获取 Supabase 配置
 * 优先使用环境变量，fallback 到默认值（开发环境）
 */
export function getSupabaseConfig(env) {
  return {
    url: env?.SUPABASE_URL || SUPABASE_URL,
    anonKey: env?.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY,
    serviceRoleKey: env?.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY
  }
}

/**
 * 获取 JWT 密钥
 * 生产环境必须设置强密钥
 */
export function getJwtSecret(env) {
  const secret = env?.JWT_SECRET
  
  // 如果没有设置JWT_SECRET，记录警告
  if (!secret) {
    console.warn('警告: JWT_SECRET 未设置！使用默认密钥仅用于开发。生产环境必须设置强密钥。')
    // 开发环境的默认密钥（不应该在生产使用）
    return 'xindong-toudi-dev-secret-change-in-production'
  }
  
  // 密钥长度检查
  if (secret.length < 32) {
    console.warn('警告: JWT_SECRET 长度不足32字符，建议使用更长的随机字符串')
  }
  
  return secret
}

/**
 * 创建 CORS 响应头
 * 生产环境应该限制允许的域名
 */
export function corsHeaders() {
  // 可以从环境变量获取允许的域名
  const allowedOrigin = process.env?.ALLOWED_ORIGIN || '*'
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
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
