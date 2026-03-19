# 心动投递 - 聊天功能使用说明

## 功能概述

聊天功能已完全实现，支持：
- 用户互相喜欢后可以发送消息
- 实时消息发送和接收
- 消息本地存储（支持离线使用）
- 话题推荐和快捷回复

## 部署信息

- **线上地址**: https://xindong-toudi.pages.dev
- **GitHub**: https://github.com/zhangheng6171-eng/xindong-toudi

## 使用流程

1. 注册/登录账号
2. 在首页浏览用户，点击"喜欢"
3. 当双方互相喜欢后，可以点击"发消息"
4. 进入聊天页面，开始聊天

## 技术架构

### 前端
- Next.js 15 + React 18
- TailwindCSS + Framer Motion
- localStorage 本地存储

### 后端 API (Cloudflare Functions)
- `/api/chat/conversations` - 获取会话列表
- `/api/chat/create` - 创建新会话
- `/api/chat/messages` - 获取消息历史
- `/api/chat/send` - 发送消息

### 数据存储
- 优先使用 Cloudflare KV（需配置）
- 自动降级到 localStorage（开箱即用）

## 配置 Cloudflare KV（可选）

如需启用云存储，在 Cloudflare Dashboard 中：

1. 创建 KV 命名空间
2. 在 Pages 设置中绑定：`XINDONG_KV`
3. 重新部署即可自动启用

## 注意事项

- 当前使用 localStorage 作为默认存储
- 消息仅在本地保存，换设备不会同步
- 配置 KV 后可实现云端存储
