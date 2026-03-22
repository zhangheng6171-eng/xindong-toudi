/**
 * 心动投递 - 前端配置
 * 使用环境变量，避免硬编码敏感信息
 * 
 * 环境变量说明：
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase项目URL（可以公开）
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase Anonymous Key（可以公开）
 * 
 * 注意：Service Role Key 不应该暴露在前端！
 */

// Supabase配置 - 从环境变量读取
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// API基础URL - 使用相对路径，由Next.js代理
export const API_BASE_URL = '/api'

// 开发环境检查
const isDev = process.env.NODE_ENV === 'development'

// 如果环境变量未设置，使用fallback（仅用于开发）
if (isDev && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ 开发环境: NEXT_PUBLIC_SUPABASE_ANON_KEY 未设置，使用默认key')
}
