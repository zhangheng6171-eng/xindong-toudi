/**
 * 心动投递 - 聊天辅助功能库
 * 
 * 提供聊天体验优化的核心功能：
 * - 开场白生成
 * - 话题推荐
 * - 情感分析
 * - 冷场检测
 * - 游戏化互动
 */

// ============================================
// 类型定义
// ============================================

export interface UserProfile {
  id: string
  name: string
  age: number
  city: string
  interests: string[]
  values: string[]
  lifestyle: Record<string, any>
  personality: Record<string, any>
  photos?: string[]
}

export interface MatchContext {
  matchScore: number
  commonInterests: string[]
  sharedValues: string[]
  lifestyleMatch: string[]
  personalityMatch: string
  matchReasons: string[]
}

export interface ChatContext {
  messages: ChatMessage[]
  userA: UserProfile
  userB: UserProfile
  matchContext: MatchContext
  startTime: Date
}

export interface ChatMessage {
  id: string
  senderId: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'gift' | 'game_invite'
}

export interface OpeningLine {
  text: string
  type: 'interest' | 'value' | 'photo' | 'humor' | 'direct'
  confidence: number
  reason: string
}

export interface TopicSuggestion {
  id: string
  content: string
  category: 'interest' | 'lifestyle' | 'value' | 'game' | 'seasonal'
  source: 'profile' | 'trending' | 'ai' | 'universal'
  engagementScore: number
}

export interface SentimentResult {
  tone: 'positive' | 'neutral' | 'negative'
  emotions: {
    joy: number
    interest: number
    confusion: number
    awkward: number
  }
  suggestions: string[]
}

export interface SilenceDetection {
  isSilent: boolean
  silenceLevel: 'none' | 'light' | 'medium' | 'heavy'
  duration: number // minutes
  suggestedAction: 'none' | 'hint' | 'topic' | 'game'
}

// ============================================
// 开场白生成系统
// ============================================

/**
 * 预设开场白模板
 */
const openingTemplates = {
  interest: [
    "看到你也喜欢{interest}，{question}",
    "你们都喜欢{interest}！{question}",
    "发现一个共同点：你们都爱{interest}。{question}",
  ],
  value: [
    "我们都觉得{value}很重要，这点让我很有共鸣",
    "难得遇到同样重视{value}的人{emoji}",
    "{value}这一点真的很重要，你觉得呢？",
  ],
  photo: [
    "你的照片{compliment}！{question}",
    "看到你的照片，{question}",
    "照片里的你{observation}，{question}",
  ],
  humor: [
    "系统说我们{score}%匹配，要不验证一下算法准不准？",
    "听说匹配度高的人，第一句话都会问{random_question}",
    "纠结了半天第一句话说什么，最后决定：Hi！",
  ],
  direct: [
    "其实我很少主动，但看到你的资料觉得一定要认识你",
    "你的{highlight}让我印象很深",
    "想认识你，可以从哪里开始聊？",
  ],
}

const followUpQuestions = {
  interest: [
    "最近有什么特别的体验吗？",
    "有没有什么推荐？",
    "是什么让你开始喜欢这个的？",
    "有什么有趣的经历可以分享吗？",
  ],
  photo: [
    "是在哪里拍的呀？",
    "当时的氛围一定很棒吧？",
    "感觉你很享受那一刻！",
    "能感受到你的快乐！",
  ],
}

const compliments = [
  "拍得很有感觉",
  "笑容很治愈",
  "很有生活气息",
  "看起来很有趣",
]

const observations = [
  "看起来很开心",
  "很有活力",
  "很有气质",
  "很自然",
]

/**
 * 生成个性化开场白
 */
export function generateOpeningLines(
  userA: UserProfile,
  userB: UserProfile,
  matchContext: MatchContext
): OpeningLine[] {
  const lines: OpeningLine[] = []
  
  // 1. 基于共同兴趣的开场白
  if (matchContext.commonInterests.length > 0) {
    const interest = matchContext.commonInterests[0]
    const template = randomPick(openingTemplates.interest)
    const question = randomPick(followUpQuestions.interest)
    
    lines.push({
      text: template
        .replace('{interest}', interest)
        .replace('{question}', question),
      type: 'interest',
      confidence: 0.9,
      reason: `你们都喜欢${interest}`,
    })
  }
  
  // 2. 基于共同价值观的开场白
  if (matchContext.sharedValues.length > 0) {
    const value = matchContext.sharedValues[0]
    const template = randomPick(openingTemplates.value)
    
    lines.push({
      text: template
        .replace('{value}', value)
        .replace('{emoji}', randomPick(['💕', '✨', '💫', '🌟'])),
      type: 'value',
      confidence: 0.85,
      reason: `你们都重视${value}`,
    })
  }
  
  // 3. 基于照片的开场白
  if (userB.photos && userB.photos.length > 0) {
    const template = randomPick(openingTemplates.photo)
    const compliment = randomPick(compliments)
    const question = randomPick(followUpQuestions.photo)
    
    lines.push({
      text: template
        .replace('{compliment}', compliment)
        .replace('{observation}', randomPick(observations))
        .replace('{question}', question),
      type: 'photo',
      confidence: 0.8,
      reason: '真诚的赞美更容易打开话题',
    })
  }
  
  // 4. 幽默型开场白
  lines.push({
    text: randomPick(openingTemplates.humor)
      .replace('{score}', String(matchContext.matchScore))
      .replace('{random_question}', randomPick([
        '今天吃了啥',
        '最近在追什么剧',
        '周末喜欢做什么',
      ])),
    type: 'humor',
    confidence: 0.7,
    reason: '轻松幽默，降低压力',
  })
  
  // 5. 真诚直接型
  const highlight = matchContext.matchReasons[0] || '资料'
  lines.push({
    text: randomPick(openingTemplates.direct).replace('{highlight}', highlight),
    type: 'direct',
    confidence: 0.75,
    reason: '真诚最能打动人',
  })
  
  // 按置信度排序，返回前3个
  return lines.sort((a, b) => b.confidence - a.confidence).slice(0, 3)
}

/**
 * 生成破冰问题
 */
export function generateIceBreakers(
  difficulty: 'easy' | 'medium' | 'deep' = 'easy',
  context?: MatchContext
): string[] {
  const iceBreakerPool = {
    easy: [
      "如果你可以瞬间学会一项新技能，你最想学什么？",
      "最近让你感到开心的一件小事是什么？",
      "你理想中的周末是怎么度过的？",
      "如果可以和任何一位名人共进晚餐，你会选谁？",
      "你最近在听什么歌？有推荐的吗？",
      "你喜欢猫还是狗？为什么？",
      "如果有一天完全自由，你会怎么安排？",
      "你觉得自己的哪个优点最被低估？",
    ],
    medium: [
      "你觉得什么样的相处模式最舒服？",
      "你最近在为什么事情而努力？",
      "有什么事是你一直想做但还没做的？",
      "你觉得生活中最重要的三样东西是什么？",
      "你最喜欢自己的哪个特质？",
      "什么事情会让你特别有成就感？",
      "你理想中的完美约会是什么样的？",
      "你觉得什么是好的沟通？",
    ],
    deep: [
      "对你来说，什么是'值得'的人生？",
      "你觉得两个人在一起最重要的是什么？",
      "你希望五年后的自己是什么样子？",
      "什么事情是你绝对不会妥协的？",
      "你觉得爱情中最重要的是什么？",
      "你如何看待人生中的遗憾？",
    ],
  }
  
  const pool = iceBreakerPool[difficulty]
  
  // 如果有匹配上下文，可以基于此定制问题
  if (context) {
    // 例如：基于共同兴趣定制
    if (context.commonInterests.includes('旅行')) {
      pool.push("如果可以去世界上任何一个地方，你最想去哪里？")
    }
  }
  
  return shuffleArray(pool).slice(0, 3)
}

// ============================================
// 话题引导系统
// ============================================

/**
 * 热门话题池
 */
const hotTopics = {
  seasonal: [
    { content: "春天来了，有什么踏青计划吗？", emoji: "🌸" },
    { content: "最近天气变暖了，喜欢户外活动吗？", emoji: "☀️" },
    { content: "这个季节有什么好吃的推荐吗？", emoji: "🍓" },
  ],
  trending: [
    { content: "最近有什么好看的电影推荐吗？", emoji: "🎬" },
    { content: "最近在追什么剧？", emoji: "📺" },
    { content: "有在玩什么有趣的游戏吗？", emoji: "🎮" },
  ],
  universal: [
    { content: "你最喜欢的解压方式是什么？", emoji: "💆" },
    { content: "如果有一天完全自由，你会怎么安排？", emoji: "🌈" },
    { content: "你最近学到了什么有趣的事？", emoji: "💡" },
    { content: "你觉得自己最像什么动物？", emoji: "🐱" },
    { content: "如果能拥有超能力，你想要什么？", emoji: "⚡" },
  ],
}

/**
 * 基于资料的话题生成
 */
export function generateProfileTopics(
  userA: UserProfile,
  userB: UserProfile,
  matchContext: MatchContext
): TopicSuggestion[] {
  const topics: TopicSuggestion[] = []
  
  // 基于共同兴趣
  matchContext.commonInterests.forEach(interest => {
    const questions = getInterestQuestions(interest)
    questions.forEach(q => {
      topics.push({
        id: `interest-${interest}-${Date.now()}`,
        content: q,
        category: 'interest',
        source: 'profile',
        engagementScore: 0.9,
      })
    })
  })
  
  // 基于生活方式
  if (userB.lifestyle.sleep_schedule) {
    const sleepTopic = generateSleepTopic(userA.lifestyle.sleep_schedule, userB.lifestyle.sleep_schedule)
    if (sleepTopic) {
      topics.push({
        id: `lifestyle-sleep-${Date.now()}`,
        content: sleepTopic,
        category: 'lifestyle',
        source: 'profile',
        engagementScore: 0.7,
      })
    }
  }
  
  // 基于城市
  if (userA.city === userB.city) {
    topics.push({
      id: `city-${Date.now()}`,
      content: `都在${userB.city}，你平时喜欢去哪些地方？`,
      category: 'lifestyle',
      source: 'profile',
      engagementScore: 0.85,
    })
  }
  
  return topics
}

/**
 * 生成话题推荐
 */
export function generateTopicSuggestions(
  context: ChatContext,
  limit: number = 5
): TopicSuggestion[] {
  const topics: TopicSuggestion[] = []
  
  // 1. 基于资料的话题
  const profileTopics = generateProfileTopics(
    context.userA,
    context.userB,
    context.matchContext
  )
  topics.push(...profileTopics)
  
  // 2. 热门话题
  hotTopics.trending.forEach(topic => {
    topics.push({
      id: `trending-${Date.now()}-${Math.random()}`,
      content: topic.content,
      category: 'seasonal',
      source: 'trending',
      engagementScore: 0.6,
    })
  })
  
  // 3. 通用话题
  hotTopics.universal.forEach(topic => {
    topics.push({
      id: `universal-${Date.now()}-${Math.random()}`,
      content: topic.content,
      category: 'interest',
      source: 'universal',
      engagementScore: 0.5,
    })
  })
  
  // 4. 游戏话题
  topics.push({
    id: `game-truth-${Date.now()}`,
    content: "来玩个游戏？真心话大冒险怎么样？",
    category: 'game',
    source: 'ai',
    engagementScore: 0.8,
  })
  
  // 排序并返回
  return topics
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, limit)
}

/**
 * 根据兴趣生成相关问题
 */
function getInterestQuestions(interest: string): string[] {
  const interestQuestionMap: Record<string, string[]> = {
    '旅行': [
      "你们都喜欢旅行！最近去过什么印象深刻的地方吗？",
      "旅行中发生过什么有趣的事吗？",
      "最想去但还没去的地方是哪里？",
    ],
    '音乐': [
      "你们都喜欢音乐！最近在听什么歌？",
      "有没有推荐的歌手或乐队？",
      "最喜欢哪种类型的音乐？",
    ],
    '电影': [
      "最近有什么好看的电影推荐吗？",
      "你最喜欢什么类型的电影？",
      "印象最深的电影是哪部？",
    ],
    '运动': [
      "你们都喜欢运动！平时喜欢什么运动？",
      "有坚持运动的习惯吗？怎么保持的？",
      "运动对你来说意味着什么？",
    ],
    '读书': [
      "最近在读什么书？有推荐的吗？",
      "什么类型的书最吸引你？",
      "有哪本书对你影响很大？",
    ],
    '美食': [
      "你们都爱美食！有什么推荐的餐厅吗？",
      "最喜欢哪种菜系？",
      "会自己做饭吗？拿手菜是什么？",
    ],
  }
  
  return interestQuestionMap[interest] || [
    `你们都喜欢${interest}！可以分享一下你的体验吗？`,
  ]
}

/**
 * 基于作息生成话题
 */
function generateSleepTopic(scheduleA: string, scheduleB: string): string | null {
  if (scheduleA === scheduleB) {
    if (scheduleA === 'early') {
      return "我们都是早起的人！早上一般做什么？"
    } else if (scheduleA === 'night') {
      return "我们都是夜猫子！晚上一般几点睡？"
    }
  } else if (scheduleA === 'early' && scheduleB === 'night') {
    return "你是夜猫子我是早起型，正好互补！你的晚间时光一般怎么度过？"
  }
  return null
}

// ============================================
// 冷场检测系统
// ============================================

/**
 * 检测聊天是否冷场
 */
export function detectSilence(context: ChatContext): SilenceDetection {
  const now = new Date()
  const messages = context.messages.filter(m => m.type === 'text')
  
  if (messages.length === 0) {
    return {
      isSilent: false,
      silenceLevel: 'none',
      duration: 0,
      suggestedAction: 'none',
    }
  }
  
  const lastMessage = messages[messages.length - 1]
  const timeSinceLastMessage = (now.getTime() - lastMessage.timestamp.getTime()) / 60000 // minutes
  
  // 检测短回复
  const recentMessages = messages.slice(-6)
  const shortReplies = recentMessages.filter(m => 
    m.content.length <= 5 && 
    ['嗯', '好的', '哦', '哈哈', '嗯嗯', 'ok'].includes(m.content)
  )
  
  // 判断沉默等级
  if (timeSinceLastMessage < 3 && shortReplies.length < 3) {
    return {
      isSilent: false,
      silenceLevel: 'none',
      duration: timeSinceLastMessage,
      suggestedAction: 'none',
    }
  }
  
  if (timeSinceLastMessage >= 3 && timeSinceLastMessage < 5) {
    return {
      isSilent: true,
      silenceLevel: 'light',
      duration: timeSinceLastMessage,
      suggestedAction: 'hint',
    }
  }
  
  if (timeSinceLastMessage >= 5 && timeSinceLastMessage < 10) {
    return {
      isSilent: true,
      silenceLevel: 'medium',
      duration: timeSinceLastMessage,
      suggestedAction: 'topic',
    }
  }
  
  if (timeSinceLastMessage >= 10 || shortReplies.length >= 3) {
    return {
      isSilent: true,
      silenceLevel: 'heavy',
      duration: timeSinceLastMessage,
      suggestedAction: 'game',
    }
  }
  
  return {
    isSilent: false,
    silenceLevel: 'none',
    duration: timeSinceLastMessage,
    suggestedAction: 'none',
  }
}

/**
 * 获取冷场恢复建议
 */
export function getSilenceRecovery(
  detection: SilenceDetection,
  context: ChatContext
): string[] {
  const suggestions: string[] = []
  
  switch (detection.silenceLevel) {
    case 'light':
      suggestions.push(
        "对方可能正在忙，可以稍后再继续聊",
        "分享一张有趣的照片可能会重新开启话题",
      )
      break
      
    case 'medium':
      const topics = generateTopicSuggestions(context, 2)
      suggestions.push(...topics.map(t => t.content))
      break
      
    case 'heavy':
      suggestions.push(
        "也许可以邀请对方玩个小游戏？",
        "分享一件今天发生的趣事",
        "问对方一个有趣的问题，比如：" + randomPick([
          "如果能穿越时空，你想去哪个年代？",
          "你最近学到的最有意思的事是什么？",
        ]),
      )
      break
  }
  
  return suggestions
}

// ============================================
// 情感分析系统
// ============================================

/**
 * 分析聊天情感
 */
export function analyzeSentiment(messages: ChatMessage[]): SentimentResult {
  // 简化的情感分析（实际应用中可接入AI服务）
  const recentMessages = messages.slice(-10)
  const content = recentMessages.map(m => m.content).join(' ')
  
  // 积极词汇
  const positiveWords = [
    '哈哈', '好开心', '太棒了', '喜欢', '有趣', '谢谢', '厉害', 
    '不错', '真好', '同意', '也是', '对呀', '嗯嗯', '哇',
  ]
  
  // 消极词汇
  const negativeWords = [
    '无聊', '尴尬', '不知道', '算了', '无语', '烦', '累',
  ]
  
  // 困惑词汇
  const confusedWords = [
    '？', '什么意思', '不懂', '为什么', '怎么会', 
  ]
  
  let positiveCount = 0
  let negativeCount = 0
  let confusedCount = 0
  
  positiveWords.forEach(word => {
    if (content.includes(word)) positiveCount++
  })
  
  negativeWords.forEach(word => {
    if (content.includes(word)) negativeCount++
  })
  
  confusedWords.forEach(word => {
    if (content.includes(word)) confusedCount++
  })
  
  // 计算情感分数
  const joy = Math.min(1, positiveCount * 0.2)
  const confusion = Math.min(1, confusedCount * 0.15)
  const awkward = Math.min(1, negativeCount * 0.25)
  const interest = Math.max(0, 1 - awkward - confusion)
  
  // 判断整体氛围
  let tone: 'positive' | 'neutral' | 'negative' = 'neutral'
  if (joy > 0.3 && awkward < 0.2) {
    tone = 'positive'
  } else if (awkward > 0.3 || negativeCount > positiveCount * 2) {
    tone = 'negative'
  }
  
  // 生成建议
  const suggestions = generateSentimentSuggestions(tone, { joy, interest, confusion, awkward })
  
  return {
    tone,
    emotions: { joy, interest, confusion, awkward },
    suggestions,
  }
}

/**
 * 根据情感生成建议
 */
function generateSentimentSuggestions(
  tone: 'positive' | 'neutral' | 'negative',
  emotions: { joy: number; interest: number; confusion: number; awkward: number }
): string[] {
  const suggestions: string[] = []
  
  if (tone === 'positive') {
    suggestions.push(
      "聊天氛围很好！继续保持",
      "可以尝试更深入的话题",
    )
  } else if (tone === 'negative') {
    if (emotions.awkward > 0.3) {
      suggestions.push(
        "换个轻松的话题试试",
        "分享一件有趣的事",
      )
    }
  } else {
    if (emotions.confusion > 0.2) {
      suggestions.push("试着更清晰地表达")
    }
    if (emotions.interest < 0.3) {
      suggestions.push("也许可以聊点对方感兴趣的话题")
    }
  }
  
  return suggestions
}

// ============================================
// 游戏化互动
// ============================================

export interface GameQuestion {
  id: string
  question: string
  difficulty: 'light' | 'medium' | 'deep'
  category: string
}

/**
 * 真心话问题池
 */
const truthQuestions: GameQuestion[] = [
  { id: 't1', question: "你最近一次发自内心的笑是什么时候？", difficulty: 'light', category: 'daily' },
  { id: 't2', question: "你觉得自己的哪个优点最被低估？", difficulty: 'light', category: 'self' },
  { id: 't3', question: "什么事情会让你特别有成就感？", difficulty: 'medium', category: 'life' },
  { id: 't4', question: "你理想中的完美约会是什么样的？", difficulty: 'medium', category: 'love' },
  { id: 't5', question: "你觉得爱情中最重要的是什么？", difficulty: 'deep', category: 'love' },
  { id: 't6', question: "有什么事是你很想做但不敢做的？", difficulty: 'deep', category: 'dream' },
  { id: 't7', question: "你最喜欢的放松方式是什么？", difficulty: 'light', category: 'lifestyle' },
  { id: 't8', question: "你觉得什么是好的沟通？", difficulty: 'medium', category: 'relationship' },
]

/**
 * 获取真心话问题
 */
export function getTruthQuestions(
  difficulty?: 'light' | 'medium' | 'deep',
  count: number = 3
): GameQuestion[] {
  let pool = truthQuestions
  
  if (difficulty) {
    pool = pool.filter(q => q.difficulty === difficulty)
  }
  
  return shuffleArray(pool).slice(0, count)
}

/**
 * 默契度测试问题
 */
export interface CompatibilityQuestion {
  id: string
  question: string
  options: string[]
  category: string
}

const compatibilityQuestions: CompatibilityQuestion[] = [
  {
    id: 'c1',
    question: "周末更倾向于怎么度过？",
    options: ['在家休息', '户外活动', '和朋友聚会', '学习充电'],
    category: 'lifestyle',
  },
  {
    id: 'c2',
    question: "面对压力时，你会？",
    options: ['独处消化', '找人倾诉', '转移注意力', '直接面对'],
    category: 'personality',
  },
  {
    id: 'c3',
    question: "你觉得更重要的品质是？",
    options: ['诚实', '善良', '幽默', '责任心'],
    category: 'values',
  },
]

/**
 * 获取默契度测试问题
 */
export function getCompatibilityQuestions(count: number = 5): CompatibilityQuestion[] {
  return shuffleArray(compatibilityQuestions).slice(0, count)
}

/**
 * 计算默契度
 */
export function calculateCompatibility(
  answersA: Record<string, string>,
  answersB: Record<string, string>
): { score: number; matches: string[]; differences: string[] } {
  const questionIds = Object.keys(answersA)
  let matchCount = 0
  const matches: string[] = []
  const differences: string[] = []
  
  questionIds.forEach(id => {
    if (answersA[id] === answersB[id]) {
      matchCount++
      matches.push(id)
    } else {
      differences.push(id)
    }
  })
  
  const score = Math.round((matchCount / questionIds.length) * 100)
  
  return { score, matches, differences }
}

// ============================================
// 纪念日系统
// ============================================

export interface Milestone {
  type: 'first_match' | 'first_message' | 'days_together'
  date: Date
  days: number
  message: string
  emoji: string
}

/**
 * 计算里程碑
 */
export function calculateMilestones(
  matchDate: Date,
  firstMessageDate?: Date
): Milestone[] {
  const milestones: Milestone[] = []
  const now = new Date()
  const daysSinceMatch = Math.floor((now.getTime() - matchDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // 特定天数的里程碑
  const milestoneDays = [1, 7, 14, 30, 60, 90, 100, 180, 365]
  
  milestoneDays.forEach(days => {
    if (daysSinceMatch >= days) {
      milestones.push({
        type: 'days_together',
        date: new Date(matchDate.getTime() + days * 24 * 60 * 60 * 1000),
        days,
        message: getMilestoneMessage(days),
        emoji: getMilestoneEmoji(days),
      })
    }
  })
  
  return milestones
}

function getMilestoneMessage(days: number): string {
  const messages: Record<number, string> = {
    1: "第一天认识，希望是个美好的开始！",
    7: "认识一周啦！🎉",
    14: "两周了，你们聊了很多有趣的话题",
    30: "一个月了！时间过得真快",
    60: "两个月了，希望你们越来越了解彼此",
    90: "三个月了！这可是个值得庆祝的日子",
    100: "认识100天啦！百日快乐！🎊",
    180: "半年了，你们的缘分在延续",
    365: "一年了！这是一个特别的日子！💕",
  }
  return messages[days] || `认识${days}天了`
}

function getMilestoneEmoji(days: number): string {
  if (days <= 7) return '🌱'
  if (days <= 30) return '🌿'
  if (days <= 100) return '🌳'
  if (days <= 365) return '❤️'
  return '💕'
}

// ============================================
// 工具函数
// ============================================

function randomPick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

/**
 * 格式化聊天时间
 */
export function formatChatTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

/**
 * 生成聊天统计
 */
export function generateChatStats(messages: ChatMessage[], userId: string) {
  const userMessages = messages.filter(m => m.senderId === userId)
  const otherMessages = messages.filter(m => m.senderId !== userId)
  
  // 计算平均回复时间
  const replyTimes: number[] = []
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].senderId === userId && messages[i - 1].senderId !== userId) {
      const diff = messages[i].timestamp.getTime() - messages[i - 1].timestamp.getTime()
      replyTimes.push(diff / 60000) // minutes
    }
  }
  
  const avgReplyTime = replyTimes.length > 0
    ? Math.round(replyTimes.reduce((a, b) => a + b, 0) / replyTimes.length)
    : 0
  
  return {
    totalMessages: messages.length,
    userMessages: userMessages.length,
    otherMessages: otherMessages.length,
    avgReplyTime,
    messageRatio: userMessages.length / (otherMessages.length || 1),
  }
}
