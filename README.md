# 交友盲盒 后端服务

基于 Node.js + Express + SQLite 的交友盲盒小程序后端。

## Render 一键部署

1. Fork 此仓库到你的 GitHub
2. 进入 [Render Dashboard](https://dashboard.render.com) → New → Web Service
3. 连接你的 GitHub 仓库，Render 自动识别 `render.yaml`
4. 在 Environment 中添加你的管理员 openid：

```
ADMIN_OPENIDS=你的openid
```

5. 点击 Deploy，部署完成后开放 `https://你的服务.onrender.com/admin.html` 即管理后台

## 本地部署

```bash
npm install
cp .env.example .env
# 编辑 .env 填入真实的微信 AppID/Secret 和管理员 openid
npm run db:init
npm run db:seed
npm start
```

然后浏览器打开 `http://localhost:3001/admin.html`。

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

SQLite，文件路径可通过 `DB_PATH` 环境变量配置，默认 `./data.db`。Render 上自动挂载 1GB 持久磁盘到 `/data`。
