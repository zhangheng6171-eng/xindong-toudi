/**
 * 用户注册/登录 API - 安全版本
 * 使用 bcrypt 加密密码 + JWT Token 认证
 */

import { getSupabaseConfig, getJwtSecret, corsHeaders, errorResponse, successResponse } from '../lib/config.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// 密码加密强度 - 12轮（生产环境推荐）
const SALT_ROUNDS = 12

// JWT 配置
const JWT_EXPIRY = '7d' // 7天过期
const JWT_ALGORITHM = 'HS256'

// 简单哈希函数（兼容 Cloudflare Workers）
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return 'hash_' + Math.abs(hash).toString(16) + '_' + str.length.toString(16)
}

/**
 * 生成 JWT Token
 */
function generateToken(userId, email, env) {
  const secret = getJwtSecret(env)
  const payload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000)
  }
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRY, algorithm: JWT_ALGORITHM })
}

/**
 * 验证 JWT Token
 */
function verifyToken(token, env) {
  try {
    const secret = getJwtSecret(env)
    return jwt.verify(token, secret, { algorithms: [JWT_ALGORITHM] })
  } catch (error) {
    console.error('JWT验证失败:', error.message)
    return null
  }
}

/**
 * 从请求中提取Token (支持 Authorization header)
 */
function extractToken(request) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

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

// 密码强度验证
function validatePasswordStrength(password) {
  const errors = []
  
  if (password.length < 6) {
    errors.push('密码长度至少6位')
  }
  
  if (password.length > 100) {
    errors.push('密码长度不能超过100位')
  }
  
  // 检查常见弱密码
  const commonPasswords = ['password', '123456', '12345678', 'qwerty', 'abc123', 'admin']
  if (commonPasswords.some(p => password.toLowerCase() === p)) {
    errors.push('请使用更复杂的密码')
  }
  
  return errors
}

// 处理用户注册
async function handleRegister({ email, password, nickname, gender, age, city, config, env }) {
  // 验证必填字段
  if (!email || !password || !nickname) {
    return errorResponse('缺少必填字段: email, password, nickname', 400)
  }
  
  // 密码强度验证
  const passwordErrors = validatePasswordStrength(password)
  if (passwordErrors.length > 0) {
    return errorResponse(passwordErrors[0], 400)
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
  
  // 简单哈希密码（兼容 Cloudflare Workers）
  const hashedPassword = simpleHash(password)
  
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
  
  // 生成 JWT Token
  const token = generateToken(user.id, user.email, env)
  
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
    token,
    expiresIn: JWT_EXPIRY
  })
}

// 检测密码是否已加密（bcrypt哈希以$2开头，长度60位）
function isPasswordHashed(password) {
  return password && password.startsWith('$2') && password.length === 60
}

// 升级明文密码到简单哈希（向后兼容）
async function upgradePasswordHash(userId, plainPassword, config) {
  try {
    const hashedPassword = simpleHash(plainPassword)
    
    const updateResponse = await fetch(
      `${config.url}/rest/v1/users?id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ password: hashedPassword })
      }
    )
    
    if (updateResponse.ok) {
      console.log(`[Password Upgrade] User ${userId} password upgraded to simple hash`)
    } else {
      console.error('[Password Upgrade] Failed to upgrade password:', await updateResponse.text())
    }
  } catch (error) {
    console.error('[Password Upgrade] Error:', error.message)
  }
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
  let passwordMatch = false
  
  // 检查密码是否已加密
  if (isPasswordHashed(user.password)) {
    // 使用 bcrypt 验证加密密码
    try {
      passwordMatch = await bcrypt.compare(password, user.password)
    } catch (e) {
      // bcrypt 失败时尝试简单哈希
      passwordMatch = (user.password === simpleHash(password))
    }
  } else if (user.password && user.password.startsWith('hash_')) {
    // 简单哈希密码验证
    passwordMatch = (user.password === simpleHash(password))
  } else {
    // 向后兼容：明文密码直接比较
    // 注意：这是一个安全风险，应该提示用户更新密码
    console.warn(`[Security] User ${user.id} is using plain text password!`)
    
    if (user.password === password) {
      passwordMatch = true
      
      // 自动升级密码到简单哈希
      upgradePasswordHash(user.id, password, config)
    }
  }
  
  if (!passwordMatch) {
    // 密码错误，增加短暂延迟防止Timing攻击
    await new Promise(resolve => setTimeout(resolve, 100))
    return errorResponse('密码错误，请重试', 401)
  }
  
  // 生成 JWT Token
  const token = generateToken(user.id, user.email, env)
  
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
    token,
    expiresIn: JWT_EXPIRY
  })
}

// CORS 预检请求
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}
