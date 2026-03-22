/**
 * 心动投递 - 向量匹配 API
 * 
 * 提供向量匹配相关接口
 */

import { vectorizeUserFromQuestionnaire } from '../../src/lib/user-vectorization'
import { calculateMatchV2, batchMatchV2 } from '../../src/lib/matching-algorithm-v2'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

/**
 * 向量匹配 API 处理函数
 */
export async function handleVectorMatch(request: Request): Promise<Response> {
  // 处理 CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    // POST: 计算匹配
    if (request.method === 'POST') {
      const body = await request.json()
      
      if (action === 'calculate') {
        return handleCalculateMatch(body)
      } else if (action === 'batch') {
        return handleBatchMatch(body)
      } else if (action === 'vectorize') {
        return handleVectorize(body)
      }
    }

    // GET: 获取匹配结果
    if (request.method === 'GET') {
      if (action === 'list') {
        return handleListMatches(url)
      }
    }

    return jsonResponse({ error: 'Invalid action' }, 400)
  } catch (e) {
    console.error('Vector match API error:', e)
    return jsonResponse({ error: String(e) }, 500)
  }
}

/**
 * 计算单个匹配
 */
async function handleCalculateMatch(body: {
  user1Id: string
  user2Id: string
  user1Answers?: any
  user2Answers?: any
}): Promise<Response> {
  const { user1Id, user2Id, user1Answers: providedUser1Answers, user2Answers: providedUser2Answers } = body

  let user1Answers = providedUser1Answers
  let user2Answers = providedUser2Answers

  if (!user1Answers || !user2Answers) {
    // 从数据库获取问卷答案
    const user1Data = await fetchUserAnswers(user1Id)
    const user2Data = await fetchUserAnswers(user2Id)

    if (!user1Data || !user2Data) {
      return jsonResponse({ 
        error: 'User questionnaire answers not found',
        user1Found: !!user1Data,
        user2Found: !!user2Data
      }, 404)
    }

    user1Answers = user1Data.questionnaire_answers
    user2Answers = user2Data.questionnaire_answers
  }

  // 计算匹配
  const result = calculateMatchV2(user1Answers, user2Answers, user1Id, user2Id)

  return jsonResponse({
    success: true,
    match: result
  })
}

/**
 * 批量匹配
 */
async function handleBatchMatch(body: {
  currentUserId: string
  currentUserAnswers: any
  candidateIds?: string[]
}): Promise<Response> {
  let { currentUserId, currentUserAnswers, candidateIds } = body

  if (!currentUserAnswers) {
    const userData = await fetchUserAnswers(currentUserId)
    if (!userData) {
      return jsonResponse({ error: 'User not found' }, 404)
    }
    currentUserAnswers = userData.questionnaire_answers
  }

  // 获取候选人数据
  let candidates: Array<{ userId: string; answers: any }> = []

  if (candidateIds && candidateIds.length > 0) {
    // 指定候选人
    for (const id of candidateIds) {
      const data = await fetchUserAnswers(id)
      if (data?.questionnaire_answers) {
        candidates.push({
          userId: id,
          answers: data.questionnaire_answers
        })
      }
    }
  } else {
    // 获取所有已完成问卷的候选人
    const allUsers = await fetchAllCompletedUsers(currentUserId)
    candidates = allUsers
      .filter((u: any) => u.questionnaire_answers)
      .map((u: any) => ({
        userId: u.id,
        answers: u.questionnaire_answers
      }))
  }

  if (candidates.length === 0) {
    return jsonResponse({
      success: true,
      matches: [],
      message: 'No candidates with questionnaire found'
    })
  }

  // 批量匹配
  const matches = batchMatchV2(
    currentUserAnswers,
    currentUserId,
    candidates
  )

  return jsonResponse({
    success: true,
    matches,
    count: matches.length
  })
}

/**
 * 向量化用户
 */
async function handleVectorize(body: {
  userId: string
  answers: any
}): Promise<Response> {
  let { userId, answers } = body

  if (!answers) {
    const userData = await fetchUserAnswers(userId)
    if (!userData) {
      return jsonResponse({ error: 'User not found' }, 404)
    }
    answers = userData.questionnaire_answers
  }

  // 向量化
  const vector = vectorizeUserFromQuestionnaire(userId, { answers })

  // 尝试更新数据库
  try {
    await updateUserVector(userId, vector)
  } catch (e) {
    console.warn('Failed to update vector in database:', e)
  }

  return jsonResponse({
    success: true,
    vector: {
      userId: vector.userId,
      dimensions: {
        personality: vector.personalityVector.length,
        values: vector.valuesVector.length,
        interests: vector.interestsVector.length,
        lifestyle: vector.lifestyleVector.length,
        total: vector.combinedVector.length
      },
      completenessScore: vector.completenessScore,
      reliabilityScore: vector.reliabilityScore,
      calculatedAt: vector.calculatedAt
    }
  })
}

/**
 * 列出匹配结果
 */
async function handleListMatches(url: URL): Promise<Response> {
  const userId = url.searchParams.get('userId')
  const limit = parseInt(url.searchParams.get('limit') || '10')
  
  if (!userId) {
    return jsonResponse({ error: 'userId required' }, 400)
  }

  // 获取当前用户答案
  const userData = await fetchUserAnswers(userId)
  if (!userData?.questionnaire_answers) {
    return jsonResponse({
      success: true,
      matches: [],
      message: 'User has not completed questionnaire'
    })
  }

  // 获取其他已完成问卷的用户
  const candidates = await fetchAllCompletedUsers(userId)
  
  // 批量匹配
  const matches = batchMatchV2(
    userData.questionnaire_answers,
    userId,
    candidates
      .filter((u: any) => u.questionnaire_answers && u.id !== userId)
      .map((u: any) => ({
        userId: u.id,
        answers: u.questionnaire_answers
      }))
  ).slice(0, limit)

  // 获取用户详细信息
  const enrichedMatches = await Promise.all(
    matches.map(async (match) => {
      const userInfo = await fetchUserInfo(match.matchedUserId)
      return {
        ...match,
        user: userInfo
      }
    })
  )

  return jsonResponse({
    success: true,
    matches: enrichedMatches,
    count: enrichedMatches.length
  })
}

// ============================================
// 辅助函数
// ============================================

async function fetchUserAnswers(userId: string): Promise<any> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=id,questionnaire_answers,questionnaire_completed`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    )

    if (!response.ok) return null
    
    const data = await response.json()
    return data?.[0]
  } catch (e) {
    console.error('Fetch user answers error:', e)
    return null
  }
}

async function fetchAllCompletedUsers(excludeUserId?: string): Promise<any[]> {
  try {
    let query = `${SUPABASE_URL}/rest/v1/users?select=id,questionnaire_answers,questionnaire_completed,nickname,age,city,occupation,education,avatar&questionnaire_completed=eq.true&limit=50`
    
    if (excludeUserId) {
      query += `&id=neq.${excludeUserId}`
    }

    const response = await fetch(query, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    })

    if (!response.ok) return []
    
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Fetch all users error:', e)
    return []
  }
}

async function fetchUserInfo(userId: string): Promise<any> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=id,nickname,age,city,occupation,education,avatar`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    )

    if (!response.ok) return null
    
    const data = await response.json()
    return data?.[0]
  } catch (e) {
    console.error('Fetch user info error:', e)
    return null
  }
}

async function updateUserVector(userId: string, vector: any): Promise<boolean> {
  try {
    const serialized = {
      personality_vector: JSON.stringify(vector.personalityVector),
      values_vector: JSON.stringify(vector.valuesVector),
      interests_vector: JSON.stringify(vector.interestsVector),
      lifestyle_vector: JSON.stringify(vector.lifestyleVector),
      combined_vector: JSON.stringify(vector.combinedVector),
      vector_calculated_at: vector.calculatedAt.toISOString(),
      vector_version: vector.version,
      vector_quality_score: vector.completenessScore,
      questionnaire_complete: vector.completenessScore > 70
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serialized)
      }
    )

    return response.ok
  } catch (e) {
    console.error('Update vector error:', e)
    return false
  }
}

function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
}
