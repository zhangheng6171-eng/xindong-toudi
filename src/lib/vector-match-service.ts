/**
 * 心动投递 - 向量匹配服务 V2
 * 
 * 整合向量化和匹配算法，提供完整的匹配服务
 */

import { 
  vectorizeUserFromQuestionnaire,
  serializeVector,
  deserializeVector,
  UserVector
} from './user-vectorization'
import { 
  AdvancedMatcherV2,
  calculateMatchV2,
  batchMatchV2,
  batchMatchWithVectors,
  type MatchScoreV2,
  type MatchConfigV2,
  DEFAULT_CONFIG_V2
} from './matching-algorithm-v2'
import type { UserAnswers } from './match-calculator'

// ============================================
// 类型定义
// ============================================

export interface VectorMatchResult {
  success: boolean
  matches: MatchScoreV2[]
  userVector?: UserVector
  error?: string
}

export interface VectorUpdateResult {
  success: boolean
  userId: string
  vector?: UserVector
  error?: string
}

// ============================================
// 配置
// ============================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// ============================================
// 向量服务类
// ============================================

export class VectorMatchService {
  private supabaseUrl: string
  private supabaseKey: string
  private matcher: AdvancedMatcherV2

  constructor(
    supabaseUrl?: string,
    supabaseKey?: string,
    config?: Partial<MatchConfigV2>
  ) {
    this.supabaseUrl = supabaseUrl || SUPABASE_URL
    this.supabaseKey = supabaseKey || SUPABASE_ANON_KEY
    this.matcher = new AdvancedMatcherV2(config)
  }

  // ============================================
  // 向量更新
  // ============================================

  /**
   * 更新用户的向量（基于问卷答案）
   */
  async updateUserVector(
    userId: string,
    answers: UserAnswers
  ): Promise<VectorUpdateResult> {
    try {
      // 1. 向量化
      const vector = vectorizeUserFromQuestionnaire(userId, { answers })
      
      // 2. 序列化
      const serialized = serializeVector(vector)
      
      // 3. 更新数据库
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/users?id=eq.${userId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(serialized)
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to update vector:', errorText)
        return {
          success: false,
          userId,
          error: errorText
        }
      }

      return {
        success: true,
        userId,
        vector
      }
    } catch (e) {
      console.error('Update vector error:', e)
      return {
        success: false,
        userId,
        error: String(e)
      }
    }
  }

  /**
   * 批量更新用户向量
   */
  async batchUpdateVectors(
    users: Array<{ userId: string; answers: UserAnswers }>
  ): Promise<VectorUpdateResult[]> {
    const results: VectorUpdateResult[] = []
    
    for (const user of users) {
      const result = await this.updateUserVector(user.userId, user.answers)
      results.push(result)
    }
    
    return results
  }

  // ============================================
  // 向量检索
  // ============================================

  /**
   * 获取用户的向量
   */
  async getUserVector(userId: string): Promise<UserVector | null> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/users?id=eq.${userId}&select=id,personality_vector,values_vector,interests_vector,lifestyle_vector,combined_vector,vector_calculated_at,vector_version,vector_quality_score`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        }
      )

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      if (!data || data.length === 0) {
        return null
      }

      return deserializeVector(userId, data[0])
    } catch (e) {
      console.error('Get vector error:', e)
      return null
    }
  }

  /**
   * 获取多个用户的向量
   */
  async getUserVectors(userIds: string[]): Promise<UserVector[]> {
    if (userIds.length === 0) {
      return []
    }

    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/users?id=in.(${userIds.join(',')})&select=id,personality_vector,values_vector,interests_vector,lifestyle_vector,combined_vector,vector_calculated_at,vector_version,vector_quality_score`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        }
      )

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      if (!Array.isArray(data)) {
        return []
      }

      return data
        .map(record => deserializeVector(record.id, record))
        .filter((v): v is UserVector => v !== null)
    } catch (e) {
      console.error('Get vectors error:', e)
      return []
    }
  }

  /**
   * 获取所有已向量化用户的向量
   */
  async getAllVectorizedUsers(
    limit: number = 100,
    excludeUserId?: string
  ): Promise<UserVector[]> {
    try {
      let query = `${this.supabaseUrl}/rest/v1/users?select=id,personality_vector,values_vector,interests_vector,lifestyle_vector,combined_vector,vector_calculated_at,vector_version,vector_quality_score,questionnaire_completed&questionnaire_completed=eq.true&limit=${limit}`
      
      if (excludeUserId) {
        query += `&id=neq.${excludeUserId}`
      }

      const response = await fetch(query, {
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        }
      })

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      if (!Array.isArray(data)) {
        return []
      }

      return data
        .map(record => deserializeVector(record.id, record))
        .filter((v): v is UserVector => v !== null && v.completenessScore > 0)
    } catch (e) {
      console.error('Get all vectors error:', e)
      return []
    }
  }

  // ============================================
  // 匹配计算
  // ============================================

  /**
   * 使用预存向量进行匹配
   */
  async matchWithVectors(
    currentUserId: string,
    topN: number = 10
  ): Promise<VectorMatchResult> {
    try {
      // 1. 获取当前用户向量
      const currentUserVector = await this.getUserVector(currentUserId)
      if (!currentUserVector) {
        return {
          success: false,
          matches: [],
          error: 'Current user vector not found'
        }
      }

      // 2. 获取候选用户向量
      const candidateVectors = await this.getAllVectorizedUsers(100, currentUserId)
      if (candidateVectors.length === 0) {
        return {
          success: false,
          matches: [],
          error: 'No candidates found',
          userVector: currentUserVector
        }
      }

      // 3. 执行匹配
      const matches = batchMatchWithVectors(
        currentUserVector,
        candidateVectors
      ).slice(0, topN)

      return {
        success: true,
        matches,
        userVector: currentUserVector
      }
    } catch (e) {
      console.error('Match with vectors error:', e)
      return {
        success: false,
        matches: [],
        error: String(e)
      }
    }
  }

  /**
   * 使用问卷答案进行匹配（自动向量化）
   */
  async matchWithAnswers(
    currentUserId: string,
    currentUserAnswers: UserAnswers,
    topN: number = 10
  ): Promise<VectorMatchResult> {
    try {
      // 1. 先更新当前用户向量
      await this.updateUserVector(currentUserId, currentUserAnswers)

      // 2. 获取其他用户的问卷答案
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/users?id=neq.${currentUserId}&select=id,questionnaire_answers,questionnaire_completed&questionnaire_completed=eq.true&limit=100`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        }
      )

      if (!response.ok) {
        return {
          success: false,
          matches: [],
          error: 'Failed to fetch candidates'
        }
      }

      const candidates = await response.json()
      if (!Array.isArray(candidates) || candidates.length === 0) {
        return {
          success: false,
          matches: [],
          error: 'No candidates found'
        }
      }

      // 3. 批量匹配
      const matches = batchMatchV2(
        currentUserAnswers,
        currentUserId,
        candidates
          .filter((c: any) => c.questionnaire_answers)
          .map((c: any) => ({
            userId: c.id,
            answers: c.questionnaire_answers
          }))
      ).slice(0, topN)

      return {
        success: true,
        matches
      }
    } catch (e) {
      console.error('Match with answers error:', e)
      return {
        success: false,
        matches: [],
        error: String(e)
      }
    }
  }

  // ============================================
  // 缓存管理
  // ============================================

  /**
   * 缓存匹配结果
   */
  async cacheMatchResult(
    userId: string,
    matchedUserId: string,
    result: MatchScoreV2
  ): Promise<boolean> {
    try {
      const cacheEntry = {
        user1_id: userId,
        user2_id: matchedUserId,
        total_score: result.totalScore,
        personality_score: result.personalityMatch,
        values_score: result.valuesMatch,
        interests_score: result.interestsMatch,
        lifestyle_score: result.lifestyleMatch,
        complementarity_bonus: result.complementarityBonus,
        match_reasons: JSON.stringify(result.matchReasons),
        shared_traits: JSON.stringify(result.sharedTraits),
        complementary_traits: JSON.stringify(result.complementaryTraits),
        long_term_stability: result.longTermStability,
        satisfaction_prediction: result.satisfactionPrediction,
        risk_factors: JSON.stringify(result.riskFactors),
        strength_factors: JSON.stringify(result.strengthFactors),
        cached_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7天后过期
      }

      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/match_cache`,
        {
          method: 'POST',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(cacheEntry)
        }
      )

      return response.ok
    } catch (e) {
      console.error('Cache match result error:', e)
      return false
    }
  }

  /**
   * 获取缓存的匹配结果
   */
  async getCachedMatchResult(
    userId: string,
    matchedUserId: string
  ): Promise<MatchScoreV2 | null> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/match_cache?or=(and(user1_id.eq.${userId},user2_id.eq.${matchedUserId}),and(user1_id.eq.${matchedUserId},user2_id.eq.${userId}))&expires_at=gt.${new Date().toISOString()}&limit=1`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        }
      )

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      if (!data || data.length === 0) {
        return null
      }

      const cached = data[0]
      return {
        userId: cached.user1_id,
        matchedUserId: cached.user2_id,
        personalityMatch: cached.personality_score,
        valuesMatch: cached.values_score,
        interestsMatch: cached.interests_score,
        lifestyleMatch: cached.lifestyle_score,
        complementarityBonus: cached.complementarity_bonus,
        totalScore: cached.total_score,
        matchReasons: JSON.parse(cached.match_reasons || '[]'),
        sharedTraits: JSON.parse(cached.shared_traits || '[]'),
        complementaryTraits: JSON.parse(cached.complementary_traits || '[]'),
        longTermStability: cached.long_term_stability,
        satisfactionPrediction: cached.satisfaction_prediction,
        riskFactors: JSON.parse(cached.risk_factors || '[]'),
        strengthFactors: JSON.parse(cached.strength_factors || '[]'),
        metadata: {
          calculatedAt: new Date(cached.cached_at),
          version: '2.0',
          reliability: 80
        }
      }
    } catch (e) {
      console.error('Get cached match result error:', e)
      return null
    }
  }
}

// ============================================
// 单例实例
// ============================================

let vectorMatchServiceInstance: VectorMatchService | null = null

export function getVectorMatchService(
  config?: Partial<MatchConfigV2>
): VectorMatchService {
  if (!vectorMatchServiceInstance) {
    vectorMatchServiceInstance = new VectorMatchService(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      config
    )
  }
  return vectorMatchServiceInstance
}

// ============================================
// 导出便捷函数
// ============================================

export {
  calculateMatchV2,
  batchMatchV2,
  batchMatchWithVectors
}
