/**
 * 心动投递 - AI匹配算法
 * 
 * 核心匹配算法基于以下维度：
 * 1. 价值观匹配 (30%)
 * 2. 恋爱观匹配 (20%)
 * 3. 未来规划匹配 (15%)
 * 4. 生活方式匹配 (15%)
 * 5. 性格特质匹配 (10%)
 * 6. 兴趣爱好匹配 (5%)
 * 7. 家庭观匹配 (3%)
 * 8. 政治观点匹配 (1%)
 * 9. 底线问题匹配 (1%)
 */

// ============================================
// 类型定义
// ============================================

export interface UserAnswer {
  questionId: string
  questionType: string
  category: string
  answer: any
  weight: number
}

export interface User {
  id: string
  answers: UserAnswer[]
  preferences: MatchPreferences
  history: MatchHistory[]
}

export interface MatchPreferences {
  gender?: string
  ageRange: { min: number; max: number }
  cities: string[]
  education?: string
  heightRange?: { min: number; max: number }
}

export interface MatchHistory {
  matchId: string
  compatibility: number
  outcome: 'viewed' | 'contacted' | 'dated' | 'relationship' | 'no_contact'
  feedback?: {
    rating: number
    wouldMeetAgain: boolean
    whatWentWell?: string
    whatCouldImprove?: string
  }
}

export interface MatchResult {
  userId: string
  matchedUserId: string
  compatibilityScore: number
  matchReasons: string[]
  sharedValues: string[]
  sharedInterests: string[]
  details: {
    valuesScore: number
    relationshipScore: number
    futureScore: number
    lifestyleScore: number
    personalityScore: number
    interestsScore: number
    familyScore: number
    politicalScore: number
    dealbreakerScore: number
  }
}

// ============================================
// 权重配置
// ============================================

const CATEGORY_WEIGHTS: Record<string, number> = {
  'values': 0.30,
  'relationship': 0.20,
  'future': 0.15,
  'lifestyle': 0.15,
  'personality': 0.10,
  'interests': 0.05,
  'family': 0.03,
  'political': 0.01,
  'dealbreaker': 0.01,
}

// 问题权重（某些问题比同类别其他问题更重要）
const QUESTION_WEIGHTS: Record<string, number> = {
  // 价值观核心问题
  'core_values_ranking': 2.0,
  'success_definition': 1.5,
  'money_view': 1.2,
  
  // 恋爱观
  'relationship_goal': 2.0,
  'conflict_handling': 1.5,
  'love_language': 1.5,
  
  // 未来规划
  'children_importance': 2.0,
  'marriage_timing': 1.5,
  'career_plan': 1.2,
  
  // 生活方式
  'social_energy': 1.5,
  'weekend_preference': 1.2,
  'travel_preference': 1.0,
  
  // 性格
  'introvert_extrovert': 1.5,
  'decision_making': 1.2,
  'stress_handling': 1.0,
}

// ============================================
// 核心匹配函数
// ============================================

/**
 * 计算两个用户之间的匹配度
 */
export function calculateCompatibility(
  user1: User,
  user2: User
): MatchResult {
  const categoryScores: Record<string, number> = {}
  const matchReasons: string[] = []
  const sharedValues: string[] = []
  const sharedInterests: string[] = []

  // 按类别分组计算
  const categories = Object.keys(CATEGORY_WEIGHTS)
  
  for (const category of categories) {
    const user1Answers = user1.answers.filter(a => a.category === category)
    const user2Answers = user2.answers.filter(a => a.category === category)
    
    if (user1Answers.length === 0 || user2Answers.length === 0) continue
    
    const score = calculateCategoryScore(user1Answers, user2Answers)
    categoryScores[category] = score
    
    // 收集共同点
    collectCommonalities(user1Answers, user2Answers, category, sharedValues, sharedInterests, matchReasons)
  }

  // 加权计算总分
  let totalScore = 0
  for (const [category, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    if (categoryScores[category] !== undefined) {
      totalScore += categoryScores[category] * weight
    }
  }

  // 应用历史反馈调整
  totalScore = applyFeedbackAdjustment(user1, user2, totalScore)
  
  // 生成匹配理由
  generateMatchReasons(categoryScores, sharedValues, sharedInterests, matchReasons)

  return {
    userId: user1.id,
    matchedUserId: user2.id,
    compatibilityScore: Math.round(totalScore * 100) / 100,
    matchReasons: matchReasons.slice(0, 5), // 最多5条理由
    sharedValues: Array.from(new Set(sharedValues)).slice(0, 5),
    sharedInterests: Array.from(new Set(sharedInterests)).slice(0, 5),
    details: {
      valuesScore: categoryScores['values'] || 0,
      relationshipScore: categoryScores['relationship'] || 0,
      futureScore: categoryScores['future'] || 0,
      lifestyleScore: categoryScores['lifestyle'] || 0,
      personalityScore: categoryScores['personality'] || 0,
      interestsScore: categoryScores['interests'] || 0,
      familyScore: categoryScores['family'] || 0,
      politicalScore: categoryScores['political'] || 0,
      dealbreakerScore: categoryScores['dealbreaker'] || 0,
    }
  }
}

/**
 * 计算单个类别的匹配分数
 */
function calculateCategoryScore(
  answers1: UserAnswer[],
  answers2: UserAnswer[]
): number {
  let totalScore = 0
  let totalWeight = 0

  for (const ans1 of answers1) {
    const ans2 = answers2.find(a => a.questionId === ans1.questionId)
    if (!ans2) continue

    const questionWeight = QUESTION_WEIGHTS[ans1.questionId] || 1.0
    const answerWeight = ans1.weight * ans2.weight
    const combinedWeight = questionWeight * answerWeight

    const similarity = calculateAnswerSimilarity(ans1, ans2)
    totalScore += similarity * combinedWeight
    totalWeight += combinedWeight
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0
}

/**
 * 计算两个答案的相似度
 */
function calculateAnswerSimilarity(
  ans1: UserAnswer,
  ans2: UserAnswer
): number {
  const type = ans1.questionType

  switch (type) {
    case 'single_choice':
      return ans1.answer === ans2.answer ? 1 : 0

    case 'multiple_choice':
      return calculateJaccardSimilarity(
        Array.isArray(ans1.answer) ? ans1.answer : [ans1.answer],
        Array.isArray(ans2.answer) ? ans2.answer : [ans2.answer]
      )

    case 'ranking':
      return calculateRankingSimilarity(
        Array.isArray(ans1.answer) ? ans1.answer : [],
        Array.isArray(ans2.answer) ? ans2.answer : []
      )

    case 'scale':
    case 'slider':
      const diff = Math.abs(Number(ans1.answer) - Number(ans2.answer))
      const maxDiff = type === 'scale' ? 4 : 100
      return 1 - (diff / maxDiff)

    case 'open_text':
      return calculateTextSimilarity(
        String(ans1.answer),
        String(ans2.answer)
      )

    default:
      return 0
  }
}

// ============================================
// 相似度计算方法
// ============================================

/**
 * Jaccard 相似度（用于多选题）
 */
function calculateJaccardSimilarity(set1: string[], set2: string[]): number {
  if (set1.length === 0 && set2.length === 0) return 1
  if (set1.length === 0 || set2.length === 0) return 0

  const intersection = set1.filter(item => set2.includes(item))
  const union = Array.from(new Set([...set1, ...set2]))

  return intersection.length / union.length
}

/**
 * 排序相似度（Spearman相关系数的简化版）
 */
function calculateRankingSimilarity(rank1: string[], rank2: string[]): number {
  if (rank1.length === 0 || rank2.length === 0) return 0

  // 只比较前5个最重要的
  const topN = 5
  const r1 = rank1.slice(0, topN)
  const r2 = rank2.slice(0, topN)

  let score = 0
  for (let i = 0; i < r1.length; i++) {
    const posInR2 = r2.indexOf(r1[i])
    if (posInR2 !== -1) {
      // 越靠前，分数越高
      const positionDiff = Math.abs(i - posInR2)
      score += (topN - positionDiff) / topN
    }
  }

  return score / topN
}

/**
 * 文本相似度（使用简单的关键词匹配）
 * 实际应用中可以使用更复杂的NLP方法
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0

  // 简单的关键词提取
  const keywords1 = extractKeywords(text1)
  const keywords2 = extractKeywords(text2)

  // 使用Jaccard相似度
  return calculateJaccardSimilarity(keywords1, keywords2)
}

/**
 * 关键词提取（简化版）
 */
function extractKeywords(text: string): string[] {
  // 移除标点符号，分词
  const words = text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1)

  // 移除停用词
  const stopWords = new Set([
    '的', '是', '在', '有', '和', '我', '你', '他', '她',
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
  ])

  return words.filter(w => !stopWords.has(w))
}

// ============================================
// 历史反馈调整
// ============================================

/**
 * 根据历史匹配反馈调整分数
 */
function applyFeedbackAdjustment(
  user1: User,
  user2: User,
  baseScore: number
): number {
  if (!user1.history || user1.history.length === 0) return baseScore

  // 分析用户喜欢的匹配对象特征
  const successfulMatches = user1.history.filter(
    h => h.feedback && h.feedback.rating >= 4
  )

  if (successfulMatches.length === 0) return baseScore

  // 这里可以更复杂地分析成功匹配的特征
  // 简化版：如果用户历史上对高匹配度的对象给高分，增强当前分数
  const avgSuccessfulScore = successfulMatches.reduce(
    (sum, m) => sum + m.compatibility,
    0
  ) / successfulMatches.length

  // 如果当前分数接近历史成功匹配的平均分，适当加分
  const diff = Math.abs(baseScore - avgSuccessfulScore)
  if (diff < 10) {
    baseScore += 2
  }

  return Math.min(100, baseScore)
}

// ============================================
// 匹配理由生成
// ============================================

/**
 * 收集共同点
 */
function collectCommonalities(
  answers1: UserAnswer[],
  answers2: UserAnswer[],
  category: string,
  sharedValues: string[],
  sharedInterests: string[],
  matchReasons: string[]
): void {
  for (const ans1 of answers1) {
    const ans2 = answers2.find(a => a.questionId === ans1.questionId)
    if (!ans2) continue

    if (ans1.questionType === 'multiple_choice') {
      const common = (Array.isArray(ans1.answer) ? ans1.answer : [ans1.answer])
        .filter((a: string) => 
          (Array.isArray(ans2.answer) ? ans2.answer : [ans2.answer]).includes(a)
        )

      if (category === 'interests') {
        sharedInterests.push(...common)
      } else if (category === 'values') {
        sharedValues.push(...common)
      }
    }

    if (ans1.questionType === 'single_choice' && ans1.answer === ans2.answer) {
      // 特殊处理某些重要问题的相同答案
      if (ans1.questionId === 'children_importance') {
        matchReasons.push(`你们对孩子的态度一致`)
      }
    }
  }
}

/**
 * 生成匹配理由
 */
function generateMatchReasons(
  categoryScores: Record<string, number>,
  sharedValues: string[],
  sharedInterests: string[],
  matchReasons: string[]
): void {
  // 添加高分类别的理由
  if (categoryScores['values'] >= 80) {
    matchReasons.push('你们在价值观上高度契合')
  }

  if (categoryScores['lifestyle'] >= 75) {
    matchReasons.push('生活节奏和习惯相似')
  }

  if (categoryScores['personality'] >= 70) {
    matchReasons.push('性格互补，可能产生化学反应')
  }

  if (categoryScores['future'] >= 75) {
    matchReasons.push('对未来的规划相似')
  }

  // 添加共同兴趣
  if (sharedInterests.length >= 2) {
    matchReasons.push(`都喜欢${sharedInterests.slice(0, 3).join('、')}`)
  }

  // 添加共同价值观
  if (sharedValues.length >= 2) {
    matchReasons.push(`都重视${sharedValues.slice(0, 2).join('和')}`)
  }
}

// ============================================
// 每周匹配算法
// ============================================

/**
 * 为用户生成每周匹配
 * 
 * @param user 目标用户
 * @param candidatePool 候选用户池
 * @param maxMatches 最大匹配数量
 * @returns 匹配结果列表
 */
export function generateWeeklyMatches(
  user: User,
  candidatePool: User[],
  maxMatches: number = 3
): MatchResult[] {
  // 1. 预筛选：过滤掉不符合基本条件的候选
  const filteredPool = candidatePool.filter(candidate => {
    // 性别匹配
    if (user.preferences.gender && candidate.preferences.gender) {
      if (user.preferences.gender !== candidate.preferences.gender) {
        return false
      }
    }

    // 年龄范围
    // 这里需要从candidate的答案中提取年龄信息

    // 城市匹配
    if (user.preferences.cities.length > 0) {
      // 检查candidate是否在偏好城市
      // 简化处理
    }

    // 排除已经匹配过的人
    const hasMatched = user.history.some(h => h.matchId === candidate.id)
    if (hasMatched) return false

    return true
  })

  // 2. 计算每个候选人的匹配分数
  const scoredCandidates = filteredPool.map(candidate => ({
    candidate,
    result: calculateCompatibility(user, candidate)
  }))

  // 3. 排序并选择top N
  scoredCandidates.sort((a, b) => 
    b.result.compatibilityScore - a.result.compatibilityScore
  )

  // 4. 多样性优化
  // 避免返回过于相似的匹配对象
  const selectedMatches: MatchResult[] = []
  
  for (const { result } of scoredCandidates) {
    if (selectedMatches.length >= maxMatches) break

    // 检查是否与已选择的匹配过于相似
    const tooSimilar = selectedMatches.some(selected => {
      const similarity = calculateResultSimilarity(result, selected)
      return similarity > 0.8 // 80%相似度阈值
    })

    if (!tooSimilar) {
      selectedMatches.push(result)
    }
  }

  return selectedMatches
}

/**
 * 计算两个匹配结果的相似度
 */
function calculateResultSimilarity(r1: MatchResult, r2: MatchResult): number {
  // 简化版：比较匹配理由的重合度
  const reasons1 = new Set(r1.matchReasons)
  const reasons2 = new Set(r2.matchReasons)
  const intersection = Array.from(reasons1).filter(r => reasons2.has(r)).length
  const union = new Set([...Array.from(reasons1), ...Array.from(reasons2)]).size
  
  return union > 0 ? intersection / union : 0
}

// ============================================
// 导出辅助函数
// ============================================

export {
  calculateJaccardSimilarity,
  calculateRankingSimilarity,
  extractKeywords,
}
