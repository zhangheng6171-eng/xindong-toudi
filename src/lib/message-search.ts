/**
 * 心动投递 - 消息搜索工具
 */

export interface SearchResult {
  messageId: string
  content: string
  timestamp: Date
  sender: string
  matchType: 'exact' | 'fuzzy' | 'keyword'
}

// 在消息中搜索关键词
export function searchInMessages(
  messages: Array<{
    id: string
    text: string
    timestamp: Date
    senderId: string
    senderName: string
  }>,
  query: string
): SearchResult[] {
  if (!query.trim()) return []

  const results: SearchResult[] = []
  const lowerQuery = query.toLowerCase()

  messages.forEach(msg => {
    const lowerText = msg.text.toLowerCase()
    
    // 精确匹配
    if (lowerText.includes(lowerQuery)) {
      results.push({
        messageId: msg.id,
        content: msg.text,
        timestamp: msg.timestamp,
        sender: msg.senderName,
        matchType: lowerText === lowerQuery ? 'exact' : 'keyword'
      })
    }
  })

  // 按时间倒序排列
  return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// 高亮搜索结果
export function highlightSearchResult(text: string, query: string): string {
  if (!query.trim()) return text
  
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 text-gray-900 rounded px-0.5">$1</mark>')
}

// 转义正则特殊字符
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
