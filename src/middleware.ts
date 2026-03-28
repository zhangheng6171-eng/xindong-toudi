/**
 * 心动投递 - 安全中间件
 * 提供请求安全检查、认证、授权等功能
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import {
  createRateLimiter,
  getClientIp,
  checkLoginAttempt,
  recordLoginFailure,
  recordLoginSuccess,
  defaultSecurityHeaders,
} from '@/lib/security'

// ============== 类型定义 ==============

export interface AuthenticatedUser {
  userId: string
  phone: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ============== 安全头中间件 ==============

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

// ============== 认证中间件 ==============

/**
 * 验证用户认证
 */
export function authenticateRequest(request: NextRequest): {
  user: AuthenticatedUser | null
  error: NextResponse | null
} {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '') || ''

  if (!token) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      ),
    }
  }

  const payload = verifyToken(token)
  if (!payload || !payload.userId) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: '无效的令牌或令牌已过期' },
        { status: 401 }
      ),
    }
  }

  return {
    user: {
      userId: payload.userId,
      phone: payload.phone,
    },
    error: null,
  }
}

/**
 * 需要认证的中间件包装器
 */
export function requireAuth(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // 添加安全头
    const securityResponse = withSecurityHeaders(request)
    if (securityResponse.headers.get('X-Frame-Options')) {
      // 检查是否需要继续
    }

    // Rate limit
    const rateLimitResponse = withRateLimit(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // 认证
    const { user, error } = authenticateRequest(request)
    if (error) {
      return error
    }

    // 执行处理函数
    return handler(request, user!)
  }
}

// ============== 输入验证中间件 ==============

/**
 * 验证请求体
 */
export function validateRequestBody<T extends Record<string, unknown>>(
  body: unknown,
  schema: Record<string, (value: unknown) => { valid: boolean; error?: string }>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  for (const [key, validator] of Object.entries(schema)) {
    const value = (body as T)?.[key as keyof T]
    const result = validator(value)

    if (!result.valid) {
      errors[key] = result.error || '验证失败'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

// ============== 登录保护中间件 ==============

/**
 * 登录尝试保护
 */
export function protectLoginAttempt(
  phone: string,
  request: NextRequest
): {
  allowed: boolean
  response: NextResponse | null
} {
  const ip = getClientIp(request)
  const result = checkLoginAttempt(ip, phone)

  if (!result.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          success: false,
          error: '登录尝试过多，请15分钟后再试',
          retryAfter: result.lockedUntil
            ? Math.ceil((result.lockedUntil - Date.now()) / 1000)
            : 900,
        },
        {
          status: 429,
          headers: {
            'Retry-After': (
              result.lockedUntil
                ? Math.ceil((result.lockedUntil - Date.now()) / 1000)
                : 900
            ).toString(),
          },
        }
      ),
    }
  }

  return {
    allowed: true,
    response: null,
  }
}

/**
 * 记录登录结果
 */
export function handleLoginResult(
  success: boolean,
  phone: string,
  request: NextRequest
): void {
  const ip = getClientIp(request)

  if (success) {
    recordLoginSuccess(ip, phone)
  } else {
    recordLoginFailure(ip, phone)
  }
}

// ============== 验证器工厂 ==============

/**
 * 创建必填字段验证器
 */
export function required(fieldName: string) {
  return (value: unknown): { valid: boolean; error?: string } => {
    if (value === undefined || value === null || value === '') {
      return { valid: false, error: `${fieldName}不能为空` }
    }
    return { valid: true }
  }
}

/**
 * 创建字符串长度验证器
 */
export function minLength(fieldName: string, min: number) {
  return (value: unknown): { valid: boolean; error?: string } => {
    if (typeof value !== 'string' || value.length < min) {
      return { valid: false, error: `${fieldName}长度不能少于${min}字符` }
    }
    return { valid: true }
  }
}

/**
 * 创建字符串长度验证器
 */
export function maxLength(fieldName: string, max: number) {
  return (value: unknown): { valid: boolean; error?: string } => {
    if (typeof value === 'string' && value.length > max) {
      return { valid: false, error: `${fieldName}长度不能超过${max}字符` }
    }
    return { valid: true }
  }
}

/**
 * 创建手机号验证器
 */
export function isPhone() {
  return (value: unknown): { valid: boolean; error?: string } => {
    return validatePhoneNumber(String(value))
  }
}

/**
 * 创建UUID验证器
 */
export function isUUID(fieldName: string) {
  return (value: unknown): { valid: boolean; error?: string } => {
    if (fieldName === '用户ID') {
      return validateUserId(String(value))
    }
    return validateMatchId(String(value))
  }
}

/**
 * 创建评分验证器
 */
export function isRating(min: number = 1, max: number = 5) {
  return (value: unknown): { valid: boolean; error?: string } => {
    const num = Number(value)
    if (isNaN(num)) {
      return { valid: false, error: '评分必须是数字' }
    }
    return validateRating(num, min, max)
  }
}

/**
 * 创建文本内容验证器
 */
export function isTextContent(minLength: number = 0, maxLength: number = 1000) {
  return (value: unknown): { valid: boolean; error?: string } => {
    return validateTextContent(String(value), minLength, maxLength)
  }
}

// ============== API 错误处理 ==============

/**
 * 创建标准 API 响应
 */
export function apiResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
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
): NextResponse<ApiResponse> {
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
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  })
}

// ============== 导出 ==============

export default {
  withSecurityHeaders,
  withRateLimit,
  authenticateRequest,
  requireAuth,
  validateRequestBody,
  protectLoginAttempt,
  handleLoginResult,
  apiResponse,
  errorResponse,
  successResponse,
}
