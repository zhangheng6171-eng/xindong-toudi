/**
 * 心动投递 - 测试数据脚本
 * 用于创建测试用户、匹配记录和反馈记录
 * 
 * 运行方式: npx ts-node scripts/seed-test-data.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

// Supabase 配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ntaqnyegiiwtzdyqjiwy.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

interface User {
  id: string
  nickname: string
  gender: string
  age: number
  city: string
  occupation: string
  education: string
  height: number
  bio: string
  interests: string[]
  avatar: string | null
  questionnaire_completed: boolean
}

interface WeeklyMatch {
  id: string
  user_id_1: string
  user_id_2: string
  week_number: number
  match_date: string
  compatibility_score: number
  match_reasons: string[]
  status: string
}

interface DateFeedback {
  match_id: string
  user_id: string
  overall_rating: number
  would_meet_again: boolean
  what_went_well: string
  what_could_improve: string
  personality_match_rating: number
  values_match_rating: number
  interests_match_rating: number
  want_to_continue: boolean
}

interface MatchHistoryEntry {
  user_id: string
  matched_user_id: string
  week_number: string
  compatibility_score: number
  match_reasons: string[]
  outcome: string
}

// 等待函数
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 生成UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 获取当前周数
function getCurrentWeekNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneWeek = 604800000
  return Math.ceil((diff + start.getDay() * 86400000) / oneWeek)
}

// 创建测试用户
async function createTestUsers(): Promise<User[]> {
  console.log('\n👥 创建测试用户...')
  
  const testUsers: Partial<User>[] = [
    {
      nickname: '测试用户小明',
      gender: 'male',
      age: 28,
      city: '北京',
      occupation: '软件工程师',
      education: '清华大学',
      height: 178,
      bio: '喜欢编程、跑步和旅行。寻找认真对待感情的女生。',
      interests: ['编程', '跑步', '旅行', '摄影'],
      avatar: null,
      questionnaire_completed: true
    },
    {
      nickname: '测试用户小红',
      gender: 'female',
      age: 26,
      city: '北京',
      occupation: '产品经理',
      education: '北京大学',
      height: 165,
      bio: '热爱生活，喜欢探索新事物。希望找到真诚的另一半。',
      interests: ['阅读', '音乐', '烹饪', '瑜伽'],
      avatar: null,
      questionnaire_completed: true
    },
    {
      nickname: '测试用户小刚',
      gender: 'male',
      age: 30,
      city: '上海',
      occupation: '设计师',
      education: '上海交大',
      height: 180,
      bio: '热爱艺术和设计，追求高品质生活。',
      interests: ['设计', '艺术', '健身', '咖啡'],
      avatar: null,
      questionnaire_completed: true
    },
    {
      nickname: '测试用户小美',
      gender: 'female',
      age: 27,
      city: '北京',
      occupation: '教师',
      education: '北师大',
      height: 162,
      bio: '喜欢孩子和教育事业，期待遇到有缘人。',
      interests: ['教育', '阅读', '旅行', '绘画'],
      avatar: null,
      questionnaire_completed: true
    },
    {
      nickname: '测试用户小华',
      gender: 'male',
      age: 29,
      city: '北京',
      occupation: '金融分析师',
      education: '人大',
      height: 175,
      bio: '理性分析，感性生活。寻找志同道合的她。',
      interests: ['投资', '篮球', '科幻', '美食'],
      avatar: null,
      questionnaire_completed: true
    }
  ]

  const createdUsers: User[] = []

  for (const userData of testUsers) {
    const user: User = {
      ...userData as User,
      id: generateUUID()
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          id: user.id,
          nickname: user.nickname,
          gender: user.gender,
          age: user.age,
          city: user.city,
          occupation: user.occupation,
          education: user.education,
          height: user.height,
          bio: user.bio,
          interests: user.interests,
          avatar: user.avatar,
          questionnaire_completed: user.questionnaire_completed,
          questionnaire_completed_at: new Date().toISOString()
        })
      })

      if (response.ok) {
        console.log(`   ✅ 创建用户: ${user.nickname} (${user.id})`)
        createdUsers.push(user)
      } else {
        const error = await response.text()
        console.log(`   ⚠️ 用户 ${user.nickname} 可能已存在: ${error.substring(0, 100)}`)
        
        // 尝试获取已存在的用户
        const existingUser = await fetch(
          `${SUPABASE_URL}/rest/v1/users?nickname=eq.${encodeURIComponent(user.nickname)}&select=*&limit=1`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
          }
        )
        
        if (existingUser.ok) {
          const users = await existingUser.json()
          if (users && users.length > 0) {
            console.log(`   ℹ️ 使用已存在用户: ${users[0].nickname}`)
            createdUsers.push(users[0] as User)
          }
        }
      }
    } catch (e) {
      console.log(`   ❌ 创建用户失败: ${user.nickname}`)
    }

    await delay(200) // 避免速率限制
  }

  return createdUsers
}

// 创建测试匹配记录
async function createTestMatches(users: User[]): Promise<WeeklyMatch[]> {
  console.log('\n💕 创建测试匹配记录...')
  
  if (users.length < 2) {
    console.log('   ⚠️ 用户数量不足，无法创建匹配')
    return []
  }

  const weekNumber = getCurrentWeekNumber()
  const today = new Date().toISOString().split('T')[0]
  
  const testMatches: WeeklyMatch[] = [
    {
      id: generateUUID(),
      user_id_1: users[0].id,
      user_id_2: users[1].id,
      week_number: weekNumber,
      match_date: today,
      compatibility_score: 92.5,
      match_reasons: ['年龄相仿', '同城', '兴趣匹配'],
      status: 'viewed'
    },
    {
      id: generateUUID(),
      user_id_1: users[2].id,
      user_id_2: users[3].id,
      week_number: weekNumber,
      match_date: today,
      compatibility_score: 88.0,
      match_reasons: ['价值观相似', '教育背景匹配'],
      status: 'pending'
    },
    {
      id: generateUUID(),
      user_id_1: users[4].id,
      user_id_2: users[0].id,
      week_number: weekNumber - 1,
      match_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      compatibility_score: 85.5,
      match_reasons: ['职业互补', '兴趣重叠'],
      status: 'dated'
    }
  ]

  const createdMatches: WeeklyMatch[] = []

  for (const match of testMatches) {
    try {
      // 检查表是否存在
      const checkTable = await fetch(`${SUPABASE_URL}/rest/v1/weekly_matches?select=id&limit=1`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      })

      if (!checkTable.ok) {
        console.log('   ⚠️ weekly_matches 表不存在，跳过创建匹配记录')
        console.log('   💡 请先在 Supabase Dashboard 执行迁移SQL')
        break
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/weekly_matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(match)
      })

      if (response.ok) {
        console.log(`   ✅ 创建匹配记录: ${match.id}`)
        createdMatches.push(match)
      } else {
        const error = await response.text()
        console.log(`   ⚠️ 匹配记录创建失败: ${error.substring(0, 80)}`)
      }
    } catch (e) {
      console.log(`   ❌ 创建匹配记录出错`)
    }

    await delay(200)
  }

  return createdMatches
}

// 创建测试反馈记录
async function createTestFeedback(matches: WeeklyMatch[], users: User[]): Promise<void> {
  console.log('\n📝 创建测试反馈记录...')
  
  if (matches.length === 0 || users.length < 2) {
    console.log('   ⚠️ 匹配记录或用户不足，跳过创建反馈')
    return
  }

  // 检查表是否存在
  const checkTable = await fetch(`${SUPABASE_URL}/rest/v1/date_feedback?select=id&limit=1`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  })

  if (!checkTable.ok) {
    console.log('   ⚠️ date_feedback 表不存在，跳过创建反馈记录')
    return
  }

  const testFeedback: DateFeedback[] = [
    {
      match_id: matches[0].id,
      user_id: matches[0].user_id_1,
      overall_rating: 4,
      would_meet_again: true,
      what_went_well: '聊得很开心，对方很有内涵',
      what_could_improve: '可以更主动一些',
      personality_match_rating: 4,
      values_match_rating: 5,
      interests_match_rating: 4,
      want_to_continue: true
    },
    {
      match_id: matches[0].id,
      user_id: matches[0].user_id_2,
      overall_rating: 5,
      would_meet_again: true,
      what_went_well: '很有礼貌，见多识广',
      what_could_improve: '可以更放松一些',
      personality_match_rating: 5,
      values_match_rating: 4,
      interests_match_rating: 3,
      want_to_continue: true
    }
  ]

  for (const feedback of testFeedback) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/date_feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(feedback)
      })

      if (response.ok) {
        console.log(`   ✅ 创建反馈记录: ${feedback.match_id} - 用户 ${feedback.user_id.substring(0, 8)}`)
      } else {
        const error = await response.text()
        console.log(`   ⚠️ 反馈创建失败: ${error.substring(0, 80)}`)
      }
    } catch (e) {
      console.log(`   ❌ 创建反馈出错`)
    }

    await delay(200)
  }
}

// 创建测试历史记录
async function createTestHistory(users: User[]): Promise<void> {
  console.log('\n📜 创建测试历史记录...')
  
  if (users.length < 2) {
    console.log('   ⚠️ 用户数量不足，跳过创建历史记录')
    return
  }

  // 检查表是否存在
  const checkTable = await fetch(`${SUPABASE_URL}/rest/v1/match_history?select=id&limit=1`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  })

  if (!checkTable.ok) {
    console.log('   ⚠️ match_history 表不存在，跳过创建历史记录')
    return
  }

  const weekNumber = getCurrentWeekNumber()
  const testHistory: MatchHistoryEntry[] = [
    {
      user_id: users[0].id,
      matched_user_id: users[1].id,
      week_number: `2026-W${weekNumber}`,
      compatibility_score: 92.5,
      match_reasons: ['年龄相仿', '同城', '兴趣匹配'],
      outcome: 'viewed'
    },
    {
      user_id: users[0].id,
      matched_user_id: users[2].id,
      week_number: `2026-W${weekNumber - 1}`,
      compatibility_score: 85.5,
      match_reasons: ['职业互补', '兴趣重叠'],
      outcome: 'dated'
    },
    {
      user_id: users[1].id,
      matched_user_id: users[0].id,
      week_number: `2026-W${weekNumber}`,
      compatibility_score: 92.5,
      match_reasons: ['年龄相仿', '同城', '兴趣匹配'],
      outcome: 'contacted'
    }
  ]

  for (const history of testHistory) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/match_history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(history)
      })

      if (response.ok) {
        console.log(`   ✅ 创建历史记录: 用户 ${history.user_id.substring(0, 8)} -> ${history.matched_user_id.substring(0, 8)}`)
      } else {
        const error = await response.text()
        console.log(`   ⚠️ 历史记录创建失败: ${error.substring(0, 80)}`)
      }
    } catch (e) {
      console.log(`   ❌ 创建历史记录出错`)
    }

    await delay(200)
  }
}

// 主函数
async function main() {
  console.log('='.repeat(50))
  console.log('🎯 心动投递 - 测试数据生成脚本')
  console.log('='.repeat(50))
  console.log(`\n📡 Supabase URL: ${SUPABASE_URL}`)
  console.log(`📅 当前周数: ${getCurrentWeekNumber()}`)

  // 创建测试用户
  const users = await createTestUsers()
  
  if (users.length === 0) {
    console.log('\n❌ 没有创建或获取到任何用户')
    process.exit(1)
  }

  console.log(`\n✅ 成功获取 ${users.length} 个用户`)

  // 创建匹配记录
  const matches = await createTestMatches(users)
  
  // 创建反馈记录
  await createTestFeedback(matches, users)
  
  // 创建历史记录
  await createTestHistory(users)

  console.log('\n' + '='.repeat(50))
  console.log('✨ 测试数据生成完成！')
  console.log('='.repeat(50))
  
  console.log('\n📋 后续步骤:')
  console.log('1. 如果表不存在，请在 Supabase Dashboard 执行迁移SQL')
  console.log('2. 访问 Supabase Dashboard 验证数据:')
  console.log(`   ${SUPABASE_URL.replace('/rest/v1', '')}/project/_/editor`)
}

main().catch(console.error)
