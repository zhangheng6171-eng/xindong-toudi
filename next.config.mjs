/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // output: 'export', // 移除以支持 API 路由（Vercel 部署）
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
