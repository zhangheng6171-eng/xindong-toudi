import { generateStaticParams } from './params'
import ChatContent from './content'

export { generateStaticParams }

export default function ChatPage({ params }: { params: Promise<{ matchId: string }> }) {
  return <ChatContent params={params} />
}
