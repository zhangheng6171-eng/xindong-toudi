/**
 * 心动投递 - 阅后即焚消息
 */

export interface SnapMessage {
  id: string
  content: string // 可能是文本或图片base64
  type: 'text' | 'image'
  createdAt: Date
  viewedAt?: Date
  expiresAt: Date
  viewerId: string
}

// 创建阅后即焚消息
export function createSnapMessage(
  content: string,
  type: 'text' | 'image',
  viewerId: string,
  expiresInSeconds: number = 30
): SnapMessage {
  const now = new Date()
  return {
    id: `snap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    content,
    type,
    createdAt: now,
    expiresAt: new Date(now.getTime() + expiresInSeconds * 1000),
    viewerId
  }
}

// 检查消息是否过期
export function isSnapExpired(snap: SnapMessage): boolean {
  return new Date() > snap.expiresAt
}

// 获取剩余时间（秒）
export function getSnapRemainingTime(snap: SnapMessage): number {
  const now = new Date()
  const remaining = snap.expiresAt.getTime() - now.getTime()
  return Math.max(0, Math.floor(remaining / 1000))
}

// 保存阅后即焚消息
export function saveSnapMessage(snap: SnapMessage): void {
  const snaps = getSnapMessages()
  snaps.push(snap)
  localStorage.setItem('xindong_snaps', JSON.stringify(snaps))
}

// 获取所有阅后即焚消息
export function getSnapMessages(): SnapMessage[] {
  const json = localStorage.getItem('xindong_snaps')
  if (!json) return []
  
  try {
    const snaps = JSON.parse(json)
    return snaps.map((s: any) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      expiresAt: new Date(s.expiresAt),
      viewedAt: s.viewedAt ? new Date(s.viewedAt) : undefined,
    }))
  } catch {
    return []
  }
}

// 删除阅后即焚消息
export function deleteSnapMessage(snapId: string): void {
  const snaps = getSnapMessages()
  const filtered = snaps.filter(s => s.id !== snapId)
  localStorage.setItem('xindong_snaps', JSON.stringify(filtered))
}

// 清理过期消息
export function cleanupExpiredSnaps(): void {
  const snaps = getSnapMessages()
  const valid = snaps.filter(s => !isSnapExpired(s))
  localStorage.setItem('xindong_snaps', JSON.stringify(valid))
}
