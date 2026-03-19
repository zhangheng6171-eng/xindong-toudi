/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true, // 静态导出需要
  },
  // 移除静态导出模式，改用混合模式
  // output: 'export', // 注释掉以支持 API 路由
  trailingSlash: true,
  // 支持 Cloudflare Pages
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ]
  },
}

export default nextConfig
