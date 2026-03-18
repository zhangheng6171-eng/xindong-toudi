import { generateStaticParams } from './params'
import MatchResultContent from './content'

export { generateStaticParams }

export default function MatchResultPage({ params }: { params: Promise<{ matchId: string }> }) {
  return <MatchResultContent params={params} />
}
