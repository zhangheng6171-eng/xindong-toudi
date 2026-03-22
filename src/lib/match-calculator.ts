/**
 * 心动投递 - 匹配度计算工具
 * 基于问卷答案计算真实的匹配度
 */

// Supabase 配置 - 从环境变量获取
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 核心价值观问题 ID 映射（从问卷页面获取）
const CORE_VALUE_QUESTIONS: Record<number, string> = {
  28: 'children',        // 关于生育孩子
  29: 'loyalty',         // 婚姻中的忠诚
  30: 'living_style',    // 婚后居住方式
  31: 'consumption',     // 消费观
  32: 'finance',         // 家庭财务
  33: 'work_family',     // 工作与家庭
  34: 'family_boundary', // 原生家庭边界
  35: 'religion',        // 宗教信仰
  36: 'marriage_meaning', // 婚姻核心意义
  37: 'politics',        // 社会政治观点
}

// 大五人格问题映射
const PERSONALITY_QUESTIONS = {
  openness: [1, 2, 3],           // 开放性
  conscientiousness: [4, 5, 6],  // 尽责性
  extraversion: [7, 8, 9],       // 外向性
  agreeableness: [10, 11, 12],   // 宜人性
  neuroticism: [13, 14, 15],     // 神经质
}

// 依恋类型问题
const ATTACHMENT_QUESTIONS = [16, 17, 18, 19, 20, 21]

// 生活方式问题
const LIFESTYLE_QUESTIONS = [38, 39, 40, 41, 42, 43, 44, 45]

// 兴趣爱好问题
const INTEREST_QUESTIONS = [58, 59, 60, 61, 62, 63, 64, 65]

// 用户问卷答案类型
export interface UserAnswers {
  [questionId: number]: string | string[] | number
}

// 匹配结果类型
export interface MatchResult {
  userId: string
  compatibility: number
  matchReasons: string[]
  sharedValues: string[]
  sharedInterests: string[]
  details: {
    coreValuesMatch: number
    personalityMatch: number
    lifestyleMatch: number
    interestsMatch: number
  }
}

/**
 * 从 Supabase 获取用户的问卷答案
 */
export async function fetchUserAnswers(userId: string): Promise<UserAnswers | null> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=questionnaire_answers`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    if (data && data.length > 0 && data[0].questionnaire_answers) {
      return data[0].questionnaire_answers
    }
    return null
  } catch (e) {
    console.error('Failed to fetch user answers:', e)
    return null
  }
}

/**
 * 从 localStorage 获取当前用户的问卷答案
 */
export function getLocalUserAnswers(): UserAnswers | null {
  try {
    const saved = localStorage.getItem('questionnaireAnswers')
    if (saved) {
      return JSON.parse(saved)
    }
    return null
  } catch (e) {
    return null
  }
}

/**
 * 计算核心价值观匹配度
 */
function calculateCoreValuesMatch(
  answers1: UserAnswers,
  answers2: UserAnswers
): { score: number; matches: string[] } {
  const matches: string[] = []
  let totalScore = 0
  let count = 0

  // 核心价值观的匹配权重
  const valueLabels: Record<string, string> = {
    children: '生育观念',
    loyalty: '忠诚观念',
    living_style: '居住方式',
    consumption: '消费观',
    finance: '财务管理',
    work_family: '工作家庭平衡',
    family_boundary: '家庭边界',
    religion: '宗教信仰',
    marriage_meaning: '婚姻观',
    politics: '社会观点',
  }

  // 检查每个核心价值观问题
  Object.entries(CORE_VALUE_QUESTIONS).forEach(([qId, trait]) => {
    const id = parseInt(qId)
    const a1 = answers1[id]
    const a2 = answers2[id]

    if (a1 !== undefined && a2 !== undefined) {
      count++
      
      // 对于单选题，完全相同给高分
      if (typeof a1 === 'string' && typeof a2 === 'string') {
        if (a1 === a2) {
          totalScore += 100
          matches.push(`你们在${valueLabels[trait]}上一致`)
        } else {
          // 相邻选项给中等分
          const diff = Math.abs(a1.charCodeAt(0) - a2.charCodeAt(0))
          if (diff === 1) {
            totalScore += 70
          } else if (diff === 2) {
            totalScore += 40
          } else {
            totalScore += 20
          }
        }
      }
    }
  })

  return {
    score: count > 0 ? totalScore / count : 50,
    matches: matches.slice(0, 3), // 返回前3个匹配点
  }
}

/**
 * 计算大五人格匹配度
 */
function calculatePersonalityMatch(
  answers1: UserAnswers,
  answers2: UserAnswers
): number {
  let totalScore = 0
  let count = 0

  // 计算每个维度的相似度
  Object.entries(PERSONALITY_QUESTIONS).forEach(([trait, questionIds]) => {
    const scores1: number[] = []
    const scores2: number[] = []

    questionIds.forEach(qId => {
      const a1 = answers1[qId]
      const a2 = answers2[qId]

      if (typeof a1 === 'string' && typeof a2 === 'string') {
        // 将选项转换为分数 (A=1, B=2, ...)
        scores1.push(a1.charCodeAt(0) - 64)
        scores2.push(a2.charCodeAt(0) - 64)
      }
    })

    if (scores1.length > 0 && scores2.length > 0) {
      const avg1 = scores1.reduce((a, b) => a + b, 0) / scores1.length
      const avg2 = scores2.reduce((a, b) => a + b, 0) / scores2.length
      
      // 计算相似度 (差异越小分数越高)
      const diff = Math.abs(avg1 - avg2)
      const traitScore = Math.max(0, 100 - diff * 20)
      
      // 不同特质有不同的权重
      const weights: Record<string, number> = {
        openness: 0.8,
        conscientiousness: 1.0,
        extraversion: 0.9,  // 外向-内向可以互补
        agreeableness: 1.0,
        neuroticism: 1.2,   // 情绪稳定性很重要
      }

      totalScore += traitScore * (weights[trait] || 1)
      count++
    }
  })

  return count > 0 ? totalScore / count : 50
}

/**
 * 计算依恋风格匹配度
 */
function calculateAttachmentMatch(
  answers1: UserAnswers,
  answers2: UserAnswers
): { score: number; style1: string; style2: string } {
  // 简化的依恋类型判断
  // 问题16-21的组合判断
  const getAttachmentStyle = (answers: UserAnswers): string => {
    // 问题16: 消息回复态度
    // 问题17: 独处反应
    // 问题18: 亲密倾向
    
    const q16 = answers[16] as string
    const q17 = answers[17] as string
    const q18 = answers[18] as string

    // 简化判断逻辑
    if (q16 === 'C' && q17 === 'C') {
      return 'secure' // 安全型
    } else if (q16 === 'A' || q17 === 'A') {
      return 'anxious' // 焦虑型
    } else if (q17 === 'C' || q18 === 'C') {
      return 'avoidant' // 回避型
    }
    return 'secure' // 默认安全型
  }

  const style1 = getAttachmentStyle(answers1)
  const style2 = getAttachmentStyle(answers2)

  // 依恋类型匹配矩阵
  const matchMatrix: Record<string, Record<string, number>> = {
    secure: { secure: 95, anxious: 85, avoidant: 80, fearful: 70 },
    anxious: { secure: 85, anxious: 50, avoidant: 40, fearful: 45 },
    avoidant: { secure: 80, anxious: 40, avoidant: 55, fearful: 45 },
    fearful: { secure: 70, anxious: 45, avoidant: 45, fearful: 40 },
  }

  return {
    score: matchMatrix[style1]?.[style2] || 60,
    style1,
    style2,
  }
}

/**
 * 计算生活方式匹配度
 */
function calculateLifestyleMatch(
  answers1: UserAnswers,
  answers2: UserAnswers
): number {
  let totalScore = 0
  let count = 0

  LIFESTYLE_QUESTIONS.forEach(qId => {
    const a1 = answers1[qId]
    const a2 = answers2[qId]

    if (typeof a1 === 'string' && typeof a2 === 'string') {
      count++
      if (a1 === a2) {
        totalScore += 100
      } else {
        // 相邻选项给较高分
        const diff = Math.abs(a1.charCodeAt(0) - a2.charCodeAt(0))
        totalScore += Math.max(0, 100 - diff * 25)
      }
    }
  })

  return count > 0 ? totalScore / count : 50
}

/**
 * 计算兴趣爱好匹配度
 */
function calculateInterestsMatch(
  answers1: UserAnswers,
  answers2: UserAnswers
): { score: number; shared: string[] } {
  // 收集所有兴趣
  const interests1 = new Set<string>()
  const interests2 = new Set<string>()

  INTEREST_QUESTIONS.forEach(qId => {
    const a1 = answers1[qId]
    const a2 = answers2[qId]

    if (Array.isArray(a1)) {
      a1.forEach(i => interests1.add(i))
    }
    if (Array.isArray(a2)) {
      a2.forEach(i => interests2.add(i))
    }
  })

  // 计算交集
  const shared = Array.from(interests1).filter(i => interests2.has(i))
  const union = new Set([...Array.from(interests1), ...Array.from(interests2)])

  // Jaccard 相似度
  const similarity = union.size > 0 ? shared.length / union.size : 0

  return {
    score: similarity * 100,
    shared: shared.slice(0, 5),
  }
}

/**
 * 生成匹配理由
 */
function generateMatchReasons(
  coreValuesResult: { score: number; matches: string[] },
  personalityScore: number,
  attachmentResult: { score: number; style1: string; style2: string },
  interestsResult: { score: number; shared: string[] },
  answers1: UserAnswers,
  answers2: UserAnswers
): string[] {
  const reasons: string[] = []

  // 核心价值观匹配理由
  reasons.push(...coreValuesResult.matches)

  // 性格匹配理由
  if (personalityScore > 75) {
    reasons.push('你们的性格特质很合拍')
  } else if (personalityScore > 60) {
    reasons.push('性格上有一些互补的空间')
  }

  // 依恋风格匹配理由
  if (attachmentResult.style1 === 'secure' && attachmentResult.style2 === 'secure') {
    reasons.push('你们都有健康的依恋模式')
  } else if (attachmentResult.style1 === 'secure' || attachmentResult.style2 === 'secure') {
    reasons.push('一方能给另一方提供安全感')
  }

  // 兴趣匹配理由
  if (interestsResult.shared.length > 0) {
    reasons.push(`有${interestsResult.shared.length}个共同兴趣`)
  }

  // 特殊问题分析（家庭观念等）
  const q28_1 = answers1[28]
  const q28_2 = answers2[28]
  if (q28_1 === q28_2 && typeof q28_1 === 'string') {
    if (q28_1 === 'A' || q28_1 === 'B') {
      reasons.push('你们都重视家庭和孩子')
    }
  }

  // 消费观
  const q31_1 = answers1[31]
  const q31_2 = answers2[31]
  if (q31_1 === q31_2 && typeof q31_1 === 'string') {
    if (q31_1 === 'A' || q31_1 === 'B') {
      reasons.push('你们的消费观念相似')
    }
  }

  // 默认理由
  if (reasons.length === 0) {
    reasons.push('整体匹配度不错')
    reasons.push('建议进一步了解对方')
  }

  return reasons.slice(0, 4) // 返回最多4个理由
}

/**
 * 提取共同价值观标签
 */
function extractSharedValues(
  answers1: UserAnswers,
  answers2: UserAnswers
): string[] {
  const values: string[] = []

  // 检查核心价值观问题
  const valueMappings: Record<number, { match: string; label: string }> = {
    28: { match: 'A', label: '重视家庭' },
    29: { match: 'A', label: '重视忠诚' },
    31: { match: 'A', label: '节俭持家' },
    33: { match: 'A', label: '家庭优先' },
    36: { match: 'A', label: '重视承诺' },
  }

  Object.entries(valueMappings).forEach(([qId, config]) => {
    const id = parseInt(qId)
    const a1 = answers1[id]
    const a2 = answers2[id]

    if (a1 === config.match || a2 === config.match) {
      values.push(config.label)
    }
  })

  // 去重并返回
  return [...new Set(values)].slice(0, 3)
}

/**
 * 主匹配计算函数
 */
export function calculateMatch(
  answers1: UserAnswers,
  answers2: UserAnswers,
  userId2: string
): MatchResult {
  // 1. 计算各维度匹配度
  const coreValuesResult = calculateCoreValuesMatch(answers1, answers2)
  const personalityScore = calculatePersonalityMatch(answers1, answers2)
  const attachmentResult = calculateAttachmentMatch(answers1, answers2)
  const lifestyleScore = calculateLifestyleMatch(answers1, answers2)
  const interestsResult = calculateInterestsMatch(answers1, answers2)

  // 2. 计算加权总分
  // 权重设置：核心价值观最重要
  const weights = {
    coreValues: 0.35,      // 核心价值观
    personality: 0.25,     // 性格
    attachment: 0.15,      // 依恋风格
    lifestyle: 0.15,       // 生活方式
    interests: 0.10,       // 兴趣爱好
  }

  const totalScore = 
    coreValuesResult.score * weights.coreValues +
    personalityScore * weights.personality +
    attachmentResult.score * weights.attachment +
    lifestyleScore * weights.lifestyle +
    interestsResult.score * weights.interests

  // 3. 生成匹配理由
  const matchReasons = generateMatchReasons(
    coreValuesResult,
    personalityScore,
    attachmentResult,
    interestsResult,
    answers1,
    answers2
  )

  // 4. 提取共同价值观和兴趣
  const sharedValues = extractSharedValues(answers1, answers2)

  return {
    userId: userId2,
    compatibility: Math.round(totalScore),
    matchReasons,
    sharedValues: sharedValues.length > 0 ? sharedValues : ['真诚', '成长'],
    sharedInterests: interestsResult.shared,
    details: {
      coreValuesMatch: Math.round(coreValuesResult.score),
      personalityMatch: Math.round(personalityScore),
      lifestyleMatch: Math.round(lifestyleScore),
      interestsMatch: Math.round(interestsResult.score),
    },
  }
}

/**
 * 批量计算匹配度
 */
export async function calculateMatches(
  currentUserAnswers: UserAnswers,
  otherUsers: Array<{ id: string; questionnaire_answers?: UserAnswers }>
): Promise<MatchResult[]> {
  const results: MatchResult[] = []

  for (const user of otherUsers) {
    if (user.questionnaire_answers) {
      const result = calculateMatch(currentUserAnswers, user.questionnaire_answers, user.id)
      results.push(result)
    }
  }

  // 按匹配度排序
  results.sort((a, b) => b.compatibility - a.compatibility)

  return results
}
