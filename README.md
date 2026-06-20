# 交友盲盒 后端服务

基于 Node.js + Express + SQLite 的交友盲盒小程序后端。

## 部署

```bash
npm install
cp .env.example .env
# 编辑 .env 填入真实的微信 AppID/Secret
npm run db:init
npm run db:seed
npm start
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 微信登录 |
| PUT  | /api/auth/user/profile | 更新用户资料 |
| POST | /api/match/create | 创建匹配盲盒 |
| POST | /api/match/reveal | 解锁查看匹配结果 |
| POST | /api/payment/prepay | 预支付 |
| GET  | /api/config/public | 公开配置（审核模式等） |
| GET  | /api/admin/dashboard | 后台仪表盘 |
| GET  | /api/admin/users | 用户列表 |
| GET  | /api/admin/payments | 支付记录 |
| PUT  | /api/admin/settings | 修改设置 |

所有请求需带 header `X-Openid: <openid>`

## 管理员

默认管理员 openid: `test_openid_001`

在 `.env` 的 `ADMIN_OPENIDS` 中添加你自己的 openid。

## 支付模式

- 企业主体：配置 `WX_MCH_ID` 和 `WX_PAY_KEY`，使用真实微信支付
- 非企业/测试：留空则支付自动成功

## 数据库

SQLite，文件 `data.db`，启动时自动创建表结构。
