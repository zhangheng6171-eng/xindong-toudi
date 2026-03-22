/**
 * 用户注册/登录 API - 安全版本
 * 使用 bcrypt 加密密码
 */

import { getSupabaseConfig, corsHeaders, errorResponse, successResponse } from '../lib/config.js'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

// 获取用户列表 (需要管理员权限)
export async function onRequestGet(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const all = url.searchParams.get('all')
    
    let queryUrl = `${config.url}/rest/v1/users?select=*`
    let queryParams = []
    
    if (userId) {
      queryUrl = `${config.url}/rest/v1/users?id=eq.${userId}&select=*`
    } else if (!all) {
      // 默认只返回前100条，不包含密码
      queryUrl = `${config.url}/rest/v1/users?select=id,email,nickname,avatar,gender,age,city,created_at&limit=100`
    }
    
    const response = await fetch(queryUrl, {
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`
      }
    })
    
    const users = await response.json()
    
    if (!Array.isArray(users)) {
      return errorResponse('Failed to fetch users', 500)
    }
    
    return successResponse({ users })
    
  } catch (error) {
    console.error('Get users error:', error)
    return errorResponse(error.message, 500)
  }
}

// 用户登录
export async function onRequestPost(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    const body = await request.json()
    const { action, email, password, nickname, gender, age, city } = body
    
    if (action === 'login') {
      return handleLogin({ email, password, config, env })
    } else if (action === 'register') {
      return handleRegister({ email, password, nickname, gender, age, city, config, env })
    } else {
      return errorResponse('Invalid action. Use "login" or "register"', 400)
    }
    
  } catch (error) {
    console.error('Auth error:', error)
    return errorResponse(error.message, 500)
  }
}

// 处理用户注册
async function handleRegister({ email, password, nickname, gender, age, city, config, env }) {
  // 验证必填字段
  if (!email || !password || !nickname) {
    return errorResponse('缺少必填字段: email, password, nickname', 400)
  }
  
  // 密码强度检查
  if (password.length < 6) {
    return errorResponse('密码长度至少6位', 400)
  }
  
  // 检查邮箱是否已注册
  const checkResponse = await fetch(
    `${config.url}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=id`,
    {
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`
      }
    }
  )
  
  const existingUsers = await checkResponse.json()
  
  if (Array.isArray(existingUsers) && existingUsers.length > 0) {
    return errorResponse('该邮箱已被注册', 400)
  }
  
  // 使用 bcrypt 加密密码
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
  
  // 创建新用户
  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  
  const insertResponse = await fetch(`${config.url}/rest/v1/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': config.anonKey,
      'Authorization': `Bearer ${config.anonKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      id: userId,
      email,
      password: hashedPassword, // 加密后的密码
      nickname,
      gender: gender || null,
      age: age || null,
      city: city || null,
      created_at: new Date().toISOString()
    })
  })
  
  if (!insertResponse.ok) {
    const error = await insertResponse.text()
    console.error('Insert user error:', error)
    return errorResponse('注册失败，请重试', 500)
  }
  
  const data = await insertResponse.json()
  const user = Array.isArray(data) ? data[0] : data
  
  // 生成简单的 session token (实际生产应使用 JWT)
  const sessionToken = generateSessionToken(user.id, env)
  
  // 返回用户信息（不包含密码）
  return successResponse({
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar || null,
      gender: user.gender,
      age: user.age,
      city: user.city,
      createdAt: user.created_at
    },
    token: sessionToken
  })
}

// 处理用户登录
async function handleLogin({ email, password, config, env }) {
  // 验证必填字段
  if (!email || !password) {
    return errorResponse('缺少邮箱或密码', 400)
  }
  
  // 查询用户（只返回必要字段，加上密码用于验证）
  const response = await fetch(
    `${config.url}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`,
    {
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`
      }
    }
  )
  
  const users = await response.json()
  
  if (!Array.isArray(users) || users.length === 0) {
    return errorResponse('该邮箱未注册，请先注册账号', 404)
  }
  
  const user = users[0]
  
  // 使用 bcrypt 验证密码
  const passwordMatch = await bcrypt.compare(password, user.password)
  
  if (!passwordMatch) {
    return errorResponse('密码错误，请重试', 401)
  }
  
  // 生成 session token
  const sessionToken = generateSessionToken(user.id, env)
  
  // 返回用户信息（不包含密码）
  return successResponse({
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar || null,
      gender: user.gender,
      age: user.age,
      city: user.city,
      createdAt: user.created_at
    },
    token: sessionToken
  })
}

// 生成简单的 session token (生产环境建议使用 JWT)
function generateSessionToken(userId, env) {
  // 简单实现：Base64 编码的用户ID + 时间戳
  // 生产环境应使用真正的 JWT
  const payload = {
    userId,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7天过期
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

// 验证 session token
export function verifySessionToken(token, env) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())
    if (payload.exp < Date.now()) {
      return null // Token 已过期
    }
    return payload.userId
  } catch {
    return null // Token 无效
  }
}

// CORS 预检请求
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}
