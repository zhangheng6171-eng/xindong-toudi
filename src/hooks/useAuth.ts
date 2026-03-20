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
  createdAt: string
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

// 用户认证 Hook
export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  // 登出
  const logout = useCallback(() => {
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
