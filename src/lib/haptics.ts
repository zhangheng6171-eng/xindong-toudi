/**
 * 心动投递 - 交互反馈工具
 * 声音和振动反馈
 */

// 轻触觉反馈
export function lightHapticFeedback() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10)
  }
}

// 中等触觉反馈
export function mediumHapticFeedback() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([20, 50, 20])
  }
}

// 发送消息反馈
export function sendMessageFeedback() {
  lightHapticFeedback()
}

// 接收消息反馈
export function receiveMessageFeedback() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([10, 30, 10])
  }
}

// 错误反馈
export function errorFeedback() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([50, 30, 50])
  }
}

// 成功反馈
export function successFeedback() {
  mediumHapticFeedback()
}

// 震动模式
export const VIBRATION_PATTERNS = {
  light: 10,
  medium: [20, 50, 20],
  heavy: [50, 30, 50, 30, 50],
  message: [10, 30, 10],
  success: [20, 50, 20],
  error: [50, 30, 50],
}
