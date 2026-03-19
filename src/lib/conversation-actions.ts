/**
 * 心动投递 - 会话高级操作
 */

export interface Message {
  id: string
  senderId: string
  text: string
  timestamp: Date
  status: 'sending' | 'sent' | 'read' | 'recalled'
  type: 'text' | 'image' | 'system'
}

export interface ConversationAction {
  id: string
  type: 'delete' | 'block' | 'report' | 'mute' | 'pin'
  conversationId: string
  timestamp: Date
  reason?: string
}

// 置顶会话
export function pinConversation(conversationId: string): void {
  const pinned = getPinnedConversations()
  if (!pinned.includes(conversationId)) {
    pinned.unshift(conversationId)
    localStorage.setItem('xindong_pinned', JSON.stringify(pinned))
  }
}

// 取消置顶
export function unpinConversation(conversationId: string): void {
  const pinned = getPinnedConversations()
  const index = pinned.indexOf(conversationId)
  if (index > -1) {
    pinned.splice(index, 1)
    localStorage.setItem('xindong_pinned', JSON.stringify(pinned))
  }
}

// 获取置顶的会话
export function getPinnedConversations(): string[] {
  const json = localStorage.getItem('xindong_pinned')
  return json ? JSON.parse(json) : []
}

// 静音会话
export function muteConversation(conversationId: string, duration?: number): void {
  const muted = getMutedConversations()
  muted[conversationId] = duration ? Date.now() + duration : Infinity
  localStorage.setItem('xindong_muted', JSON.stringify(muted))
}

// 取消静音
export function unmuteConversation(conversationId: string): void {
  const muted = getMutedConversations()
  delete muted[conversationId]
  localStorage.setItem('xindong_muted', JSON.stringify(muted))
}

// 获取静音的会话
export function getMutedConversations(): Record<string, number> {
  const json = localStorage.getItem('xindong_muted')
  if (!json) return {}
  
  try {
    const muted = JSON.parse(json)
    // 清理过期的静音
    const now = Date.now()
    const valid: Record<string, number> = {}
    for (const [id, expiry] of Object.entries(muted)) {
      if ((expiry as number) > now) {
        valid[id] = expiry as number
      }
    }
    return valid
  } catch {
    return {}
  }
}

// 检查会话是否静音
export function isConversationMuted(conversationId: string): boolean {
  const muted = getMutedConversations()
  const expiry = muted[conversationId]
  return expiry ? expiry > Date.now() : false
}

// 删除会话
export function deleteConversation(conversationId: string, userId: string): void {
  // 删除本地消息
  const chatKey = `xindong_chat_${conversationId}`
  localStorage.removeItem(chatKey)
  
  // 从会话列表移除
  const convKey = `xindong_conversations_${userId}`
  const json = localStorage.getItem(convKey)
  if (json) {
    const conversations = JSON.parse(json)
    const filtered = conversations.filter((c: string) => c !== conversationId)
    localStorage.setItem(convKey, JSON.stringify(filtered))
  }
  
  // 移除置顶和静音状态
  unpinConversation(conversationId)
  unmuteConversation(conversationId)
}

// 举报用户
export function reportUser(
  targetUserId: string,
  reason: string,
  description?: string
): Promise<void> {
  // 在实际项目中，这里应该调用API保存举报记录
  const reports = JSON.parse(localStorage.getItem('xindong_reports') || '[]')
  reports.push({
    targetUserId,
    reason,
    description,
    timestamp: new Date().toISOString(),
  })
  localStorage.setItem('xindong_reports', JSON.stringify(reports))
  
  return Promise.resolve()
}

// 拉黑用户
export function blockUser(targetUserId: string): void {
  const blocked = getBlockedUsers()
  if (!blocked.includes(targetUserId)) {
    blocked.push(targetUserId)
    localStorage.setItem('xindong_blocked', JSON.stringify(blocked))
  }
}

// 取消拉黑
export function unblockUser(targetUserId: string): void {
  const blocked = getBlockedUsers()
  const index = blocked.indexOf(targetUserId)
  if (index > -1) {
    blocked.splice(index, 1)
    localStorage.setItem('xindong_blocked', JSON.stringify(blocked))
  }
}

// 获取拉黑的用户
export function getBlockedUsers(): string[] {
  const json = localStorage.getItem('xindong_blocked')
  return json ? JSON.parse(json) : []
}

// 检查用户是否被拉黑
export function isUserBlocked(userId: string): boolean {
  return getBlockedUsers().includes(userId)
}

// 消息撤回时间限制（毫秒）
export const MESSAGE_RECALL_LIMIT_MS = 2 * 60 * 1000 // 2分钟

// 检查消息是否可以撤回
export function canRecallMessage(message: Message): boolean {
  const now = Date.now()
  const messageTime = new Date(message.timestamp).getTime()
  return (now - messageTime) <= MESSAGE_RECALL_LIMIT_MS && message.status !== 'recalled'
}

// 格式化最后消息时间
export function formatLastMessageTime(date: Date): string {
  const now = new Date()
  const messageDate = new Date(date)
  const diffMs = now.getTime() - messageDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  
  return messageDate.toLocaleDateString('zh-CN', { 
    month: 'short', 
    day: 'numeric' 
  })
}

// 获取会话摘要
export function getConversationSummary(messages: Message[]): {
  totalMessages: number
  todayMessages: number
  lastActive: Date | null
} {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayMessages = messages.filter(m => 
    new Date(m.timestamp) >= today && m.type !== 'system'
  ).length
  
  const lastActive = messages.length > 0 
    ? new Date(messages[messages.length - 1].timestamp)
    : null

  return {
    totalMessages: messages.filter(m => m.type !== 'system').length,
    todayMessages,
    lastActive
  }
}
