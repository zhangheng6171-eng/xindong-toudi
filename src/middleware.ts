/**
 * 心动投递 - 安全中间件
 * 提供请求安全检查、认证、授权等功能
 * 简化版本 - 避免使用不兼容 Edge Runtime 的模块
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

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

  // 添加安全头
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

// ============== IP 地址处理 ==============

/**
 * 获取客户端真实 IP
 */
function getClientIp(request: NextRequest): string {
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
  
  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp
  
  return 'unknown'
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

// ============== 需要认证的中间件包装器 ==============

/**
 * 需要认证的中间件包装器
 */
export function requireAuth(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // 添加安全头
    withSecurityHeaders(request)

    // 认证
    const { user, error } = authenticateRequest(request)
    if (error) {
      return error
    }

    // 执行处理函数
    return handler(request, user!)
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
  authenticateRequest,
  requireAuth,
  apiResponse,
  errorResponse,
  successResponse,
}
