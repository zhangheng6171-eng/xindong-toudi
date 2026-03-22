/**
 * 重置密码 API - 验证验证码并重置密码
 */

import { getSupabaseConfig, corsHeaders, errorResponse, successResponse } from '../lib/config.js'
import bcrypt from 'bcryptjs'

// 密码加密强度 - 12轮（与注册一致）
const SALT_ROUNDS = 12

// 验证码长度
const VERIFICATION_CODE_LENGTH = 6

// 验证码有效期（分钟）
const CODE_EXPIRY_MINUTES = 10

// 处理重置密码请求
export async function onRequestPost(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    const body = await request.json()
    const { email, code, newPassword } = body
    
    // 验证必填字段
    if (!email || !code || !newPassword) {
      return errorResponse('请填写完整信息', 400)
    }
    
    // 验证码格式验证
    if (!/^\d{6}$/.test(code)) {
      return errorResponse('验证码格式错误', 400)
    }
    
    // 密码强度检查
    if (newPassword.length < 8) {
      return errorResponse('密码长度至少8位', 400)
    }
    
    // 密码复杂度检查
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)
    if (!(hasUpperCase && hasLowerCase && hasNumber)) {
      return errorResponse('密码必须包含大小写字母和数字', 400)
    }
    
    const normalizedEmail = email.trim().toLowerCase()
    
    // 查询用户
    const checkResponse = await fetch(
      `${config.url}/rest/v1/users?email=eq.${encodeURIComponent(normalizedEmail)}&select=*`,
      {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
        }
      }
    )
    
    const users = await checkResponse.json()
    
    if (!Array.isArray(users) || users.length === 0) {
      return errorResponse('用户不存在', 404)
    }
    
    const user = users[0]
    
    // 验证验证码
    if (!user.reset_token || user.reset_token !== code) {
      return errorResponse('验证码错误', 400)
    }
    
    // 检查验证码是否过期
    if (!user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
      return errorResponse('验证码已过期，请重新获取', 400)
    }
    
    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
    
    // 更新密码并清除验证码（使用service role key确保权限足够）
    const updateResponse = await fetch(
      `${config.url}/rest/v1/users?id=eq.${user.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.serviceRoleKey || config.anonKey,
          'Authorization': `Bearer ${config.serviceRoleKey || config.anonKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          password: hashedPassword,
          reset_token: null,
          reset_token_expires: null
        })
      }
    )
    
    if (!updateResponse.ok) {
      console.error('Failed to update password:', await updateResponse.text())
      return errorResponse('重置密码失败，请稍后重试', 500)
    }
    
    return successResponse({
      message: '密码重置成功，请使用新密码登录'
    })
    
  } catch (error) {
    console.error('Reset password error:', error)
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
