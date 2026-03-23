/**
 * 心动投递 - 安全工具函数
 * 提供输入验证、消毒、加密、rate limiting 等安全功能
 */

import crypto from 'crypto'

// ============== 配置 ==============

// 安全配置
export const securityConfig = {
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15分钟窗口
    maxRequests: 100, // 每个IP最大请求数
    maxLoginAttempts: 5, // 登录失败最大次数
    lockoutDuration: 15 * 60 * 1000, // 锁定15分钟
  },
  // 输入限制
  input: {
    maxTextLength: 10000,
    maxPasswordLength: 128,
    minPasswordLength: 8,
  },
  // JWT 配置
  jwt: {
    algorithm: 'HS256',
    expiresIn: '7d',
  },
}

// ============== 输入验证 ==============

/**
 * 验证并消毒用户输入
 */
export function sanitizeInput(input: string, maxLength?: number): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // 移除控制字符，保留可见字符
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '')

  // 移除 HTML 标签
  sanitized = sanitized.replace(/<[^>]*>/g, '')

  // 移除 SQL 注入风险字符（宽松验证）
  // 注意：使用参数化查询时不需要这么严格
  sanitized = sanitized.replace(/['";\\]/g, '')

  // 限制长度
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  // 移除多余空白
  return sanitized.trim()
}

/**
 * 验证手机号格式
 */
export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  if (!phone) {
    return { valid: false, error: '请输入手机号' }
  }

  // 中国手机号格式：1开头，第二位3-9，共11位
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: '手机号格式不正确' }
  }

  return { valid: true }
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: '请输入邮箱' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: '邮箱格式不正确' }
  }

  return { valid: true }
}

/**
 * 验证用户ID格式
 */
export function validateUserId(userId: string): { valid: boolean; error?: string } {
  if (!userId) {
    return { valid: false, error: '用户ID不能为空' }
  }

  // UUID 格式验证
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId)) {
    return { valid: false, error: '用户ID格式不正确' }
  }

  return { valid: true }
}

/**
 * 验证匹配ID格式
 */
export function validateMatchId(matchId: string): { valid: boolean; error?: string } {
  if (!matchId) {
    return { valid: false, error: '匹配ID不能为空' }
  }

  // UUID 格式验证
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(matchId)) {
    return { valid: false, error: '匹配ID格式不正确' }
  }

  return { valid: true }
}

/**
 * 验证评分范围
 */
export function validateRating(rating: number, min: number = 1, max: number = 5): {
  valid: boolean
  error?: string
} {
  if (typeof rating !== 'number' || isNaN(rating)) {
    return { valid: false, error: '评分必须是数字' }
  }

  if (rating < min || rating > max) {
    return { valid: false, error: `评分必须在${min}-${max}之间` }
  }

  return { valid: true }
}

/**
 * 验证评论/反馈内容长度
 */
export function validateTextContent(
  content: string,
  minLength: number = 0,
  maxLength: number = 1000
): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    if (minLength > 0) {
      return { valid: false, error: '内容不能为空' }
    }
    return { valid: true }
  }

  const length = content.trim().length

  if (length < minLength) {
    return { valid: false, error: `内容长度不能少于${minLength}字符` }
  }

  if (length > maxLength) {
    return { valid: false, error: `内容长度不能超过${maxLength}字符` }
  }

  return { valid: true }
}

// ============== Rate Limiting ==============

// 内存存储（生产环境应使用 Redis）
const rateLimitStore = new Map<string, {
  count: number
  resetTime: number
  lockoutUntil?: number
}>()

/**
 * Rate Limiter 类
 */
export class RateLimiter {
  private key: string
  private maxRequests: number
  private windowMs: number

  constructor(key: string, maxRequests?: number, windowMs?: number) {
    this.key = `ratelimit:${key}`
    this.maxRequests = maxRequests || securityConfig.rateLimit.maxRequests
    this.windowMs = windowMs || securityConfig.rateLimit.windowMs
  }

  /**
   * 检查是否超过限制
   */
  check(): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const record = rateLimitStore.get(this.key)

    // 如果记录不存在或已过期，创建新记录
    if (!record || now > record.resetTime) {
      const resetTime = now + this.windowMs
      rateLimitStore.set(this.key, {
        count: 1,
        resetTime,
      })

      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime,
      }
    }

    // 检查是否被锁定
    if (record.lockoutUntil && now < record.lockoutUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.lockoutUntil,
      }
    }

    // 检查请求数量
    if (record.count >= this.maxRequests) {
      // 锁定用户
      record.lockoutUntil = now + securityConfig.rateLimit.lockoutDuration
      rateLimitStore.set(this.key, record)

      return {
        allowed: false,
        remaining: 0,
        resetTime: record.lockoutUntil,
      }
    }

    // 增加计数
    record.count++
    rateLimitStore.set(this.key, record)

    return {
      allowed: true,
      remaining: this.maxRequests - record.count,
      resetTime: record.resetTime,
    }
  }

  /**
   * 重置限制
   */
  reset(): void {
    rateLimitStore.delete(this.key)
  }

  /**
   * 记录失败尝试（用于登录失败计数）
   */
  recordFailure(): void {
    const now = Date.now()
    const record = rateLimitStore.get(this.key) || {
      count: 0,
      resetTime: now + this.windowMs,
    }

    record.count++
    
    // 如果超过登录失败次数，锁定
    if (record.count >= securityConfig.rateLimit.maxLoginAttempts) {
      record.lockoutUntil = now + securityConfig.rateLimit.lockoutDuration
    }

    rateLimitStore.set(this.key, record)
  }

  /**
   * 记录成功登录
   */
  recordSuccess(): void {
    this.reset()
  }
}

/**
 * 创建速率限制器
 */
export function createRateLimiter(identifier: string): RateLimiter {
  return new RateLimiter(identifier)
}

// ============== 请求签名 ==============

/**
 * 生成请求签名
 */
export function generateRequestSignature(
  payload: string,
  timestamp: number,
  secret: string
): string {
  const data = `${timestamp}:${payload}`
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex')
}

/**
 * 验证请求签名
 */
export function verifyRequestSignature(
  payload: string,
  timestamp: number,
  signature: string,
  secret: string,
  maxAgeMs: number = 5 * 60 * 1000 // 5分钟
): boolean {
  // 检查时间戳是否过期
  const now = Date.now()
  if (Math.abs(now - timestamp) > maxAgeMs) {
    return false
  }

  // 计算期望的签名
  const expectedSignature = generateRequestSignature(payload, timestamp, secret)
  
  // 使用恒定时间比较防止时序攻击
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * 生成 API 密钥
 */
export function generateApiKey(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * 生成安全随机令牌
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url')
}

// ============== 加密工具 ==============

/**
 * SHA-256 哈希
 */
export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex')
}

/**
 * 生成密码盐值
 */
export function generateSalt(length: number = 16): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * 验证数据完整性
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('base64')
}

/**
 * 生成 CSRF 令牌
 */
export function generateCsrfToken(): string {
  return generateSecureToken(32)
}

// ============== 安全头 ==============

/**
 * 默认安全头配置
 */
export const defaultSecurityHeaders = {
  // 防止点击劫持
  'X-Frame-Options': 'DENY',
  // XSS 防护
  'X-XSS-Protection': '1; mode=block',
  // 防止 MIME 类型嗅探
  'X-Content-Type-Options': 'nosniff',
  // 内容安全策略
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;",
  // 引用来源策略
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // 权限策略
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // 跨域资源共享
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '',
}

// 兼容 Next.js
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * 添加安全头的中间件
 */
export function withSecurityHeaders(request: NextRequest): NextResponse {
  const response = NextResponse.next()

  // 添加所有安全头
  Object.entries(defaultSecurityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value)
    }
  })

  return response
}

// ============== Rate Limiting 中间件 ==============

/**
 * Rate Limiting 中间件
 */
export function withRateLimit(request: NextRequest): NextResponse | null {
  const ip = getClientIp(request)
  const rateLimiter = createRateLimiter(ip)

  const result = rateLimiter.check()

  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: '请求过于频繁，请稍后再试',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime.toString(),
        },
      }
    )
  }

  // 将 rate limit 信息添加到响应头
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString())

  return null // 返回 null 表示继续执行
}

// ============== IP 地址处理 ==============

/**
 * 获取客户端真实 IP
 */
export function getClientIp(request: Request | NextRequest): string {
  // 检查各种代理头
  const headers = request.headers
  
  // Cloudflare
  const cfConnectingIp = headers.get('cf-connecting-ip')
  if (cfConnectingIp) return cfConnectingIp
  
  // Vercel
  const vercelIp = headers.get('x-vercel-forwarded-for')
  if (vercelIp) return vercelIp.split(',')[0].trim()
  
  // 通用代理头
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  
  // 备用
  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp
  
  return 'unknown'
}

// ============== 暴力破解防护 ==============

// 登录失败记录存储
const loginAttempts = new Map<string, {
  count: number
  firstAttempt: number
  lockedUntil?: number
}>()

/**
 * 检查登录是否允许
 */
export function checkLoginAttempt(ip: string, phone: string): {
  allowed: boolean
  remainingAttempts: number
  lockedUntil?: number
} {
  const key = `${ip}:${phone}`
  const now = Date.now()
  const record = loginAttempts.get(key)

  // 如果没有记录，允许登录
  if (!record) {
    return {
      allowed: true,
      remainingAttempts: securityConfig.rateLimit.maxLoginAttempts,
    }
  }

  // 检查是否被锁定
  if (record.lockedUntil && now < record.lockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: record.lockedUntil,
    }
  }

  // 如果第一次尝试超过30分钟，重置记录
  if (now - record.firstAttempt > 30 * 60 * 1000) {
    loginAttempts.delete(key)
    return {
      allowed: true,
      remainingAttempts: securityConfig.rateLimit.maxLoginAttempts,
    }
  }

  // 还有尝试次数
  const remaining = securityConfig.rateLimit.maxLoginAttempts - record.count
  if (remaining > 0) {
    return {
      allowed: true,
      remainingAttempts: remaining,
    }
  }

  // 锁定
  const lockedUntil = now + securityConfig.rateLimit.lockoutDuration
  loginAttempts.set(key, {
    ...record,
    lockedUntil,
  })

  return {
    allowed: false,
    remainingAttempts: 0,
    lockedUntil,
  }
}

/**
 * 记录登录失败
 */
export function recordLoginFailure(ip: string, phone: string): void {
  const key = `${ip}:${phone}`
  const now = Date.now()
  const record = loginAttempts.get(key)

  if (!record) {
    loginAttempts.set(key, {
      count: 1,
      firstAttempt: now,
    })
  } else {
    record.count++
    loginAttempts.set(key, record)
  }
}

/**
 * 记录登录成功
 */
export function recordLoginSuccess(ip: string, phone: string): void {
  const key = `${ip}:${phone}`
  loginAttempts.delete(key)
}

/**
 * 清理过期的登录记录
 */
export function cleanupLoginAttempts(): void {
  const now = Date.now()
  const threshold = 30 * 60 * 1000 // 30分钟

  for (const [key, record] of loginAttempts) {
    if (now - record.firstAttempt > threshold) {
      loginAttempts.delete(key)
    }
  }
}

// 定期清理（每小时）
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupLoginAttempts, 60 * 60 * 1000)
}

// ============== 导出类型 ==============

// ============== API 响应辅助函数 ==============

/**
 * 创建标准 API 响应
 */
export function apiResponse<T>(
  data: T,
  status: number = 200
): NextResponse<{ success: boolean; data?: T; error?: string }> {
  return NextResponse.json(
    {
      success: status < 400,
      data,
    },
    { status }
  )
}

/**
 * 创建错误响应
 */
export function errorResponse(
  error: string,
  status: number = 400
): NextResponse<{ success: boolean; error: string }> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  )
}

/**
 * 创建成功响应
 */
export function successResponse<T>(
  data: T,
  message?: string
): NextResponse<{ success: boolean; data: T; message?: string }> {
  return NextResponse.json({
    success: true,
    data,
    message,
  })
}

export type {
  // 导出供其他地方使用
}
