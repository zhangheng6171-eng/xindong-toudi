import MatchResultContent from './content'

// 预生成静态页面
export async function generateStaticParams() {
  return [
    { matchId: '1' },
    { matchId: '2' },
    { matchId: '3' },
  ]
}

export default function MatchResultPage({ params }: { params: Promise<{ matchId: string }> }) {
  return <MatchResultContent params={params} />
}
