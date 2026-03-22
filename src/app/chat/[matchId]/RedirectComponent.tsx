'use client'

import { useEffect, useState } from 'react'

export function RedirectComponent({ params }: { params: Promise<{ matchId: string }> }) {
  useEffect(() => {
    Promise.resolve(params).then(p => {
      const url = `/chat/conversation/?userId=${p.matchId}`
      window.location.href = url
    }).catch(() => {
      window.location.href = '/chat/conversation/'
    })
  }, [params])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="animate-pulse text-rose-500">正在跳转...</div>
    </div>
  )
}
