import { Suspense } from 'react'
import { generateStaticParams } from './params'
import ChatContent from './content'

export { generateStaticParams }

export default function ChatPage({ params }: { params: Promise<{ matchId: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="animate-pulse text-rose-500">加载中...</div>
      </div>
    }>
      <ChatContent params={params} />
    </Suspense>
  )
}
