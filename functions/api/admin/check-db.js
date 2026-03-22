/**
 * 数据库状态检查 API - 安全版本
 * 从环境变量读取配置
 */

import { getSupabaseConfig, corsHeaders, successResponse } from '../../lib/config.js'

export async function onRequestGet(context) {
  const { env } = context
  const config = getSupabaseConfig(env)
  
  try {
    // 检查 profiles 表是否存在
    const response = await fetch(`${config.url}/rest/v1/profiles?select=id&limit=1`, {
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`
      }
    })
    
    if (response.ok) {
      return successResponse({
        profilesTableExists: true,
        message: '数据库已就绪，照片墙功能可用'
      })
    }
    
    // profiles 表不存在
    const error = await response.json()
    
    if (error.code === 'PGRST205' || error.message?.includes('Could not find')) {
      return successResponse({
        profilesTableExists: false,
        message: 'profiles 表不存在，需要创建',
        // 保持 SQL 提示信息
        needSetup: true
      })
    }
    
    return successResponse({
      success: false,
      error: error.message
    })
    
  } catch (error) {
    console.error('Check DB error:', error)
    return successResponse({
      error: error.message
    })
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}
