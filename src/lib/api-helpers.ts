import { NextRequest, NextResponse } from 'next/server'

/**
 * 从请求头获取用户ID
 * 支持两种方式：
 * 1. Authorization: Bearer <userId>
 * 2. X-User-Id: <userId>
 */
export function getUserIdFromRequest(request: NextRequest): string | null {
  // 方式1: 从 Authorization header 获取
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // 方式2: 从 X-User-Id header 获取
  const userIdHeader = request.headers.get('x-user-id')
  if (userIdHeader) {
    return userIdHeader
  }

  return null
}

/**
 * 创建成功响应
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}

/**
 * 创建错误响应
 */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { error: message },
    { status }
  )
}

/**
 * 创建未授权响应
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  )
}

/**
 * 验证必需字段
 */
export function validateRequired(data: Record<string, any>, fields: string[]): string | null {
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      return `Missing required field: ${field}`
    }
  }
  return null
}
