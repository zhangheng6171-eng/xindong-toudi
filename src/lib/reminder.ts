/**
 * 心动投递 - 消息提醒工具
 */

export interface Reminder {
  id: string
  conversationId: string
  targetUserId: string
  message: string
  remindAt: Date
  createdAt: Date
  triggered: boolean
}

// 设置提醒
export function setReminder(reminder: Omit<Reminder, 'id' | 'createdAt' | 'triggered'>): Reminder {
  const newReminder: Reminder = {
    ...reminder,
    id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    triggered: false,
  }

  // 保存到 localStorage
  const reminders = getReminders()
  reminders.push(newReminder)
  localStorage.setItem('xindong_reminders', JSON.stringify(reminders))

  // 设置定时器
  scheduleReminder(newReminder)

  return newReminder
}

// 获取所有提醒
export function getReminders(): Reminder[] {
  const json = localStorage.getItem('xindong_reminders')
  if (!json) return []
  
  try {
    const reminders = JSON.parse(json)
    return reminders.map((r: any) => ({
      ...r,
      remindAt: new Date(r.remindAt),
      createdAt: new Date(r.createdAt),
    }))
  } catch {
    return []
  }
}

// 删除提醒
export function deleteReminder(reminderId: string): void {
  const reminders = getReminders()
  const filtered = reminders.filter(r => r.id !== reminderId)
  localStorage.setItem('xindong_reminders', JSON.stringify(filtered))
}

// 标记提醒已触发
export function markReminderTriggered(reminderId: string): void {
  const reminders = getReminders()
  const index = reminders.findIndex(r => r.id === reminderId)
  if (index !== -1) {
    reminders[index].triggered = true
    localStorage.setItem('xindong_reminders', JSON.stringify(reminders))
  }
}

// 设置定时提醒
function scheduleReminder(reminder: Reminder): void {
  const now = Date.now()
  const targetTime = new Date(reminder.remindAt).getTime()
  const delay = targetTime - now

  if (delay > 0) {
    setTimeout(() => {
      triggerReminder(reminder)
    }, delay)
  }
}

// 触发提醒
function triggerReminder(reminder: Reminder): void {
  // 请求通知权限
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('心动投递提醒', {
      body: reminder.message,
      icon: '/icon-192x192.png',
    })
  }

  // 标记已触发
  markReminderTriggered(reminder.id)

  // 触觉反馈
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100])
  }
}

// 初始化提醒系统
export function initReminderSystem(): void {
  const reminders = getReminders()
  
  // 为未触发的提醒设置定时器
  reminders
    .filter(r => !r.triggered && new Date(r.remindAt) > new Date())
    .forEach(scheduleReminder)
}
