import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 微信开放平台配置
const WECHAT_APP_ID = process.env.WECHAT_APP_ID || ''
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET || ''
const WECHAT_REDIRECT_URI = process.env.WECHAT_REDIRECT_URI || ''
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'default-secret-change-me'

// 服务端 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

// 生成JWT Token的简单实现
function generateToken(payload: Record<string, unknown>): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const expiresIn = 7 * 24 * 60 * 60 // 7天
  
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn
  }
  
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url')
  const base64Payload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url')
  
  // 简单的HMAC签名（实际生产建议使用jsonwebtoken库）
  const crypto = require('crypto')
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url')
  
  return `${base64Header}.${base64Payload}.${signature}`
}

/**
 * 微信登录初始化
 * GET /api/auth/wechat/login
 * 
 * 返回微信授权跳转URL
 */
export async function GET(request: NextRequest) {
  try {
    // 检查微信配置
    if (!WECHAT_APP_ID || !WECHAT_APP_SECRET) {
      return NextResponse.json(
        { success: false, error: '微信登录配置错误，请联系管理员' },
        { status: 500 }
      )
    }

    // 生成state参数（用于防止CSRF）
    const state = crypto.randomUUID()
    
    // 存储state到缓存（实际生产建议使用Redis或数据库）
    // 这里简单使用内存存储，生产环境请使用Redis
    if (!(global as unknown as { wechatStates?: Map<string, number> }).wechatStates) {
      (global as unknown as { wechatStates?: Map<string, number> }).wechatStates = new Map()
    }
    (global as unknown as { wechatStates?: Map<string, number> }).wechatStates!.set(state, Date.now() + 10 * 60 * 1000) // 10分钟过期

    // 微信授权 URL
    const scope = 'snsapi_login' // 网页应用使用snsapi_login
    const authUrl = new URL('https://open.weixin.qq.com/connect/qrconnect')
    authUrl.searchParams.append('appid', WECHAT_APP_ID)
    authUrl.searchParams.append('redirect_uri', WECHAT_REDIRECT_URI)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('scope', scope)
    authUrl.searchParams.append('state', state)
    // #wechat_redirect 是微信要求的回调标识
    authUrl.hash = 'wechat_redirect'

    return NextResponse.json({
      success: true,
      authUrl: authUrl.toString(),
      state
    })
  } catch (error) {
    console.error('[Wechat Login Init] Error:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * 微信登录回调处理
 * POST /api/auth/wechat/login
 * 
 * 处理微信授权回调，绑定或创建用户
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, state } = body

    // 验证参数
    if (!code) {
      return NextResponse.json(
        { success: false, error: '缺少授权码' },
        { status: 400 }
      )
    }

    // 验证state
    if (state && (global as unknown as { wechatStates?: Map<string, number> }).wechatStates) {
      const stateExpire = (global as unknown as { wechatStates?: Map<string, number> }).wechatStates!.get(state)
      if (!stateExpire || stateExpire < Date.now()) {
        return NextResponse.json(
          { success: false, error: 'state已过期，请重试' },
          { status: 400 }
        )
      }
      (global as unknown as { wechatStates?: Map<string, number> }).wechatStates!.delete(state)
    }

    // 1. 用code换取access_token
    const tokenUrl = new URL('https://api.weixin.qq.com/sns/oauth2/access_token')
    tokenUrl.searchParams.append('appid', WECHAT_APP_ID)
    tokenUrl.searchParams.append('secret', WECHAT_APP_SECRET)
    tokenUrl.searchParams.append('code', code)
    tokenUrl.searchParams.append('grant_type', 'authorization_code')

    const tokenResponse = await fetch(tokenUrl.toString())
    const tokenData = await tokenResponse.json()

    if (tokenData.errcode) {
      console.error('[Wechat] Token error:', tokenData)
      return NextResponse.json(
        { success: false, error: '微信授权失败，请重试' },
        { status: 400 }
      )
    }

    const { access_token, openid, unionid } = tokenData

    // 2. 用access_token获取用户信息
    const userInfoUrl = new URL('https://api.weixin.qq.com/sns/userinfo')
    userInfoUrl.searchParams.append('access_token', access_token)
    userInfoUrl.searchParams.append('openid', openid)
    userInfoUrl.searchParams.append('lang', 'zh_CN')

    const userInfoResponse = await fetch(userInfoUrl.toString())
    const userInfo = await userInfoResponse.json()

    if (userInfo.errcode) {
      console.error('[Wechat] Userinfo error:', userInfo)
      return NextResponse.json(
        { success: false, error: '获取用户信息失败' },
        { status: 400 }
      )
    }

    console.log('[Wechat] User info:', userInfo)

    // 3. 查找或创建用户
    // 优先使用unionid（需要微信开放平台绑定微信开放平台和公众号/小程序）
    // 否则使用openid
    const wechatId = unionid || openid

    // 查询是否已存在微信用户
    let existingUser = null
    
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('wechat_openid', wechatId)
        .single()
      
      // 如果错误不是"没有找到行"，记录日志
      if (error && error.code !== 'PGRST116') {
        console.log('[Wechat] User fetch warning:', error.message)
      }
      existingUser = data
    } catch (e) {
      // 表中可能没有wechat_openid字段，继续创建新用户
      console.log('[Wechat] User fetch error (possibly missing column):', e)
    }

    let user

    if (existingUser) {
      // 用户已存在，更新信息
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          nickname: userInfo.nickname || existingUser.nickname,
          avatar: userInfo.headimgurl || existingUser.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single()

      if (updateError) {
        console.error('[Wechat] Update user error:', updateError)
        return NextResponse.json(
          { success: false, error: '更新用户信息失败' },
          { status: 500 }
        )
      }

      user = updatedUser
    } else {
      // 创建新用户
      const insertData: Record<string, unknown> = {
        email: `wechat_${wechatId}@xindong.local`,
        nickname: userInfo.nickname || `微信用户_${wechatId.slice(0, 6)}`,
        password: crypto.randomUUID(), // 随机密码，微信用户不需要密码登录
        avatar: userInfo.headimgurl || null,
        gender: userInfo.sex === 1 ? 'male' : userInfo.sex === 2 ? 'female' : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // 尝试添加wechat_openid字段（如果数据库支持）
      try {
        insertData.wechat_openid = wechatId
      } catch {
        // 忽略，字段可能不存在
      }

      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert(insertData)
        .select()
        .single()

      if (createError) {
        console.error('[Wechat] Create user error:', createError)
        // 可能是用户已存在（并发情况），或者wechat_openid字段不存在
        if (createError.code === '23505') {
          // 唯一约束冲突，尝试重新查询
          try {
            const { data: retryUser } = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('wechat_openid', wechatId)
              .single()
            
            if (retryUser) {
              user = retryUser
            } else {
              return NextResponse.json(
                { success: false, error: '创建用户失败' },
                { status: 500 }
              )
            }
          } catch {
            return NextResponse.json(
              { success: false, error: '创建用户失败' },
              { status: 500 }
            )
          }
        } else {
          return NextResponse.json(
            { success: false, error: '创建用户失败' },
            { status: 500 }
          )
        }
      } else {
        user = newUser
      }
    }

    // 4. 生成JWT Token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      type: 'wechat'
    })

    // 5. 返回用户信息和token
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        gender: user.gender,
        age: user.age,
        city: user.city,
        createdAt: user.created_at
      },
      token
    })
  } catch (error) {
    console.error('[Wechat Login] Error:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
