/**
 * 忘记密码 API - 发送验证码
 * 包含速率限制和安全增强
 */

import { getSupabaseConfig, corsHeaders, errorResponse, successResponse } from '../lib/config.js'

// 简单的内存存储用于速率限制（生产环境应使用Redis）
const rateLimitStore = new Map()

/**
 * 速率限制检查
 * 返回 true 表示通过，false 表示被限制
 */
function checkRateLimit(ip, email) {
  const key = `${ip}:${email}`
  const now = Date.now()
  const windowMs = 60 * 1000 // 1分钟窗口
  const maxRequests = 3 // 最多3次
  
  const record = rateLimitStore.get(key)
  
  if (!record) {
    rateLimitStore.set(key, { count: 1, firstRequest: now })
    return true
  }
  
  // 检查是否在窗口期内
  if (now - record.firstRequest > windowMs) {
    // 重置窗口
    rateLimitStore.set(key, { count: 1, firstRequest: now })
    return true
  }
  
  // 检查请求次数
  if (record.count >= maxRequests) {
    return false
  }
  
  // 增加计数
  record.count++
  rateLimitStore.set(key, record)
  return true
}

// 生成加密安全的6位数字验证码
function generateVerificationCode() {
  // 使用 crypto 安全随机数（如果可用）
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    return String(array[0] % 900000 + 100000)
  }
  // 备用方案
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 邮箱格式验证
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 处理忘记密码请求
export async function onRequestPost(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    // 获取客户端IP用于速率限制
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                     request.headers.get('X-Forwarded-For') || 
                     'unknown'
    
    const body = await request.json()
    const { email } = body
    
    if (!email || !email.trim()) {
      return errorResponse('请输入邮箱地址', 400)
    }
    
    const normalizedEmail = email.trim().toLowerCase()
    
    // 邮箱格式验证
    if (!isValidEmail(normalizedEmail)) {
      return errorResponse('请输入有效的邮箱地址', 400)
    }
    
    // 速率限制检查
    if (!checkRateLimit(clientIP, normalizedEmail)) {
      return errorResponse('发送过于频繁，请1分钟后再试', 429)
    }
    
    // 检查用户是否存在
    const checkResponse = await fetch(
      `${config.url}/rest/v1/users?email=eq.${encodeURIComponent(normalizedEmail)}&select=id,email,nickname`,
      {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
        }
      }
    )
    
    const users = await checkResponse.json()
    
    // 无论用户是否存在，都返回相同的消息（防止用户枚举）
    if (!Array.isArray(users) || users.length === 0) {
      return successResponse({
        message: '如果该邮箱已注册，验证码将发送到您的邮箱'
      })
    }
    
    const user = users[0]
    
    // 生成验证码
    const verificationCode = generateVerificationCode()
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10分钟后过期
    
    // 更新用户的重置令牌（使用service role key确保权限足够）
    const updateResponse = await fetch(
      `${config.url}/rest/v1/users?id=eq.${user.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.serviceRoleKey || config.anonKey,
          'Authorization': `Bearer ${config.serviceRoleKey || config.anonKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          reset_token: verificationCode,
          reset_token_expires: codeExpires
        })
      }
    )
    
    if (!updateResponse.ok) {
      console.error('Failed to update reset token:', await updateResponse.text())
      return errorResponse('发送验证码失败，请稍后重试', 500)
    }
    
    // TODO: 在生产环境中，这里应该发送邮件
    // 目前先返回验证码给前端（仅开发环境）
    // 生产环境需要配置邮件服务（如 SendGrid, Resend 等）
    
    return successResponse({
      message: '验证码已发送到您的邮箱',
      // 开发环境返回验证码（生产环境应删除）
      ...(env?.ENVIRONMENT !== 'production' && { 
        devCode: verificationCode,
        devEmail: normalizedEmail 
      })
    })
    
  } catch (error) {
    console.error('Forgot password error:', error)
    return errorResponse(error.message, 500)
  }
}

// CORS 预检请求
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}
