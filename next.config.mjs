import { setupDevBindings } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
};

// Cloudflare 开发环境配置
if (process.env.NODE_ENV === "development") {
  setupDevBindings({
    bindings: {
      // 可添加 KV、D1、R2 等 Cloudflare 绑定
    },
  });
}

export default nextConfig;
