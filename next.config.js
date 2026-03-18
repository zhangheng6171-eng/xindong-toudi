/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Cloudflare Pages 配置
  experimental: {
    // 启用 Edge Runtime 支持
  },
}

module.exports = nextConfig
