/**
 * 心动投递 - JWT Token 工具
 * 用于安全的用户认证
 * 
 * 安全升级版：
 * - 使用 HMAC-SHA256 签名
 * - 从环境变量读取密钥
 * - 支持令牌刷新
 */

import crypto from 'crypto'

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || ''
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || ''
const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7天
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000 // 30天

// 检查密钥是否配置
if (!JWT_SECRET) {
  console.error('⚠️ JWT_SECRET 环境变量未配置！请设置安全的密钥。')
}

interface TokenPayload {
  userId: string
  phone: string
  iat?: number
  exp?: number
  type?: 'access' | 'refresh'
}

interface TokenVerificationResult {
  valid: boolean
  payload?: TokenPayload
  expired?: boolean
}

// Base64 URL 编码
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Base64 URL 解码
function base64UrlDecode(str: string): string {
  // 补全 padding
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  return Buffer.from(base64, 'base64').toString()
}

// HMAC-SHA256 签名
function createSignature(data: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * 创建 JWT Token
 */
export function createToken(payload: Omit<TokenPayload, 'iat' | 'exp' | 'type'>): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET 未配置')
  }

  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + Math.floor(TOKEN_EXPIRY / 1000),
    type: 'access',
  }
  
  const headerEncoded = base64UrlEncode(JSON.stringify(header))
  const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload))
  const dataToSign = `${headerEncoded}.${payloadEncoded}`
  const signature = createSignature(dataToSign, JWT_SECRET)
  
  return `${dataToSign}.${signature}`
}

/**
 * 创建刷新令牌
 */
export function createRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp' | 'type'>): string {
  if (!JWT_REFRESH_SECRET) {
    // 如果没有单独的刷新密钥，使用主密钥
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET 未配置')
    }
  }

  const secret = JWT_REFRESH_SECRET || JWT_SECRET!
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + Math.floor(REFRESH_TOKEN_EXPIRY / 1000),
    type: 'refresh',
  }
  
  const headerEncoded = base64UrlEncode(JSON.stringify(header))
  const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload))
  const dataToSign = `${headerEncoded}.${payloadEncoded}`
  const signature = createSignature(dataToSign, secret)
  
  return `${dataToSign}.${signature}`
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): TokenPayload | null {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET 未配置')
    return null
  }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    
    const [headerEncoded, payloadEncoded, signature] = parts
    
    // 验证签名
    const dataToSign = `${headerEncoded}.${payloadEncoded}`
    const expectedSignature = createSignature(dataToSign, JWT_SECRET)
    
    // 使用恒定时间比较防止时序攻击
    const signatureBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expectedSignature)
    
    if (signatureBuffer.length !== expectedBuffer.length) {
      return null
    }
    
    if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return null
    }
    
    // 解析 payload
    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as TokenPayload
    
    // 检查类型（刷新令牌不能用作访问令牌）
    if (payload.type === 'refresh') {
      return null
    }
    
    // 检查过期
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    
    return payload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * 验证刷新令牌
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  if (!JWT_REFRESH_SECRET && !JWT_SECRET) {
    console.error('JWT_SECRET 未配置')
    return null
  }

  const secret = JWT_REFRESH_SECRET || JWT_SECRET!

  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    
    const [headerEncoded, payloadEncoded, signature] = parts
    
    // 验证签名
    const dataToSign = `${headerEncoded}.${payloadEncoded}`
    const expectedSignature = createSignature(dataToSign, secret)
    
    const signatureBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expectedSignature)
    
    if (signatureBuffer.length !== expectedBuffer.length) {
      return null
    }
    
    if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return null
    }
    
    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as TokenPayload
    
    // 检查类型
    if (payload.type !== 'refresh') {
      return null
    }
    
    // 检查过期
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    
    return payload
  } catch (error) {
    console.error('Refresh token verification failed:', error)
    return null
  }
}

/**
 * 验证令牌（详细结果）
 */
export function verifyTokenWithDetails(token: string): TokenVerificationResult {
  if (!JWT_SECRET) {
    return { valid: false }
  }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false }
    }
    
    const [headerEncoded, payloadEncoded, signature] = parts
    
    // 解析 payload 先检查过期
    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as TokenPayload
    
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, expired: true, payload }
    }
    
    // 验证签名
    const dataToSign = `${headerEncoded}.${payloadEncoded}`
    const expectedSignature = createSignature(dataToSign, JWT_SECRET)
    
    const signatureBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expectedSignature)
    
    if (signatureBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return { valid: false }
    }
    
    return { valid: true, payload }
  } catch (error) {
    return { valid: false }
  }
}

/**
 * 从 Token 获取用户 ID
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = verifyToken(token)
  return payload?.userId || null
}

/**
 * 从 Token 获取完整 payload（不验证签名）
 * 仅用于前端显示，不用于安全验证
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    
    return JSON.parse(base64UrlDecode(parts[1])) as TokenPayload
  } catch {
    return null
  }
}

/**
 * 检查令牌是否即将过期
 */
export function isTokenExpiringSoon(token: string, bufferMs: number = 5 * 60 * 1000): boolean {
  const payload = decodeToken(token)
  if (!payload?.exp) return false
  
  const expiryMs = payload.exp * 1000
  return expiryMs - Date.now() < bufferMs
}

/**
 * 使用刷新令牌获取新的访问令牌
 */
export function refreshAccessToken(refreshToken: string): {
  accessToken: string
  newRefreshToken?: string
} | null {
  const payload = verifyRefreshToken(refreshToken)
  if (!payload) {
    return null
  }
  
  // 创建新的访问令牌
  const accessToken = createToken({
    userId: payload.userId,
    phone: payload.phone,
  })
  
  // 如果刷新令牌即将过期，创建新的刷新令牌
  let newRefreshToken: string | undefined
  if (isTokenExpiringSoon(refreshToken, 7 * 24 * 60 * 60 * 1000)) { // 7天内过期
    newRefreshToken = createRefreshToken({
      userId: payload.userId,
      phone: payload.phone,
    })
  }
  
  return { accessToken, newRefreshToken }
}

// 导出过期时间常量
export { TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY }
