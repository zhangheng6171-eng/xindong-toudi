/**
 * 忘记密码 API - 发送验证码
 */

import { getSupabaseConfig, corsHeaders, errorResponse, successResponse } from '../lib/config.js'

// 生成6位数字验证码
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 处理忘记密码请求
export async function onRequestPost(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    const body = await request.json()
    const { email } = body
    
    if (!email || !email.trim()) {
      return errorResponse('请输入邮箱地址', 400)
    }
    
    const normalizedEmail = email.trim().toLowerCase()
    
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
    
    if (!Array.isArray(users) || users.length === 0) {
      // 为了安全，不透露用户是否存在
      return successResponse({
        message: '如果该邮箱已注册，验证码将发送到您的邮箱',
        // 开发环境返回验证码（生产环境应删除）
        devCode: env?.ENVIRONMENT === 'development' ? generateVerificationCode() : undefined
      })
    }
    
    const user = users[0]
    
    // 生成验证码
    const verificationCode = generateVerificationCode()
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10分钟后过期
    
    // 更新用户的重置令牌
    const updateResponse = await fetch(
      `${config.url}/rest/v1/users?id=eq.${user.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
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
