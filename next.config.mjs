/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true, // 静态导出需要
  },
  output: 'export',
  trailingSlash: true,
}

export default nextConfig
