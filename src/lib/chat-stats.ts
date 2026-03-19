/**
 * 心动投递 - 聊天统计工具
 */

export interface ChatStats {
  totalMessages: number
  textMessages: number
  imageMessages: number
  firstMessageDate: Date | null
  lastMessageDate: Date | null
  averageMessagesPerDay: number
  mostActiveHour: number
  mostActiveDay: string
}

// 计算聊天统计
export function calculateChatStats(messages: Array<{
  timestamp: Date
  type: 'text' | 'image' | 'system'
}>): ChatStats {
  if (messages.length === 0) {
    return {
      totalMessages: 0,
      textMessages: 0,
      imageMessages: 0,
      firstMessageDate: null,
      lastMessageDate: null,
      averageMessagesPerDay: 0,
      mostActiveHour: 0,
      mostActiveDay: '',
    }
  }

  const textMessages = messages.filter(m => m.type === 'text').length
  const imageMessages = messages.filter(m => m.type === 'image').length

  const sortedByDate = [...messages].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  const firstMessageDate = new Date(sortedByDate[0].timestamp)
  const lastMessageDate = new Date(sortedByDate[sortedByDate.length - 1].timestamp)

  // 计算平均每天消息数
  const daysDiff = Math.max(1, Math.ceil(
    (lastMessageDate.getTime() - firstMessageDate.getTime()) / (1000 * 60 * 60 * 24)
  ))
  const averageMessagesPerDay = messages.length / daysDiff

  // 找出最活跃的小时
  const hourCounts: Record<number, number> = {}
  messages.forEach(msg => {
    const hour = new Date(msg.timestamp).getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })
  const mostActiveHour = parseInt(
    Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '0'
  )

  // 找出最活跃的星期
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const dayCounts: Record<number, number> = {}
  messages.forEach(msg => {
    const day = new Date(msg.timestamp).getDay()
    dayCounts[day] = (dayCounts[day] || 0) + 1
  })
  const mostActiveDayIndex = parseInt(
    Object.entries(dayCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '0'
  )
  const mostActiveDay = dayNames[mostActiveDayIndex]

  return {
    totalMessages: messages.length,
    textMessages,
    imageMessages,
    firstMessageDate,
    lastMessageDate,
    averageMessagesPerDay: Math.round(averageMessagesPerDay * 10) / 10,
    mostActiveHour,
    mostActiveDay,
  }
}

// 格式化统计信息
export function formatStats(stats: ChatStats): string {
  if (stats.totalMessages === 0) {
    return '暂无聊天记录'
  }

  const lines = [
    `📊 聊天统计`,
    ``,
    `💬 总消息数: ${stats.totalMessages}`,
    `📝 文本消息: ${stats.textMessages}`,
    `🖼️ 图片消息: ${stats.imageMessages}`,
    ``,
    `📅 第一次聊天: ${formatDate(stats.firstMessageDate)}`,
    `📅 最近聊天: ${formatDate(stats.lastMessageDate)}`,
    ``,
    `📈 平均每天: ${stats.averageMessagesPerDay} 条`,
    `⏰ 最活跃时间: ${stats.mostActiveHour}:00`,
    `📆 最活跃日: ${stats.mostActiveDay}`,
  ]

  return lines.join('\n')
}

function formatDate(date: Date | null): string {
  if (!date) return '无'
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
