/**
 * 发送验证码API
 * POST /api/auth/sms/send
 * 
 * 验证码规则：
 * - 6位数字
 * - 5分钟有效期
 * - 同一手机号每60秒可重新发送
 */

import { NextRequest, NextResponse } from 'next/server'

// 验证码存储（内存存储，生产环境建议使用Redis或数据库）
// 结构: { phone: { code: string, expiresAt: number, lastSendAt: number, errorCount: number, lockedUntil: number } }
const verificationCodes = new Map<string, {
  code: string
  expiresAt: number
  lastSendAt: number
  errorCount: number
  lockedUntil: number
}>()

// 配置
const CODE_EXPIRY_MS = 5 * 60 * 1000 // 5分钟
const RESEND_INTERVAL_MS = 60 * 1000 // 60秒
const LOCK_DURATION_MS = 15 * 60 * 1000 // 15分钟
const MAX_ERRORS = 3 // 最大错误次数
const CODE_LENGTH = 6

// 生成6位数字验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 验证手机号格式（中国大陆手机号）
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 发送验证码（模拟，实际应该调用短信服务）
async function sendSMS(phone: string, code: string): Promise<boolean> {
  // 实际项目中应该调用短信服务API，如阿里云、腾讯云等
  // 这里仅打印日志模拟发送
  console.log(`[SMS] 发送验证码 ${code} 到手机号 ${phone}`)
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    // 验证手机号
    if (!phone) {
      return NextResponse.json(
        { success: false, error: '请输入手机号' },
        { status: 400 }
      )
    }

    // 清理手机号格式
    const cleanPhone = phone.replace(/\s/g, '')

    if (!isValidPhone(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: '请输入正确的手机号' },
        { status: 400 }
      )
    }

    const now = Date.now()
    const existing = verificationCodes.get(cleanPhone)

    // 检查是否被锁定
    if (existing && existing.lockedUntil > now) {
      const remainingSeconds = Math.ceil((existing.lockedUntil - now) / 1000)
      return NextResponse.json(
        { 
          success: false, 
          error: `验证码错误次数过多，请${Math.floor(remainingSeconds / 60)}分钟后再试` 
        },
        { status: 429 }
      )
    }

    // 检查是否可以重新发送（60秒冷却）
    if (existing && existing.lastSendAt && (now - existing.lastSendAt) < RESEND_INTERVAL_MS) {
      const remainingSeconds = RESEND_INTERVAL_MS - (now - existing.lastSendAt)
      return NextResponse.json(
        { 
          success: false, 
          error: `发送太频繁，请${Math.ceil(remainingSeconds / 1000)}秒后再试` 
        },
        { status: 429 }
      )
    }

    // 生成新验证码
    const code = generateCode()
    const expiresAt = now + CODE_EXPIRY_MS

    // 存储验证码
    verificationCodes.set(cleanPhone, {
      code,
      expiresAt,
      lastSendAt: now,
      errorCount: existing?.errorCount || 0,
      lockedUntil: 0
    })

    // 发送验证码（异步，不阻塞响应）
    await sendSMS(cleanPhone, code)

    return NextResponse.json({
      success: true,
      message: '验证码已发送',
      // 开发环境返回验证码以便测试
      ...(process.env.NODE_ENV === 'development' && { debugCode: code })
    })

  } catch (error) {
    console.error('[SMS Send] Error:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
