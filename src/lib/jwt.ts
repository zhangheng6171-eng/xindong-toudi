/**
 * 心动投递 - JWT Token 工具
 * 用于安全的用户认证
 */

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'xindong-toudi-secret-key-change-in-production'
const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7天

interface TokenPayload {
  userId: string
  phone: string
  iat?: number
  exp?: number
}

// 简单的Base64编码
function base64Encode(str: string): string {
  return Buffer.from(str).toString('base64url')
}

// 简单的Base64解码
function base64Decode(str: string): string {
  return Buffer.from(str, 'base64url').toString()
}

// 创建JWT Token
export function createToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + Math.floor(TOKEN_EXPIRY / 1000)
  }
  
  const headerEncoded = base64Encode(JSON.stringify(header))
  const payloadEncoded = base64Encode(JSON.stringify(fullPayload))
  const signature = base64Encode(JWT_SECRET + '.' + headerEncoded + '.' + payloadEncoded)
  
  return `${headerEncoded}.${payloadEncoded}.${signature}`
}

// 验证JWT Token
export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const [headerEncoded, payloadEncoded, signature] = parts
    const expectedSignature = base64Encode(JWT_SECRET + '.' + headerEncoded + '.' + payloadEncoded)
    
    if (signature !== expectedSignature) return null
    
    const payload = JSON.parse(base64Decode(payloadEncoded)) as TokenPayload
    
    // 检查过期
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    
    return payload
  } catch {
    return null
  }
}

// 从Token获取用户ID
export function getUserIdFromToken(token: string): string | null {
  const payload = verifyToken(token)
  return payload?.userId || null
}

export { TOKEN_EXPIRY }
