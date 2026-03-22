/**
 * JWT 认证中间件工具
 * 用于验证API请求中的JWT Token
 */

import { getJwtSecret, errorResponse } from './config.js'
import jwt from 'jsonwebtoken'

const JWT_ALGORITHM = 'HS256'

/**
 * 验证JWT Token并返回用户信息
 */
export function verifyAuthToken(request, env) {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: '未提供认证Token', userId: null }
  }
  
  const token = authHeader.substring(7)
  
  try {
    const secret = getJwtSecret(env)
    const decoded = jwt.verify(token, secret, { algorithms: [JWT_ALGORITHM] })
    return { valid: true, userId: decoded.userId, email: decoded.email }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token已过期，请重新登录', userId: null }
    }
    if (error.name === 'JsonWebTokenError') {
      return { valid: false, error: '无效的Token', userId: null }
    }
    return { valid: false, error: 'Token验证失败', userId: null }
  }
}

/**
 * 认证中间件 - 用于保护需要登录的API
 */
export async function withAuth(request, env, handler) {
  const auth = verifyAuthToken(request, env)
  
  if (!auth.valid) {
    return errorResponse(auth.error, 401)
  }
  
  return handler(auth)
}

/**
 * 可选认证中间件 - 如果有Token则验证，没有则继续
 */
export async function withOptionalAuth(request, env, handler) {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return handler(null)
  }
  
  const auth = verifyAuthToken(request, env)
  return handler(auth.valid ? auth : null)
}
