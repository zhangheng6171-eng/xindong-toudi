import MatchResultContent from './content'

// 预生成示例静态页面
export async function generateStaticParams() {
  return [
    { matchId: 'example' },
  ]
}

export default function MatchResultPage({ params }: { params: Promise<{ matchId: string }> }) {
  return <MatchResultContent params={params} />
}
