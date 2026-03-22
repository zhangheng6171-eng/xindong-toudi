'use client'

import { useState, useEffect, useCallback } from 'react'

// 用户数据类型
export interface User {
  id: string
  email: string
  nickname: string
  password: string
  gender: 'male' | 'female' | null
  age: number
  city: string
  avatar: string | null  // 添加头像字段
  createdAt: string
}

// Token类型
export interface AuthToken {
  token: string
  expiresAt: number
}

// 个人资料类型
export interface UserProfile {
  nickname: string
  age: number
  gender: string
  city: string
  occupation: string
  education: string
  height: number
  bio: string
  interests: string[]
  lookingFor: {
    minAge: number
    maxAge: number
    cities: string[]
    relationship: string
  }
}

// Token存储key
const TOKEN_KEY = 'xindong_auth_token'
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000 // 提前5分钟刷新

/**
 * 解析JWT获取过期时间
 */
function getTokenExpiry(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    if (payload.exp) {
      return payload.exp * 1000 // 转换为毫秒
    }
    return null
  } catch {
    return null
  }
}

/**
 * 检查token是否即将过期
 */
function isTokenExpiringSoon(token: string): boolean {
  const expiry = getTokenExpiry(token)
  if (!expiry) return false
  
  return expiry - Date.now() < TOKEN_EXPIRY_BUFFER
}

/**
 * 保存token到存储
 */
function saveToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (e) {
    console.error('Failed to save token:', e)
  }
}

/**
 * 从存储获取token
 */
function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

/**
 * 清除token
 */
function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}

// 用户认证 Hook
export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 初始化时加载用户和token
  useEffect(() => {
    // 从 localStorage 加载当前用户
    const userJson = localStorage.getItem('xindong_current_user')
    if (userJson) {
      try {
        const user = JSON.parse(userJson)
        setCurrentUser(user)
      } catch (e) {
        console.error('Failed to parse current user:', e)
        localStorage.removeItem('xindong_current_user')
      }
    }
    setIsLoading(false)
  }, [])

  // Token自动刷新
  useEffect(() => {
    if (!currentUser) return
    
    const storedToken = getStoredToken()
    if (!storedToken) return
    
    // 检查是否需要刷新token
    if (isTokenExpiringSoon(storedToken) && !isRefreshing) {
      setIsRefreshing(true)
      
      // 调用刷新API
      fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.token) {
          saveToken(data.token)
        } else if (data.error === 'Token已过期' || data.error === '无效的Token') {
          // Token已过期，清除登录状态
          clearToken()
          localStorage.removeItem('xindong_current_user')
          setCurrentUser(null)
          window.location.href = '/login'
        }
      })
      .catch(() => {})
      .finally(() => setIsRefreshing(false))
    }
    
    // 定期检查token状态（每分钟）
    const checkInterval = setInterval(() => {
      const token = getStoredToken()
      if (token && isTokenExpiringSoon(token) && !isRefreshing) {
        setIsRefreshing(true)
        
        fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.token) {
            saveToken(data.token)
          }
        })
        .catch(() => {})
        .finally(() => setIsRefreshing(false))
      }
    }, 60000)
    
    return () => clearInterval(checkInterval)
  }, [currentUser, isRefreshing])

  // 获取用户专属数据的 key
  const getUserKey = useCallback((key: string): string => {
    if (!currentUser) return ''
    return `xindong_${key}_${currentUser.id}`
  }, [currentUser])

  // 获取用户专属数据
  const getUserData = useCallback(<T,>(key: string, defaultValue: T): T => {
    if (!currentUser) return defaultValue
    const userKey = getUserKey(key)
    const data = localStorage.getItem(userKey)
    if (data) {
      try {
        return JSON.parse(data) as T
      } catch (e) {
        console.error(`Failed to parse ${key}:`, e)
      }
    }
    return defaultValue
  }, [currentUser, getUserKey])

  // 设置用户专属数据
  const setUserData = useCallback(<T,>(key: string, value: T): void => {
    if (!currentUser) return
    const userKey = getUserKey(key)
    localStorage.setItem(userKey, JSON.stringify(value))
  }, [currentUser, getUserKey])

  // 登录后设置token
  const setAuthToken = useCallback((token: string) => {
    saveToken(token)
  }, [])

  // 获取当前token
  const getAuthToken = useCallback((): string | null => {
    return getStoredToken()
  }, [])

  // 登出
  const logout = useCallback(() => {
    clearToken()
    localStorage.removeItem('xindong_current_user')
    setCurrentUser(null)
  }, [])

  return {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    getUserKey,
    getUserData,
    setUserData,
    setAuthToken,
    getAuthToken,
    logout
  }
}

// 用于保护路由的 Hook
export function useRequireAuth(redirectUrl: string = '/login') {
  const { currentUser, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectUrl
    }
  }, [isLoading, isAuthenticated, redirectUrl])

  return { currentUser, isLoading, isAuthenticated }
}

// 默认用户资料
export const defaultProfile: UserProfile = {
  nickname: '',  // 不再硬编码默认昵称
  age: 25,
  gender: 'male',
  city: '',
  occupation: '',
  education: '',
  height: 175,
  bio: '',
  interests: [],
  lookingFor: {
    minAge: 18,
    maxAge: 35,
    cities: [],
    relationship: 'serious'
  }
}
