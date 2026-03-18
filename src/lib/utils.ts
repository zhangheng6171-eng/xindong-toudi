import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getCompatibilityEmoji(score: number): string {
  if (score >= 95) return "💫✨"
  if (score >= 90) return "💫"
  if (score >= 80) return "💕"
  if (score >= 70) return "💝"
  if (score >= 60) return "💗"
  return "💓"
}

export function getCompatibilityLabel(score: number): string {
  if (score >= 95) return "灵魂伴侣"
  if (score >= 90) return "天作之合"
  if (score >= 80) return "完美契合"
  if (score >= 70) return "非常合拍"
  if (score >= 60) return "值得尝试"
  return "有缘相见"
}

export function getZodiacSign(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "白羊座"
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "金牛座"
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return "双子座"
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return "巨蟹座"
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "狮子座"
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "处女座"
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return "天秤座"
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return "天蝎座"
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return "射手座"
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "摩羯座"
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "水瓶座"
  return "双鱼座"
}

export function calculateAge(birthDate: Date | string): number {
  const today = new Date()
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
