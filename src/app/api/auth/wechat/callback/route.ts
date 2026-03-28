import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 微信开放平台配置（可选）
const WECHAT_APP_ID = process.env.WECHAT_APP_ID || ''
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET || ''
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'default-secret-change-me'

// 服务端 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabaseAdmin = WECHAT_APP_ID && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null

// 生成JWT Token
function generateToken(payload: Record<string, unknown>): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const expiresIn = 7 * 24 * 60 * 60
  
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn
  }
  
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url')
  const base64Payload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url')
  
  const crypto = require('crypto')
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url')
  
  return `${base64Header}.${base64Payload}.${signature}`
}

/**
 * 微信回调处理
 * GET /api/auth/wechat/callback
 * 
 * 微信授权后会携带code和state参数回调此接口
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // 处理用户拒绝授权
    if (error) {
      console.error('[Wechat Callback] User denied:', errorDescription)
      // 重定向到登录页并显示错误
      const loginUrl = new URL('/login', request.nextUrl.origin)
      loginUrl.searchParams.set('error', 'wechat_denied')
      return NextResponse.redirect(loginUrl)
    }

    // 验证code
    if (!code) {
      const loginUrl = new URL('/login', request.nextUrl.origin)
      loginUrl.searchParams.set('error', 'wechat_no_code')
      return NextResponse.redirect(loginUrl)
    }

    // 验证state（防止CSRF）
    if (state && (global as unknown as { wechatStates?: Map<string, number> }).wechatStates) {
      const stateExpire = (global as unknown as { wechatStates?: Map<string, number> }).wechatStates!.get(state)
      if (!stateExpire || stateExpire < Date.now()) {
        const loginUrl = new URL('/login', request.nextUrl.origin)
        loginUrl.searchParams.set('error', 'wechat_state_expired')
        return NextResponse.redirect(loginUrl)
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
      console.error('[Wechat Callback] Token error:', tokenData)
      const loginUrl = new URL('/login', request.nextUrl.origin)
      loginUrl.searchParams.set('error', 'wechat_token_failed')
      return NextResponse.redirect(loginUrl)
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
      console.error('[Wechat Callback] Userinfo error:', userInfo)
      const loginUrl = new URL('/login', request.nextUrl.origin)
      loginUrl.searchParams.set('error', 'wechat_userinfo_failed')
      return NextResponse.redirect(loginUrl)
    }

    console.log('[Wechat Callback] User info:', userInfo)

    // 3. 查找或创建用户
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
        console.log('[Wechat Callback] User fetch warning:', error.message)
      }
      existingUser = data
    } catch (e) {
      // 表中可能没有wechat_openid字段，继续创建新用户
      console.log('[Wechat Callback] User fetch error (possibly missing column):', e)
    }

    let user

    if (existingUser) {
      // 用户已存在，更新信息
      const { data: updatedUser } = await supabaseAdmin
        .from('users')
        .update({
          nickname: userInfo.nickname || existingUser.nickname,
          avatar: userInfo.headimgurl || existingUser.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single()

      user = updatedUser
    } else {
      // 创建新用户
      const insertData: Record<string, unknown> = {
        email: `wechat_${wechatId}@xindong.local`,
        nickname: userInfo.nickname || `微信用户_${wechatId.slice(0, 6)}`,
        password: crypto.randomUUID(),
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
        console.error('[Wechat Callback] Create user error:', createError)
        // 尝试通过邮箱查找现有用户
        try {
          const { data: existingByEmail } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', `wechat_${wechatId}@xindong.local`)
            .single()
          
          if (existingByEmail) {
            user = existingByEmail
          } else {
            const loginUrl = new URL('/login', request.nextUrl.origin)
            loginUrl.searchParams.set('error', 'wechat_login_failed')
            return NextResponse.redirect(loginUrl)
          }
        } catch {
          const loginUrl = new URL('/login', request.nextUrl.origin)
          loginUrl.searchParams.set('error', 'wechat_login_failed')
          return NextResponse.redirect(loginUrl)
        }
      } else {
        user = newUser
      }
    }

    if (!user) {
      const loginUrl = new URL('/login', request.nextUrl.origin)
      loginUrl.searchParams.set('error', 'wechat_login_failed')
      return NextResponse.redirect(loginUrl)
    }

    // 4. 生成JWT Token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      type: 'wechat'
    })

    // 5. 重定向到首页或绑定页面（如果有需要绑定的手机号）
    // 这里直接返回token到前端，通过URL hash传递
    const redirectUrl = new URL('/dashboard', request.nextUrl.origin)
    redirectUrl.hash = `wechat_token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      gender: user.gender,
      age: user.age,
      city: user.city,
      createdAt: user.created_at
    }))}`
    
    // 标记是微信登录成功的回调
    redirectUrl.searchParams.set('wechat_login', 'success')

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('[Wechat Callback] Error:', error)
    const loginUrl = new URL('/login', request.nextUrl.origin)
    loginUrl.searchParams.set('error', 'wechat_error')
    return NextResponse.redirect(loginUrl)
  }
}
