/**
 * 心动投递 - 消息通知工具
 */

// 请求通知权限
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('浏览器不支持通知')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// 发送通知
export function sendNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission !== 'granted') {
    return null
  }

  const notification = new Notification(title, {
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    ...options,
  })

  // 点击通知后聚焦窗口
  notification.onclick = () => {
    window.focus()
    notification.close()
  }

  return notification
}

// 新消息通知
export function notifyNewMessage(senderName: string, message: string) {
  return sendNotification(`${senderName} 发来了新消息`, {
    body: message.length > 50 ? message.slice(0, 50) + '...' : message,
    tag: 'new-message',
  })
}

// 匹配通知
export function notifyNewMatch(matchName: string, matchScore: number) {
  return sendNotification(`恭喜！与 ${matchName} 匹配成功`, {
    body: `匹配度 ${matchScore}%，快去打招呼吧！`,
    tag: 'new-match',
  })
}
