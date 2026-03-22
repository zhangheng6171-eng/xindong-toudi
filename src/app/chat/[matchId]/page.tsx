import { generateStaticParams } from './params'

export { generateStaticParams }

// 重定向组件
function RedirectPage({ params }: { params: Promise<{ matchId: string }> }) {
  // 动态导入客户端组件
  const { RedirectComponent } = require('./RedirectComponent')
  return <RedirectComponent params={params} />
}

export default RedirectPage
