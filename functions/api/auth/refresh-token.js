/**
 * Token刷新 API
 * 用于刷新即将过期的JWT Token
 */

import { getSupabaseConfig, getJwtSecret, corsHeaders, errorResponse, successResponse } from '../lib/config.js'
import jwt from 'jsonwebtoken'

const JWT_ALGORITHM = 'HS256'
const JWT_EXPIRY = '7d'

export async function onRequestPost(context) {
  const { request, env } = context
  const config = getSupabaseConfig(env)
  
  try {
    const body = await request.json()
    const { userId } = body
    
    if (!userId) {
      return errorResponse('缺少用户ID', 400)
    }
    
    // 从 Authorization header 获取当前token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('未提供认证Token', 401)
    }
    
    const currentToken = authHeader.substring(7)
    
    // 验证当前token
    try {
      const secret = getJwtSecret(env)
      const decoded = jwt.verify(currentToken, secret, { algorithms: [JWT_ALGORITHM] })
      
      // 确保请求的用户ID与token中的用户ID匹配
      if (decoded.userId !== userId) {
        return errorResponse('用户ID不匹配', 401)
      }
      
      // 生成新token
      const newToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email, iat: Math.floor(Date.now() / 1000) },
        secret,
        { expiresIn: JWT_EXPIRY, algorithm: JWT_ALGORITHM }
      )
      
      return successResponse({
        token: newToken,
        expiresIn: JWT_EXPIRY
      })
      
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return errorResponse('Token已过期，请重新登录', 401)
      }
      return errorResponse('无效的Token', 401)
    }
    
  } catch (error) {
    console.error('Token refresh error:', error)
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
