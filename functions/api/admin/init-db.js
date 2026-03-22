/**
 * 数据库初始化 API - 安全版本
 * 从环境变量读取配置
 */

import { getSupabaseConfig, corsHeaders, successResponse, errorResponse } from '../../lib/config.js'

export async function onRequestPost(context) {
  const { env } = context
  const config = getSupabaseConfig(env)
  
  try {
    // 检查是否有 service role key
    if (!config.serviceRoleKey) {
      return errorResponse('服务端配置错误：缺少 service role key', 500)
    }
    
    // 检查 profiles 表是否已存在
    const checkResponse = await fetch(`${config.url}/rest/v1/profiles?select=id&limit=1`, {
      headers: {
        'apikey': config.serviceRoleKey,
        'Authorization': `Bearer ${config.serviceRoleKey}`
      }
    })
    
    if (checkResponse.ok) {
      return successResponse({
        message: 'profiles 表已存在'
      })
    }
    
    // profiles 表不存在，返回 SQL 指导用户手动创建
    return successResponse({
      success: false,
      message: 'profiles 表不存在，请在 Supabase Dashboard 中手动创建',
      needSetup: true
    })
    
  } catch (error) {
    console.error('Init DB error:', error)
    return errorResponse(error.message, 500)
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}
