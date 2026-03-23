# 微信登录功能说明

## 概述

本项目实现了基于微信开放平台的网页授权登录功能。

## 前提条件

1. 已在 [微信开放平台](https://open.weixin.qq.com) 注册开发者账号
2. 已创建网页应用并获取 `AppID` 和 `AppSecret`
3. 已配置授权回调域

## 配置步骤

### 1. 复制配置模板

```bash
cp .env.wechat .env.local
```

### 2. 编辑 .env.local，填入真实配置

```
WECHAT_APP_ID=你的微信AppID
WECHAT_APP_SECRET=你的微信AppSecret
WECHAT_REDIRECT_URI=https://你的域名/api/auth/wechat/callback
JWT_SECRET=你的JWT密钥
```

### 3. 执行数据库迁移

在 Supabase SQL 编辑器中执行：
```bash
supabase/migrations/20240323_wechat_login.sql
```

或者手动执行：
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS wechat_openid TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS wechat_unionid TEXT;
CREATE INDEX IF NOT EXISTS idx_users_wechat_openid ON users(wechat_openid);
```

### 4. 在微信开放平台配置授权回调域

登录微信开放平台 -> 应用管理 -> 你的应用 -> 开发配置

设置授权回调域：`xindong-toudi.pages.dev`

## 微信开放平台配置

### 注册应用
1. 访问 https://open.weixin.qq.com
2. 注册开发者账号
3. 创建网页应用
4. 提交审核（需要企业认证）

### 配置授权回调域
- 必须使用已备案的域名
- 回调地址必须URL编码

## 登录流程

```
用户点击微信登录
    ↓
前端调用 /api/auth/wechat/login 获取授权URL
    ↓
跳转微信授权页面
    ↓
用户授权后，微信回调 /api/auth/wechat/callback
    ↓
后端用code换取access_token
    ↓
用access_token获取用户信息
    ↓
查找或创建用户，返回JWT
    ↓
前端保存token和用户信息，跳转到仪表盘
```

## API 接口

### 获取微信授权URL
- **URL**: `/api/auth/wechat/login`
- **方法**: GET
- **响应**: 
```json
{
  "success": true,
  "authUrl": "https://open.weixin.qq.com/...",
  "state": "xxx"
}
```

### 微信回调处理
- **URL**: `/api/auth/wechat/callback`
- **方法**: GET
- **参数**: code, state

## 注意事项

1. **安全**: state参数用于防止CSRF攻击，10分钟内有效
2. **隐私**: 微信用户需主动授权才能获取昵称和头像
3. **unionid**: 需要绑定微信开放平台和微信公众平台才能获取unionid
4. **测试**: 微信开放平台应用需审核通过才能使用

## 常见问题

### Q: 微信登录提示"redirect_uri参数错误"
A: 检查授权回调域是否与微信开放平台配置一致

### Q: 无法获取用户昵称和头像
A: 用户需要在微信授权页主动授权

### Q: 登录失败，提示"scope参数错误"
A: 检查scope参数是否正确，网页应用使用 snsapi_login
