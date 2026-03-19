/**
 * 心动投递 - 聊天历史导出工具
 */

export interface ExportMessage {
  timestamp: string
  sender: string
  content: string
}

// 导出聊天记录为文本
export function exportChatAsText(
  myName: string,
  otherName: string,
  messages: ExportMessage[]
): string {
  const header = `
════════════════════════════════════════
        心动投递 - 聊天记录导出
════════════════════════════════════════

聊天对象：${myName} ❤️ ${otherName}
导出时间：${new Date().toLocaleString('zh-CN')}

────────────────────────────────────────
`

  const body = messages
    .map(msg => {
      const time = new Date(msg.timestamp).toLocaleString('zh-CN')
      return `[${time}] ${msg.sender}：\n${msg.content}\n`
    })
    .join('\n')

  const footer = `
────────────────────────────────────────
          来自「心动投递」- 用AI找到真爱
════════════════════════════════════════
`

  return header + body + footer
}

// 导出聊天记录为JSON
export function exportChatAsJSON(
  myId: string,
  otherId: string,
  messages: ExportMessage[]
): string {
  return JSON.stringify(
    {
      exportTime: new Date().toISOString(),
      participants: [myId, otherId],
      messages: messages,
    },
    null,
    2
  )
}

// 下载文件
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 导出聊天记录
export function exportChat(
  myName: string,
  otherName: string,
  messages: ExportMessage[],
  format: 'txt' | 'json' = 'txt'
) {
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `聊天记录_${myName}_${otherName}_${timestamp}.${format}`

  if (format === 'json') {
    const content = exportChatAsJSON(myName, otherName, messages)
    downloadFile(content, filename, 'application/json')
  } else {
    const content = exportChatAsText(myName, otherName, messages)
    downloadFile(content, filename, 'text/plain;charset=utf-8')
  }
}
