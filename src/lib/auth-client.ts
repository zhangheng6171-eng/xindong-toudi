/**
 * 前端认证API Helper
 * 自动在请求中附加JWT Token
 */

const TOKEN_KEY = 'xindong_auth_token'

/**
 * 获取存储的JWT Token
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

/**
 * 设置JWT Token
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (e) {
    console.error('Failed to save token:', e)
  }
}

/**
 * 清除JWT Token
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}

/**
 * 解析JWT Token获取用户信息
 */
export function parseJwt(token: string): { userId?: string; email?: string; exp?: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch {
    return null
  }
}

/**
 * 检查Token是否即将过期
 */
export function isTokenExpiringSoon(token: string, bufferMs: number = 5 * 60 * 1000): boolean {
  const payload = parseJwt(token)
  if (!payload?.exp) return false
  
  const expiryMs = payload.exp * 1000
  return expiryMs - Date.now() < bufferMs
}

/**
 * 检查Token是否已过期
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token)
  if (!payload?.exp) return false
  
  return payload.exp * 1000 < Date.now()
}

/**
 * 认证Fetch包装器
 * 自动在请求中添加Authorization header
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken()
  
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  return fetch(url, {
    ...options,
    headers
  })
}

/**
 * 带认证的POST请求
 */
export async function authPost(
  url: string,
  data: Record<string, unknown>
): Promise<Response> {
  return authFetch(url, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * 带认证的GET请求
 */
export async function authGet(url: string): Promise<Response> {
  return authFetch(url, {
    method: 'GET'
  })
}

/**
 * 带认证的PUT请求
 */
export async function authPut(
  url: string,
  data: Record<string, unknown>
): Promise<Response> {
  return authFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

/**
 * 带认证的DELETE请求
 */
export async function authDelete(url: string): Promise<Response> {
  return authFetch(url, {
    method: 'DELETE'
  })
}
