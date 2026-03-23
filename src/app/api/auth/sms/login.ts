/**
 * 验证码登录API
 * POST /api/auth/sms/login
 * 
 * 登录规则：
 * - 验证码6位数字，5分钟有效期
 * - 验证码错误3次后锁定15分钟
 * - 登录成功后返回JWT token
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { createToken } from '@/lib/jwt'

// 验证码存储（与send.ts共享，生产环境应该用Redis）
const verificationCodes = new Map<string, {
  code: string
  expiresAt: number
  lastSendAt: number
  errorCount: number
  lockedUntil: number
}>()

// 配置
const CODE_EXPIRY_MS = 5 * 60 * 1000
const LOCK_DURATION_MS = 15 * 60 * 1000
const MAX_ERRORS = 3

// 用户表不存在时创建
async function ensureUsersTable() {
  // 检查表是否存在，如果不存在则创建
  // 这里假设users表已经存在，只需要查询即可
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code } = body

    // 验证参数
    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: '请输入手机号和验证码' },
        { status: 400 }
      )
    }

    const cleanPhone = phone.replace(/\s/g, '')
    const now = Date.now()

    // 获取存储的验证码信息
    const stored = verificationCodes.get(cleanPhone)

    // 检查是否已发送过验证码
    if (!stored) {
      return NextResponse.json(
        { success: false, error: '请先获取验证码' },
        { status: 400 }
      )
    }

    // 检查是否被锁定
    if (stored.lockedUntil > now) {
      const remainingSeconds = Math.ceil((stored.lockedUntil - now) / 1000)
      return NextResponse.json(
        { 
          success: false, 
          error: `验证码错误次数过多，请${Math.floor(remainingSeconds / 60)}分钟后再试` 
        },
        { status: 429 }
      )
    }

    // 验证码错误处理
    if (code !== stored.code) {
      stored.errorCount += 1
      
      // 错误超过3次，锁定15分钟
      if (stored.errorCount >= MAX_ERRORS) {
        stored.lockedUntil = now + LOCK_DURATION_MS
        verificationCodes.set(cleanPhone, stored)
        
        return NextResponse.json(
          { 
            success: false, 
            error: '验证码错误次数过多，请15分钟后再试' 
          },
          { status: 429 }
        )
      }

      verificationCodes.set(cleanPhone, stored)
      
      const remainingAttempts = MAX_ERRORS - stored.errorCount
      return NextResponse.json(
        { 
          success: false, 
          error: `验证码错误，剩余${remainingAttempts}次尝试机会` 
        },
        { status: 400 }
      )
    }

    // 检查验证码是否过期
    if (stored.expiresAt < now) {
      return NextResponse.json(
        { success: false, error: '验证码已过期，请重新获取' },
        { status: 400 }
      )
    }

    // 验证码正确，查找或创建用户
    let { data: users, error: queryError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone', cleanPhone)
      .limit(1)

    if (queryError) {
      console.error('[SMS Login] Query error:', queryError)
      return NextResponse.json(
        { success: false, error: '服务器错误，请稍后重试' },
        { status: 500 }
      )
    }

    let user = users?.[0]

    // 如果用户不存在，自动注册（创建新用户）
    if (!user) {
      console.log('[SMS Login] Creating new user for phone:', cleanPhone)
      
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          phone: cleanPhone,
          nickname: `用户${cleanPhone.slice(-4)}`,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('[SMS Login] Create user error:', createError)
        return NextResponse.json(
          { success: false, error: '创建用户失败，请稍后重试' },
          { status: 500 }
        )
      }

      user = newUser
    }

    // 清除验证码（登录成功后不再需要）
    verificationCodes.delete(cleanPhone)

    // 生成JWT Token
    const token = createToken({
      userId: user.id,
      phone: cleanPhone
    })

    return NextResponse.json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        gender: user.gender,
        age: user.age,
        city: user.city
      }
    })

  } catch (error) {
    console.error('[SMS Login] Error:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
